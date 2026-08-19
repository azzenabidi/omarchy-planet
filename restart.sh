#!/bin/bash
# Kill old process and restart Omarchy Planet
PID_FILE="/tmp/omarchy-planet.pid"

if [ -f "$PID_FILE" ]; then
    kill "$(cat $PID_FILE)" 2>/dev/null
    rm -f /tmp/omarchy-planet-*
    sleep 1
fi

/usr/bin/python3 ~/.config/omarchy/plugins/omarchy-planet/toggle.py &
echo "Omarchy Planet restarted"
