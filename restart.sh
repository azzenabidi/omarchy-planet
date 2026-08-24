#!/bin/bash
# Kill old process and restart Omarchy Planet
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

/usr/bin/python3 "$DIR/stop.py"
sleep 1
/usr/bin/python3 "$DIR/toggle.py"
echo "Omarchy Planet restarted"
