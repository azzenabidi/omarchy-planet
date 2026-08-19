#!/usr/bin/python3
"""Start or toggle Omarchy Planet."""
import os
import subprocess
import time
from pathlib import Path

PLANET_SCRIPT = Path(__file__).parent / "planet.py"
PID_FILE = Path("/tmp/omarchy-planet.pid")
VISIBLE_FILE = Path("/tmp/omarchy-planet-visible")


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
    if PID_FILE.exists():
        pid = int(PID_FILE.read_text().strip())
        if is_running(pid):
            # Toggle: write opposite of current state
            if VISIBLE_FILE.exists() and VISIBLE_FILE.read_text().strip() == "yes":
                VISIBLE_FILE.write_text("no")
            else:
                VISIBLE_FILE.write_text("yes")
            return
        else:
            PID_FILE.unlink(missing_ok=True)

    start()


if __name__ == "__main__":
    main()
