class Workshop extends Phaser.Scene {
    constructor() {
        super('Workshop');
    }

    create() {
        this.cameras.main.setBackgroundColor('#221100');
        this.createMap();
        this.createWorkshop();
        this.createNPCs();
        this.createTinkerBench();

        this.player = new Player(this, 960, 700);
        this.dialog = new Dialog(this);

        this.add.text(960, 30, '[ WORKSHOP ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        this.add.text(960, 1050, '> Click tools to customize for real | Click [VILLAGE] to return', {
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

    createNPCs() {
        const npcData = DialogData.getNPCs('Workshop');
        const positions = {
            tinkerer: { x: 400, y: 300, texture: 'merchant' },
            shell_master: { x: 1400, y: 300, texture: 'elder' },
            bar_master: { x: 900, y: 500, texture: 'blacksmith' }
        };

        npcData.forEach(npc => {
            const pos = positions[npc.id] || { x: 960, y: 500, texture: 'elder' };
            new NPC(this, pos.x, pos.y, pos.texture, npc.name, npc.lines, npc.recommendation);
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
        new DemoButton(this, 600, 400, '[ THEME PICKER ]', 'menu-theme',
            'Opening the Theme picker (Super+Shift+Ctrl+Space)...', { fill: '#ffcc44' });
        new DemoButton(this, 1300, 400, '[ KEYBIND EDITOR ]', 'keybindings',
            'Opening the Keybindings reference...', { fill: '#ffcc44' });
    }

    createTinkerBench() {
        this.add.text(960, 580, '> TINKER BENCH - click to try live:', {
            fontSize: '11px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(20);

        new DemoButton(this, 600, 630, '[ CYCLE BACKGROUND ]', 'background-next',
            'Cycling to the next theme background (Super+Ctrl+Space)...', { fill: '#ffcc44' });
        new DemoButton(this, 960, 630, '[ TOGGLE BAR ]', 'toggle-bar',
            'Toggling the top bar (Super+Shift+Space)...', { fill: '#ffcc44' });
        new DemoButton(this, 1320, 630, '[ NIGHT LIGHT ]', 'toggle-nightlight',
            'Toggling Night Light (Super+Ctrl+N)...', { fill: '#ffcc44' });
    }

    update() {
        if (this.player) this.player.update();
    }
}
