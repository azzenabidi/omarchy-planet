class Village extends Phaser.Scene {
    constructor() {
        super('Village');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.createMap();

        this.npcs = [];

        // Elder Omarch - Navigation & Workspaces
        const elder = new NPC(this, 400, 300, 'elder', 'Elder Omarch', [
            'Welcome! I am Elder Omarch, keeper of workspaces.',
            'Omarchy has 10 workspaces. Super+1 through Super+0 to jump.',
            'Super+Tab cycles next, Super+Shift+Tab cycles previous.',
            'Super+Ctrl+Tab returns to your former workspace.',
            'Super+Shift+1-0 moves a window to another workspace (it follows).',
            'Super+Shift+Alt+1-0 moves a window silently (stays on current).',
            'Super+L toggles dwindle vs scrolling layout per-workspace.',
            'Dwindle: all windows visible, shrinks to fit.',
            'Scrolling: windows side-by-side beyond screen edge.',
            'Super+S toggles the Scratchpad, a hidden overlay workspace.',
            'Super+Alt+S sends a window to the scratchpad.',
            'Super+G toggles window grouping. Grouped windows share tile space.',
            'Super+Alt+Tab cycles windows within a group.',
            'Super+Ctrl+Left/Right moves between grouped windows.'
        ]);

        // Blacksmith Tiling - Window Management
        const blacksmith = new NPC(this, 960, 400, 'blacksmith', 'Blacksmith Tiling', [
            'I am the Blacksmith! I forge windows into place.',
            'Windows tile automatically. Super+W closes focused window.',
            'Super+T toggles tiling/floating mode.',
            'Super+F fullscreen. Super+Ctrl+F tiled fullscreen.',
            'Super+Alt+F full width (keeps top bar).',
            'Super+O pops window out as a sticky float.',
            'Super+J toggles split direction (horizontal/vertical).',
            'Super+P toggles pseudo style (natural vs stretch).',
            'Super+Arrow keys focus adjacent windows.',
            'Super+Shift+Arrow swaps windows in that direction.',
            'Resize: Super+Minus/Equal expands/shrinks left.',
            'Super+Shift+Minus/Equal expands/shrinks up.',
            'Add Alt for smaller steps, Ctrl for bigger steps.',
            'Super+Alt+Home saves width, Super+Home restores.',
            'Super+Ctrl+Backspace forces single window to square.',
            'Super+Shift+Backspace toggles window gaps.',
            'Super+Backspace toggles window transparency.',
            'Super+Left drag moves window. Super+Right drag resizes.',
            'Alt+Tab cycles windows on workspace.',
            'Ctrl+Alt+Tab cycles focus through monitors.',
            'Super+Ctrl+Delete toggles laptop display on/off.',
            'Super+Ctrl+Alt+Delete mirrors displays.'
        ]);

        // Merchant Theme - Themes, Style & System
        const merchant = new NPC(this, 1500, 300, 'merchant', 'Merchant Theme', [
            'I am Merchant Theme! I deal in beauty and system control.',
            'Super+Ctrl+Shift+Space opens the Theme picker (22 themes).',
            'Super+Ctrl+Space cycles theme backgrounds.',
            'Super+Shift+Space toggles the top bar on/off.',
            'Super+Ctrl+N toggles Night Light (blue filter).',
            'Super+Ctrl+I toggles idle lock (no auto-lock when off).',
            'Super+Ctrl+L locks the computer.',
            'Super+Space opens the Omarchy Menu (main hub).',
            'Super+Alt+Space opens the Apps Menu.',
            'Super+Escape opens System Menu (suspend, restart, etc.).',
            'Super+Ctrl+O opens the Toggle Menu.',
            'Super+Ctrl+H opens the Hardware Menu.',
            'Super+, dismisses notifications. Super+Shift+, dismiss all.',
            'Super+Ctrl+, toggles notification silencing.',
            'Super+Ctrl+R sets a reminder. Super+Ctrl+Alt+R sees all.',
            'Super+Ctrl+Alt+T shows time. Super+Ctrl+Alt+B shows battery.'
        ]);

        this.npcs = [elder, blacksmith, merchant];
        this.player = new Player(this, 960, 700);
        this.dialog = new Dialog(this);

        // Portals
        this.createPortals();

        this.add.text(960, 30, '[ OMARCHY PLANET ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        this.add.text(960, 1050, '> Click to move | Click NPCs to talk | Explore via portals', {
            fontSize: '12px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);
    }

    createPortals() {
        // Forest portal (south)
        const forestPortal = this.add.text(960, 1060, '> [FOREST - KEYBINDS]', {
            fontSize: '14px',
            fill: '#ffff00',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: forestPortal,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        forestPortal.on('pointerdown', () => {
            this.scene.start('Forest');
        });

        // SettingsCave portal (west)
        const cavePortal = this.add.text(30, 540, '> [CAVE - SYSTEM]', {
            fontSize: '14px',
            fill: '#ffff00',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0.5).setDepth(20).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: cavePortal,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        cavePortal.on('pointerdown', () => {
            this.scene.start('SettingsCave');
        });

        // Workshop portal (east)
        const workshopPortal = this.add.text(1890, 540, '[WORKSHOP - TOOLS] <', {
            fontSize: '14px',
            fill: '#ffff00',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0.5).setDepth(20).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: workshopPortal,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        workshopPortal.on('pointerdown', () => {
            this.scene.start('Workshop');
        });
    }

    createMap() {
        const tileSize = 32;
        const mapWidth = 60;
        const mapHeight = 34;

        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'grass');
            }
        }

        for (let x = 10; x < 50; x++) {
            this.add.image(x * tileSize + 16, 15 * tileSize + 16, 'path');
            this.add.image(x * tileSize + 16, 16 * tileSize + 16, 'path');
            this.add.image(x * tileSize + 16, 17 * tileSize + 16, 'path');
        }

        this.add.image(200, 200, 'building');
        this.add.image(800, 150, 'building');
        this.add.image(1400, 200, 'building');

        for (let x = 0; x < mapWidth; x += 4) {
            this.add.image(x * tileSize + 16, 16, 'tree');
            this.add.image(x * tileSize + 16, mapHeight * tileSize - 16, 'tree');
        }
        for (let y = 0; y < mapHeight; y += 4) {
            this.add.image(16, y * tileSize + 16, 'tree');
            this.add.image(mapWidth * tileSize - 16, y * tileSize + 16, 'tree');
        }
    }

    update() {
        if (this.player) this.player.update();
    }
}
