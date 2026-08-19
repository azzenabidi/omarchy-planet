class Workshop extends Phaser.Scene {
    constructor() {
        super('Workshop');
    }

    create() {
        this.cameras.main.setBackgroundColor('#221100');
        this.createMap();
        this.createWorkshop();

        this.tinkerer = new NPC(this, 400, 300, 'merchant', 'Tinkerer', [
            'Welcome to the Workshop! I am the Tinkerer.',
            '22 built-in themes: Tokyo Night, Catppuccin, Gruvbox,',
            'Nord, Rose Pine, Ethereal, Everforest, Hackerman,',
            'Osaka Jade, Kanagawa, Lumon, Miasma, Matte Black,',
            'Vantablack, Ristretto, Retro 82, Flexoki Light,',
            'Catppuccin Latte, White, and more at omarchy.org/themes.',
            'Each theme styles: desktop, terminal, neovim, btop,',
            'Chromium, bar, menu, notifications, lock screen.',
            'Custom backgrounds per theme in ~/.config/omarchy/backgrounds/.',
            'More themes at omarchy.org/themes/'
        ]);

        // Shell Tools NPC
        const shellNpc = new NPC(this, 1400, 300, 'elder', 'Shell Master', [
            'SHELL TOOLS included in Omarchy:',
            'fzf (ff): fuzzy find files with preview.',
            'Ctrl+R: fuzzy search command history.',
            'Zoxide: smart cd that remembers directories.',
            'ripgrep (rg): fast content search.',
            'eza: enhanced ls with icons (ls, lt, lsa, lta).',
            'fd: easier find replacement.',
            'bat: cat with syntax highlighting.',
            'tldr: concise man page examples.',
            'yt-dlp: download video from YouTube.',
            'try: date-stamped experiment dirs in ~/Work/tries.'
        ]);

        // Bar & Widgets NPC
        const barNpc = new NPC(this, 900, 500, 'blacksmith', 'Bar Master', [
            'THE BAR can be top, bottom, left, or right.',
            'Super+Shift+Space toggles bar visibility.',
            'Widgets: Menu, Workspaces, Clock, Weather, Audio,',
            'Bluetooth, Network, Power, Display, Tray, Media.',
            'Click Clock for calendar. Right-click to cycle format.',
            'Click Audio for volume panel. Scroll for volume.',
            'Click Weather for forecast popup.',
            'Click Media for play/pause. Scroll for next/prev.',
            'Configure in ~/.config/omarchy/shell.json.',
            'omarchy bar position bottom/left/right/top.',
            'omarchy bar defaults resets to shipped layout.'
        ]);

        this.player = new Player(this, 960, 700);
        this.dialog = new Dialog(this);

        this.add.text(960, 30, '[ WORKSHOP ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        this.add.text(960, 1050, '> Click objects to customize | Click [VILLAGE] to return', {
            fontSize: '12px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);

        // Return portal
        const returnPortal = this.add.text(1890, 540, '[VILLAGE] <', {
            fontSize: '14px',
            fill: '#ffff00',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0.5).setDepth(20).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: returnPortal,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        returnPortal.on('pointerdown', () => {
            this.scene.start('Village');
        });
    }

    createMap() {
        const tileSize = 32;
        const mapWidth = 60;
        const mapHeight = 34;

        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'wood');
            }
        }

        for (let x = 15; x < 45; x++) {
            for (let y = 10; y < 20; y++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'stone');
            }
        }

        for (let x = 0; x < mapWidth; x++) {
            this.add.image(x * tileSize + 16, 0, 'cave');
            this.add.image(x * tileSize + 16, 33 * tileSize + 16, 'cave');
        }
        for (let y = 0; y < mapHeight; y++) {
            this.add.image(0, y * tileSize + 16, 'cave');
            this.add.image(59 * tileSize + 16, y * tileSize + 16, 'cave');
        }
    }

    createWorkshop() {
        const workbench = this.add.image(600, 400, 'workbench');
        workbench.setInteractive({ useHandCursor: true });
        workbench.setScale(2);

        this.add.text(600, 480, '> Theme Picker', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);

        workbench.on('pointerdown', () => {
            this.dialog.show('Workbench', 'Opening Theme Picker...');
            Bridge.openTheme();
        });

        const keyboard = this.add.image(1300, 400, 'keyboard');
        keyboard.setInteractive({ useHandCursor: true });
        keyboard.setScale(2);

        this.add.text(1300, 480, '> Keybind Editor', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);

        keyboard.on('pointerdown', () => {
            this.dialog.show('Keyboard', 'Opening Keybind Settings...');
            Bridge.openKeyboard();
        });
    }

    update() {
        if (this.player) this.player.update();
    }
}
