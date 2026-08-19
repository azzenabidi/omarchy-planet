#!/bin/bash
set -e

PLUGIN_DIR="$HOME/.config/omarchy/plugins/omarchy-planet"
BINDINGS_FILE="$HOME/.config/hypr/bindings.lua"

echo "Installing Omarchy Planet..."

# Install dependencies
echo "Checking dependencies..."
if ! pkg-config --exists webkitgtk-6.0; then
    echo "Installing webkitgtk-6.0..."
    sudo pacman -S --noconfirm webkitgtk-6.0
fi

# Add keybind if not already present
if ! grep -q "omarchy-planet" "$BINDINGS_FILE" 2>/dev/null; then
    echo "Adding Super+P keybind..."
    cat >> "$BINDINGS_FILE" << 'EOF'

-- Omarchy Planet RPG tour
o.bind("SUPER + P", "Omarchy Planet", "python3 ~/.config/omarchy/plugins/omarchy-planet/toggle.py")
EOF
    echo "Keybind added. Restart Hyprland or run: hyprctl reload"
fi

echo "Installation complete!"
echo "Press Super+P to toggle Omarchy Planet"
