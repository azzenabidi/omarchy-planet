#!/usr/bin/env python3
"""Toggle Omarchy Planet visibility."""
import os
import sys
import signal
from pathlib import Path

STATE_FILE = Path("/tmp/omarchy-planet-state")
PID_FILE = Path("/tmp/omarchy-planet.pid")


def main():
    if not PID_FILE.exists():
        print("Omarchy Planet is not running. Starting it...")
        os.execvp("python3", ["python3", str(Path(__file__).parent / "planet.py")])
        return

    pid = int(PID_FILE.read_text().strip())
    try:
        os.kill(pid, signal.SIGUSR1)
    except ProcessLookupError:
        print("Omarchy Planet process not found. Restarting...")
        PID_FILE.unlink(missing_ok=True)
        os.execvp("python3", ["python3", str(Path(__file__).parent / "planet.py")])


if __name__ == "__main__":
    main()
