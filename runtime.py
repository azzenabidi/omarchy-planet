#!/usr/bin/python3
"""Private runtime state for Omarchy Planet.

All mutable state (pid file, visibility flag, lock, debug log) lives in a
per-user private directory instead of predictable paths in world-writable
/tmp. The directory is created with mode 0700 and verified to be owned by
the current user; every file is opened with O_NOFOLLOW so planted symlinks
fail closed, and created with mode 0600.
"""
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


def runtime_dir():
    """Create (if needed) and return the private 0700 runtime directory."""
    last_error = None
    for base in _candidate_bases():
        path = base / APP_ID
        try:
            path.mkdir(parents=True, exist_ok=True)
            os.chmod(path, 0o700)
            st = os.stat(path)
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
