#!/usr/bin/python3
"""Start or toggle Omarchy Planet."""
import fcntl
import os
import subprocess
from pathlib import Path

from runtime import open_lock, read_text, runtime_dir, unlink, write_text

PLANET_SCRIPT = Path(__file__).parent / "planet.py"
RUNTIME_DIR = runtime_dir()
PID_FILE = RUNTIME_DIR / "planet.pid"
VISIBLE_FILE = RUNTIME_DIR / "visible"
LOCK_FILE = RUNTIME_DIR / "toggle.lock"


def is_running(pid):
    try:
        os.kill(pid, 0)
        return True
    except (ProcessLookupError, PermissionError):
        return False


def looks_like_planet(cmdline):
    """True when NUL-separated argv bytes belong to a planet.py process."""
    for arg in cmdline.split(b"\0"):
        text = arg.decode("utf-8", errors="replace")
        if text == "planet.py" or text.endswith("/planet.py"):
            return True
    return False


def pid_is_planet(pid):
    """Verify a live PID actually belongs to Omarchy Planet before acting on it.

    Protects against recycled PIDs after a crash left a stale pid file.
    """
    try:
        with open(f"/proc/{pid}/cmdline", "rb") as f:
            cmdline = f.read()
    except OSError:
        return False
    return looks_like_planet(cmdline)


def start():
    env = os.environ.copy()
    env["LD_PRELOAD"] = "/usr/lib/libgtk4-layer-shell.so"
    subprocess.Popen(
        ["/usr/bin/python3", str(PLANET_SCRIPT)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
        env=env
    )


def main():
    # Use file lock to prevent race conditions
    lock_fd = open_lock(LOCK_FILE)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except IOError:
        # Another toggle is in progress
        os.close(lock_fd)
        return

    try:
        pid_text = read_text(PID_FILE)
        if pid_text is not None:
            try:
                pid = int(pid_text.strip())
            except ValueError:
                unlink(PID_FILE)
                start()
                return

            if is_running(pid) and pid_is_planet(pid):
                # Toggle: write opposite of current state
                current = (read_text(VISIBLE_FILE) or "").strip() or "no"

                new_state = "no" if current == "yes" else "yes"
                write_text(VISIBLE_FILE, new_state)
                return

            # Stale or recycled PID: ignore it and start fresh.
            unlink(PID_FILE)

        start()
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)


if __name__ == "__main__":
    main()
