#!/usr/bin/python3
"""Stop Omarchy Planet."""
import os
from pathlib import Path

PID_FILE = Path("/tmp/omarchy-planet.pid")

if PID_FILE.exists():
    try:
        pid = int(PID_FILE.read_text().strip())
        os.kill(pid, 15)  # SIGTERM
    except (ValueError, ProcessLookupError, PermissionError):
        pass
    PID_FILE.unlink(missing_ok=True)
    Path("/tmp/omarchy-planet-visible").unlink(missing_ok=True)
