#!/usr/bin/python3
"""Private runtime state for Omarchy Planet.

All mutable state (pid file, visibility flag, lock, debug log) lives in a
per-user private directory instead of predictable paths in world-writable
/tmp. The directory is created with mode 0700 and verified to be owned by
the current user; every file is opened with O_NOFOLLOW so planted symlinks
fail closed, and created with mode 0600. The directory path itself is
never followed through a symlink: the parent is opened with O_NOFOLLOW
and the directory is created atomically via dir_fd, then lstat'd to
confirm it is not a symlink.
"""
import errno
import os
from pathlib import Path

APP_ID = "omarchy-planet"
_NOFOLLOW = getattr(os, "O_NOFOLLOW", 0)


def _candidate_bases():
    xdg_runtime = os.environ.get("XDG_RUNTIME_DIR")
    if xdg_runtime:
        yield Path(xdg_runtime)
    # Fallback: owner-owned location under $HOME (never world-writable /tmp).
    state_home = os.environ.get("XDG_STATE_HOME") or str(Path.home() / ".local" / "state")
    yield Path(state_home)


def _safe_parent_fd(path):
    """Open the nearest existing ancestor of *path* that is a real directory.

    Walks upward from *path* until an existing directory is found, then
    opens it with O_DIRECTORY | O_NOFOLLOW so that a symlink at any
    component is rejected with ENOTDIR.  Returns (parent_fd, remaining)
    where *remaining* is the relative child path from the opened ancestor
    to the original *path*.

    Raises OSError (ENOENT / ENOTDIR) when no safe ancestor exists.
    """
    parts = []
    cur = path
    while True:
        try:
            fd = os.open(str(cur), os.O_DIRECTORY | _NOFOLLOW)
            return fd, os.path.join(*parts) if parts else path.name
        except OSError as e:
            if e.errno in (errno.ENOENT, errno.ENOTDIR):
                parts.append(cur.name)
                cur = cur.parent
                if cur == cur.parent:
                    raise
                continue
            raise


def runtime_dir():
    """Create (if needed) and return the private 0700 runtime directory.

    The path is never followed through a symlink: the parent directory is
    opened with O_NOFOLLOW and the child is created atomically via
    dir_fd.  The resulting path is lstat'd to confirm it is a real
    directory and not a symlink.  Ownership and permission checks are
    applied to the directory object itself.
    """
    last_error = None
    for base in _candidate_bases():
        path = base / APP_ID
        try:
            parent_fd, child_name = _safe_parent_fd(path)
            try:
                os.mkdir(child_name, 0o700, dir_fd=parent_fd)
            except FileExistsError:
                os.close(parent_fd)
                if os.path.islink(path):
                    os.unlink(path)
                    parent_fd, child_name = _safe_parent_fd(path)
                    os.mkdir(child_name, 0o700, dir_fd=parent_fd)
                    os.close(parent_fd)
                else:
                    pass  # real directory already exists
            else:
                os.close(parent_fd)

            # Reject symlinks at the resolved path.
            st = os.lstat(path)
            if os.path.islink(path):
                raise PermissionError(f"{path} is a symlink")
            if not os.path.isdir(path):
                raise PermissionError(f"{path} is not a directory")
            if st.st_uid != os.getuid():
                raise PermissionError(f"{path} owned by uid {st.st_uid}, not {os.getuid()}")
            if st.st_mode & 0o077:
                raise PermissionError(f"{path} is group/world accessible: {oct(st.st_mode)}")
            return path
        except OSError as e:
            last_error = e
    raise RuntimeError(f"No private runtime directory available for {APP_ID}: {last_error}")


def write_text(name, text):
    """Atomically-enough safe write inside the runtime dir (no symlink follow)."""
    fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | os.O_NOFOLLOW, 0o600)
    try:
        os.write(fd, text.encode())
    finally:
        os.close(fd)


def read_text(name):
    """Read a runtime file; returns None when missing or unreadable."""
    try:
        fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW)
    except OSError:
        return None
    try:
        with os.fdopen(fd, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except OSError:
        return None


def append_line(name, line):
    """Append one line to a runtime log file (no symlink follow)."""
    fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_APPEND | os.O_NOFOLLOW, 0o600)
    try:
        os.write(fd, (line.rstrip("\n") + "\n").encode())
    finally:
        os.close(fd)


def open_lock(name):
    """Open (creating safely) a lock file for use with fcntl.flock."""
    return os.open(name, os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)


def unlink(name):
    try:
        os.unlink(name)
    except OSError:
        pass
