# Omarchy Planet

An ASCII/terminal-aesthetic RPG that lives at the wallpaper layer behind your windows, providing an interactive tour of Omarchy features via NPCs, dialog, and interactive objects.

![Omarchy Planet - Village Scene](assets/screenshot-village.png)
*Explore the Village, talk to NPCs, and learn about Omarchy*

## Features

- **Interactive NPCs** with sequential dialog teaching Omarchy keybinds and features
- **4 explorable scenes**: Village, Forest (keybinds), Settings Cave (system), Workshop (themes/tools)
- **Terminal-style aesthetic**: green monospace text on dark background
- **Click-to-move** player character with ASCII sprites
- **Layer shell** integration: sits behind windows at the wallpaper layer
- **Toggle visibility** with `Super+P`
- **CSV-based dialog** for easy community contributions

## Screenshots

| Village | Forest | Settings Cave | Workshop |
|---------|--------|---------------|----------|
| ![Village](assets/screenshot-village.png) | ![Forest](assets/screenshot-forest.png) | ![Cave](assets/screenshot-cave.png) | ![Workshop](assets/screenshot-workshop.png) |
| Talk to NPCs to learn Omarchy | Keybind reference signs | System settings guide | Themes and shell tools |

> **Note:** Screenshots coming soon! Run `Super+P` to see it in action.

## Installation

### Quick Install (Recommended)

```bash
# 1. Add the plugin
omarchy plugin add https://github.com/azzenabidi/omarchy-planet.git --enable

# 2. Run the install script (sets up dependencies + keybindings)
~/.config/omarchy/plugins/omarchy-planet/install.sh

# 3. Reload Hyprland
hyprctl reload
```

That's it! Press `Super+P` to launch Omarchy Planet.

### Manual Install

If you prefer to install manually:

```bash
# Clone the repo
git clone https://github.com/azzenabidi/omarchy-planet ~/.config/omarchy/plugins/omarchy-planet

# Install dependencies (Arch Linux)
sudo pacman -S python python-gobject webkitgtk-6.0 gtk4-layer-shell

# Make scripts executable
chmod +x ~/.config/omarchy/plugins/omarchy-planet/{toggle.py,stop.py,install.sh}

# Add keybindings to ~/.config/hypr/bindings.lua
cat >> ~/.config/hypr/bindings.lua << 'EOF'

-- Omarchy Planet RPG tour
o.bind("SUPER + P", "Omarchy Planet", "python3 ~/.config/omarchy/plugins/omarchy-planet/toggle.py")
o.bind("SUPER + CTRL + P", "Omarchy Planet (Close)", "python3 ~/.config/omarchy/plugins/omarchy-planet/stop.py")
EOF

# Reload Hyprland
hyprctl reload
```

## Usage

### Keybindings

| Keybind | Action |
|---------|--------|
| `Super+P` | Toggle Omarchy Planet on/off |
| `Super+Ctrl+P` | Force close Omarchy Planet |

### In-Game Controls

| Control | Action |
|---------|--------|
| Click ground | Move your character |
| Click NPCs | Start dialog sequence |
| Click dialog box | Advance through dialog lines |
| Click portals (yellow) | Travel between scenes |
| Click EXIT sign | Kill the game and return to desktop |

## Scenes

### Village (Hub)
The starting area where you meet friendly NPCs:

| NPC | Teaches |
|-----|---------|
| **Elder Omarch** | Workspaces, navigation, grouping |
| **Blacksmith Tiling** | Window management, resizing, shortcuts |
| **Merchant Theme** | Themes, menus, notifications, reminders |

### Forest (Keybinds)
7 signposts with every keyboard shortcut in Omarchy:
- Launching apps (18+ shortcuts)
- More apps (Spotify, Docker, Obsidian, etc.)
- AI & communication (ChatGPT, Signal, WhatsApp)
- Clipboard & input (copy, paste, emoji, calculator)
- Screenshots & recording (screenshot, record, OCR, dictation)
- Notifications & reminders
- System panels (audio, network, bluetooth, display, power)

### Settings Cave (System)
Learn about system configuration:

| NPC | Teaches |
|-----|---------|
| **Cave Guard** | Settings overview |
| **Network Keeper** | Networking, DNS, Tailscale, firewall |
| **Display Keeper** | Monitors, scaling, brightness, multi-monitor |

### Workshop (Tools)
Discover shell tools and customization:

| NPC | Teaches |
|-----|---------|
| **Tinkerer** | 22 built-in themes, backgrounds |
| **Shell Master** | fzf, zoxide, ripgrep, eza, fd, bat, tldr |
| **Bar Master** | Bar position, widgets, configuration |

## Contributing

### Adding Dialog

All dialog text is stored in `game/data/dialog.csv`. To add or modify content:

1. Edit `game/data/dialog.csv`
2. CSV format:
```csv
scene,id,type,name,line,text,recommendation
Village,new_npc,npc,NPC Name,1,"Dialog text here.",
Village,new_npc,npc,NPC Name,2,"More dialog.",Recommendation text here.
```

3. If adding a new NPC, update the scene file to position it

### Development

```bash
# Run tests
python3 tests/test_planet.py

# Restart the game
bash ~/.config/omarchy/plugins/omarchy-planet/restart.sh
```

## Architecture

```
omarchy-planet/
├── planet.py          # GTK4+WebKitGTK layer-shell container
├── toggle.py          # Start/toggle process
├── stop.py            # Kill process
├── restart.sh         # Restart helper
├── install.sh         # Installation script
├── manifest.json      # Omarchy plugin manifest
├── assets/            # Screenshots and images
├── game/
│   ├── index.html     # Phaser.js entry point
│   ├── data/
│   │   └── dialog.csv # All NPC/sign dialog (editable!)
│   └── js/
│       ├── main.js    # Phaser config
│       ├── scenes/    # Village, Forest, SettingsCave, Workshop
│       ├── entities/  # Player, NPC
│       └── systems/   # Dialog, DialogData, Bridge
└── tests/
    └── test_planet.py # 50 tests
```

## Requirements

- Python 3
- GTK4
- WebKitGTK 6.0
- gtk4-layer-shell
- python-gobject

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

Built for the [Omarchy](https://omarchy.org) community.
