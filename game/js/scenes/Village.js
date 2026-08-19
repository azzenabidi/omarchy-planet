class Village extends Phaser.Scene {
    constructor() {
        super('Village');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.createMap();

        this.npcs = [];

        // Elder Omarch - Workspaces & Navigation
        const elder = new NPC(this, 400, 300, 'elder', 'Elder Omarch', [
            'Welcome, traveler! I am Elder Omarch, keeper of workspaces.',
            'Omarchy has 10 workspaces. Press Super+1 through Super+10 to jump between them.',
            'Move a window to another workspace with Super+Shift+1-10. Silent move: Super+Shift+Alt+1-10.',
            'Super+Tab cycles to the next workspace, Super+Shift+Tab goes back.',
            'Super+Ctrl+Tab returns to your former workspace. Scroll with Super+Mouse Wheel.',
            'Each workspace remembers its own layout! Press Super+L to toggle layouts per workspace.',
            'The Scratchpad is a hidden workspace. Super+S toggles it, Super+Alt+S sends a window there.',
            'Super+G toggles window grouping. Grouped windows share the same tile space.',
            'Alt+Tab cycles through windows. Super+Arrow keys focus adjacent windows.'
        ]);

        // Blacksmith Tiling - Window Management
        const blacksmith = new NPC(this, 960, 400, 'blacksmith', 'Blacksmith Tiling', [
            'Greetings! I forge the windows of Omarchy.',
            'Windows tile automatically - no dragging needed! Super+W closes the focused window.',
            'Super+T toggles between floating and tiling mode for a window.',
            'Super+F makes a window fullscreen. Super+Ctrl+F does tiled fullscreen.',
            'Super+Alt+F stretches a window to full width. Super+O pops a window out as a float.',
            'Super+J toggles the split direction. Super+P creates a pseudo-tiling layout.',
            'Super+Backspace toggles transparency. Super+Shift+Backspace toggles gaps.',
            'Super+Ctrl+Backspace forces a single window into a square aspect ratio.',
            'Resize windows with Super+Arrow keys. Add Shift for 100px, Ctrl for 25px, Alt for 300px.',
            'Save a window width with Super+Alt+Home, restore with Super+Home.'
        ]);

        // Merchant Theme - Themes & Style
        const merchant = new NPC(this, 1500, 300, 'merchant', 'Merchant Theme', [
            'Looking to customize your world? I deal in themes!',
            'Super+Shift+Ctrl+Space opens the Theme menu. Pick from 22 built-in themes.',
            'Super+Ctrl+Space opens the Background picker. Each theme has its own wallpapers.',
            'Double-click the desktop: left-click picks a background, right-click picks a theme.',
            'Super+Shift+Backspace toggles window gaps. Super+Backspace toggles transparency.',
            'Super+Shift+Space toggles the top bar on/off.',
            'The bar position can be top, bottom, left, or right. Configure in omarchy.menu > Style.',
            'Super+Ctrl+N toggles Night Light - a blue light filter for late night coding.',
            'Super+Ctrl+I toggles idle lock. When off, your screen won\'t auto-lock.'
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

        this.add.text(960, 1050, '> Click to move | Click NPCs to talk | Head south to explore', {
            fontSize: '12px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);
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

    createPortals() {
        // Forest portal (south)
        const forestPortal = this.add.text(960, 1060, '> [FOREST]', {
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
        const cavePortal = this.add.text(30, 540, '> [CAVE]', {
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
        const workshopPortal = this.add.text(1890, 540, '[WORKSHOP] <', {
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

    update() {
        if (this.player) this.player.update();
    }
}
