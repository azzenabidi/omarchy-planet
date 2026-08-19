#!/usr/bin/python3
"""Toggle Omarchy Planet visibility."""
import os
import subprocess
import time
from pathlib import Path

STATE_FILE = Path("/tmp/omarchy-planet-state")
PID_FILE = Path("/tmp/omarchy-planet.pid")
TOGGLE_FILE = Path("/tmp/omarchy-planet-toggle")
PLANET_SCRIPT = Path(__file__).parent / "planet.py"


def main():
    if not PID_FILE.exists() or not TOGGLE_FILE.parent.exists():
        subprocess.Popen(
            ["/usr/bin/python3", str(PLANET_SCRIPT)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True
        )
        return

    # Check if process is alive
    pid = int(PID_FILE.read_text().strip())
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        PID_FILE.unlink(missing_ok=True)
        subprocess.Popen(
            ["/usr/bin/python3", str(PLANET_SCRIPT)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True
        )
        return

    # Write toggle file with new mtime
    TOGGLE_FILE.write_text(str(time.time()))


if __name__ == "__main__":
    main()
