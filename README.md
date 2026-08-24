# Omarchy Planet

An ASCII/terminal-aesthetic RPG that lives at the wallpaper layer behind your windows, providing an interactive tour of Omarchy features via NPCs, dialog, and interactive objects.

![Omarchy Planet](assets/p1.png)
*Explore the Village, talk to NPCs, and learn about Omarchy*

## Features

- **Interactive NPCs** with sequential dialog teaching Omarchy keybinds and features
- **4 explorable scenes**: Village, Forest (keybinds), Settings Cave (system), Workshop (themes/tools)
- **Live demo buttons**: click `[TRY:*]` signs, crystals, and bench buttons to trigger the real desktop action (panels, theme picker, terminal, screenshots...)
- **8-bit chiptune soundtrack**: separate title and overworld themes, synthesized at runtime with Web Audio API — no audio files
- **Terminal-style aesthetic**: green monospace text on dark background
- **Click-to-move** player character with ASCII sprites
- **Layer shell** integration: sits behind windows at the wallpaper layer
- **Toggle visibility** with `Super+Alt+P`
- **CSV-based dialog** for easy community contributions

## Screenshots

| | | |
|---|---|---|
| ![Screenshot 1](assets/p1.png) | ![Screenshot 2](assets/p2.png) | ![Screenshot 3](assets/p3.png) |

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

That's it! Press `Super+Alt+P` to launch Omarchy Planet.

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
o.bind("SUPER + ALT + P", "Omarchy Planet", "/usr/bin/python3 ~/.config/omarchy/plugins/omarchy-planet/toggle.py")
o.bind("SUPER + CTRL + ALT + P", "Omarchy Planet (Close)", "/usr/bin/python3 ~/.config/omarchy/plugins/omarchy-planet/stop.py")
EOF

# Reload Hyprland
hyprctl reload
```

## Usage

### Keybindings

| Keybind | Action |
|---------|--------|
| `Super+Alt+P` | Toggle Omarchy Planet on/off |
| `Super+Ctrl+Alt+P` | Force close Omarchy Planet |

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
├── runtime.py         # Private 0700 runtime state helpers
├── assets/            # Screenshots and images
├── game/
│   ├── index.html     # Phaser.js entry point
│   ├── vendor/
│   │   └── phaser-3.80.1.min.js  # Vendored engine (SRI-pinned)
│   ├── data/
│   │   └── dialog.csv # All NPC/sign dialog (editable!)
│   └── js/
│       ├── main.js    # Phaser config
│       ├── scenes/    # Boot, Village, Forest, SettingsCave, Workshop
│       ├── entities/  # Player, NPC
│       └── systems/   # Dialog, DialogData, Bridge, DemoButton, Chiptune
└── tests/
    └── test_planet.py # Test suite
```

## Security

- **Vendored engine**: Phaser 3.80.1 is shipped in-repo (`game/vendor/`) — no
  code is fetched from any CDN or network origin at runtime. The vendored
  bytes were reviewed and cross-checked byte-for-byte against the official
  npm registry tarball (`sha256 62081f6a…`).
- **Enforced integrity**: `planet.py` re-hashes the vendored engine before
  loading the page and refuses to start if the bytes differ from the pinned
  digest; `Bridge.js` and `main.js` additionally refuse to boot or post
  bridge messages unless the engine actually loaded. (Page-level SRI is not
  usable here: WebKitGTK blocks integrity-checked subresources on `file://`
  pages.) The desktop-action bridge can never be reached by unverified code.
- **Private runtime state**: pid file, visibility flag, lock, and debug log
  live in `$XDG_RUNTIME_DIR/omarchy-planet` (created `0700`, files `0600`,
  opened `O_NOFOLLOW`) instead of predictable paths in world-writable `/tmp`.

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
