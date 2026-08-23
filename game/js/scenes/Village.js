class Village extends Phaser.Scene {
    constructor() {
        super('Village');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.createMap();

        this.npcs = [];
        this.createNPCs();
        this.player = new Player(this, 960, 700);
        this.dialog = new Dialog(this);

        // Switch from title theme to the overworld theme
        Chiptune.play('game');

        // Portals
        this.createPortals();

        // Live demo objects
        this.createMenuSigns();
        this.createWorkspaceStones();

        this.add.text(960, 30, '[ OMARCHY PLANET ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        this.add.text(960, 1050, '> Click to move | Click NPCs to talk | Click signs & stones to try it live | Explore via portals', {
            fontSize: '12px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);
    }

    createMenuSigns() {
        this.add.text(960, 438, '> LIVE MENUS - click to open for real:', {
            fontSize: '11px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(20);

        new DemoButton(this, 740, 475, '[ OMARCHY MENU ]', 'menu-root',
            'Opening the Omarchy Menu (Super+Space)...', { fill: '#ffff00' });
        new DemoButton(this, 960, 475, '[ APPS MENU ]', 'menu-apps',
            'Opening the Apps Menu (Super+Alt+Space)...', { fill: '#ffff00' });
        new DemoButton(this, 1170, 475, '[ SYSTEM MENU ]', 'menu-system',
            'Opening the System Menu (Super+Escape)...', { fill: '#ffff00' });
    }

    createWorkspaceStones() {
        this.add.text(960, 605, '> WORKSPACE STONES - click to jump:', {
            fontSize: '11px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(20);

        for (let i = 1; i <= 5; i++) {
            new DemoButton(this, 860 + i * 50, 650, `[${i}]`, `workspace-${i}`,
                `Switching to workspace ${i} (Super+${i})...`, { fill: '#00ccff', fontSize: '14px' });
        }
    }

    createNPCs() {
        const npcData = DialogData.getNPCs('Village');
        const positions = {
            elder: { x: 400, y: 300, texture: 'elder' },
            blacksmith: { x: 960, y: 400, texture: 'blacksmith' },
            merchant: { x: 1500, y: 300, texture: 'merchant' }
        };

        npcData.forEach(npc => {
            const pos = positions[npc.id] || { x: 960, y: 500, texture: 'elder' };
            const npcObj = new NPC(this, pos.x, pos.y, pos.texture, npc.name, npc.lines, npc.recommendation);
            this.npcs.push(npcObj);
        });
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

        // Exit sign (top-right)
        const exitSign = this.add.text(1860, 30, '[EXIT]', {
            fontSize: '14px',
            fill: '#ff4444',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0).setDepth(50).setInteractive({ useHandCursor: true });

        exitSign.on('pointerdown', () => {
            Bridge.exit();
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
