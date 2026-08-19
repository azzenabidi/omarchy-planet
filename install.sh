#!/bin/bash
set -e

PLUGIN_DIR="$HOME/.config/omarchy/plugins/omarchy-planet"
BINDINGS_FILE="$HOME/.config/hypr/bindings.lua"

echo "========================================="
echo "  Installing Omarchy Planet"
echo "========================================="
echo ""

# Check dependencies
echo "Checking dependencies..."

MISSING=()

if ! command -v python3 &>/dev/null; then
    MISSING+=("python")
fi

if ! pkg-config --exists webkitgtk-6.0 2>/dev/null; then
    MISSING+=("webkitgtk-6.0")
fi

if ! python3 -c "import gi; gi.require_version('Gtk', '4.0'); gi.require_version('Gtk4LayerShell', '1.0')" 2>/dev/null; then
    MISSING+=("gtk4-layer-shell python-gobject")
fi

if [ ${#MISSING[@]} -gt 0 ]; then
    echo "Installing missing dependencies: ${MISSING[*]}"
    sudo pacman -S --noconfirm "${MISSING[@]}" 2>/dev/null || {
        echo "Warning: Could not install dependencies automatically."
        echo "Please install manually: sudo pacman -S ${MISSING[*]}"
    }
fi

echo "Dependencies OK."

# Add keybinds if not already present
echo ""
echo "Configuring keybindings..."

if ! grep -q "omarchy-planet" "$BINDINGS_FILE" 2>/dev/null; then
    cat >> "$BINDINGS_FILE" << 'EOF'

-- Omarchy Planet RPG tour
o.bind("SUPER + ALT + P", "Omarchy Planet", "/usr/bin/python3 ~/.config/omarchy/plugins/omarchy-planet/toggle.py")
o.bind("SUPER + CTRL + P", "Omarchy Planet (Close)", "/usr/bin/python3 ~/.config/omarchy/plugins/omarchy-planet/stop.py")
EOF
    echo "Keybinds added: Super+Alt+P (toggle), Super+Ctrl+P (close)"
else
    echo "Keybinds already configured."
fi

# Make scripts executable
chmod +x "$PLUGIN_DIR/toggle.py"
chmod +x "$PLUGIN_DIR/stop.py"
chmod +x "$PLUGIN_DIR/restart.sh"

echo ""
echo "========================================="
echo "  Installation complete!"
echo "========================================="
echo ""
echo "Usage:"
echo "  Super+Alt+P  - Toggle Omarchy Planet"
echo "  Super+Ctrl+P - Close Omarchy Planet"
echo ""
echo "Run 'hyprctl reload' to apply keybindings."
