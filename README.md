# Omarchy Planet

An ASCII/terminal-aesthetic RPG that lives at the wallpaper layer behind your windows, providing an interactive tour of Omarchy Quattro features via NPCs, dialog, and interactive objects.

## Features

- **Interactive NPCs** with sequential dialog teaching Omarchy keybinds and features
- **4 explorable scenes**: Village, Forest (keybinds), Settings Cave (system), Workshop (themes/tools)
- **Terminal-style aesthetic**: green monospace text on dark background
- **Click-to-move** player character with ASCII sprites
- **Layer shell** integration: sits behind windows at the wallpaper layer
- **Toggle visibility** with `Super+P`
- **CSV-based dialog** for easy community contributions

## Installation

### Option 1: Omarchy Plugin (Recommended)

```bash
omarchy plugin add https://github.com/azzenabidi/omarchy-planet.git
```

Then run the install script to set up dependencies and keybindings:

```bash
~/.config/omarchy/plugins/omarchy-planet/install.sh
hyprctl reload
```

### Option 2: Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/azzenabidi/omarchy-planet ~/.config/omarchy/plugins/omarchy-planet
```

2. Run the install script:
```bash
~/.config/omarchy/plugins/omarchy-planet/install.sh
```

3. Reload Hyprland:
```bash
hyprctl reload
```

## Usage

| Keybind | Action |
|---------|--------|
| `Super+P` | Toggle Omarchy Planet on/off |
| `Super+Ctrl+P` | Force close Omarchy Planet |

### In-Game Controls

- **Click ground** - Move your character
- **Click NPCs** - Start dialog sequence
- **Click dialog** - Advance through dialog lines
- **Click portals** - Travel between scenes
- **Click EXIT** - Kill the game and return to desktop

## Scenes

### Village (Hub)
- **Elder Omarch** - Workspaces, navigation, grouping
- **Blacksmith Tiling** - Window management, resizing, shortcuts
- **Merchant Theme** - Themes, menus, notifications, reminders

### Forest (Keybinds)
7 signposts covering:
- Launching apps (18+ shortcuts)
- More apps (Spotify, Docker, Obsidian, etc.)
- AI & communication (ChatGPT, Signal, WhatsApp)
- Clipboard & input (copy, paste, emoji, calculator)
- Screenshots & recording (screenshot, record, OCR, dictation)
- Notifications & reminders
- System panels (audio, network, bluetooth, display, power)

### Settings Cave (System)
- **Cave Guard** - Settings overview
- **Network Keeper** - Networking, DNS, Tailscale, firewall
- **Display Keeper** - Monitors, scaling, brightness, multi-monitor

### Workshop (Tools)
- **Tinkerer** - 22 built-in themes, backgrounds
- **Shell Master** - fzf, zoxide, ripgrep, eza, fd, bat, tldr
- **Bar Master** - Bar position, widgets, configuration

## Contributing Dialog

All dialog text is stored in `game/data/dialog.csv`. To add or modify content:

1. Edit `game/data/dialog.csv`
2. CSV format:
```csv
scene,id,type,name,line,text,recommendation
Village,new_npc,npc,NPC Name,1,"Dialog text here.",
Village,new_npc,npc,NPC Name,2,"More dialog.",Recommendation text here.
```

3. If adding a new NPC, update the scene file to position it

## Architecture

```
omarchy-planet/
├── planet.py          # GTK4+WebKitGTK layer-shell container
├── toggle.py          # Start/toggle process
├── stop.py            # Kill process
├── install.sh         # Installation script
├── manifest.json      # Omarchy plugin manifest
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
