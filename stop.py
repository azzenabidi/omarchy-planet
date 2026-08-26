#!/usr/bin/python3
"""Stop Omarchy Planet."""
import os

from runtime import read_text, runtime_dir, unlink
from toggle import is_running, pid_is_planet

RUNTIME_DIR = runtime_dir()
PID_FILE = RUNTIME_DIR / "planet.pid"
VISIBLE_FILE = RUNTIME_DIR / "visible"

pid_text = read_text(PID_FILE)
if pid_text is not None:
    try:
        pid = int(pid_text.strip())
    except ValueError:
        pid = None

    if pid is not None and is_running(pid) and pid_is_planet(pid):
        os.kill(pid, 15)  # SIGTERM
    # Compare-and-delete: only clear state if no newer instance has
    # taken over the files meanwhile.
    if read_text(PID_FILE) == pid_text:
        unlink(PID_FILE)
        unlink(VISIBLE_FILE)
