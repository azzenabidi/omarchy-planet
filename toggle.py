#!/usr/bin/python3
"""Start or toggle Omarchy Planet."""
import fcntl
import os
import subprocess
import time
from pathlib import Path

PLANET_SCRIPT = Path(__file__).parent / "planet.py"
PID_FILE = Path("/tmp/omarchy-planet.pid")
VISIBLE_FILE = Path("/tmp/omarchy-planet-visible")
LOCK_FILE = Path("/tmp/omarchy-planet.lock")


def is_running(pid):
    try:
        os.kill(pid, 0)
        return True
    except (ProcessLookupError, PermissionError):
        return False


def start():
    subprocess.Popen(
        ["/usr/bin/python3", str(PLANET_SCRIPT)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True
    )


def main():
    # Use file lock to prevent race conditions
    lock_fd = open(LOCK_FILE, 'w')
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except IOError:
        # Another toggle is in progress
        return

    try:
        if PID_FILE.exists():
            try:
                pid = int(PID_FILE.read_text().strip())
            except ValueError:
                PID_FILE.unlink(missing_ok=True)
                start()
                return

            if is_running(pid):
                # Toggle: write opposite of current state
                current = "no"
                if VISIBLE_FILE.exists():
                    try:
                        current = VISIBLE_FILE.read_text().strip()
                    except Exception:
                        pass

                new_state = "no" if current == "yes" else "yes"
                VISIBLE_FILE.write_text(new_state)
                return
            else:
                PID_FILE.unlink(missing_ok=True)

        start()
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        lock_fd.close()


if __name__ == "__main__":
    main()
