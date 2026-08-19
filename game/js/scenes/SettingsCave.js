class SettingsCave extends Phaser.Scene {
    constructor() {
        super('SettingsCave');
    }

    create() {
        this.cameras.main.setBackgroundColor('#111111');
        this.createMap();
        this.createCaveEntrance();
        this.createNPCs();

        this.player = new Player(this, 960, 100);
        this.dialog = new Dialog(this);

        this.add.text(960, 30, '[ SETTINGS CAVE ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        // Return portal
        const returnPortal = this.add.text(30, 540, '> [VILLAGE]', {
            fontSize: '14px',
            fill: '#ffff00',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0.5).setDepth(20).setInteractive({ useHandCursor: true });

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
        const npcData = DialogData.getNPCs('SettingsCave');
        const positions = {
            cave_guard: { x: 960, y: 350, texture: 'blacksmith' },
            networker: { x: 400, y: 500, texture: 'merchant' },
            display_keeper: { x: 1500, y: 500, texture: 'elder' }
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
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'cave');
            }
        }

        for (let x = 10; x < 50; x++) {
            this.add.image(x * tileSize + 16, 15 * tileSize + 16, 'stone');
            this.add.image(x * tileSize + 16, 16 * tileSize + 16, 'stone');
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

    createCaveEntrance() {
        const entrance = this.add.image(960, 600, 'cave_entrance');
        entrance.setInteractive({ useHandCursor: true });
        entrance.setScale(2);
        entrance.setDepth(5);

        this.add.text(960, 680, '> Click to open Display Settings', {
            fontSize: '14px',
            fill: '#00ff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);

        entrance.on('pointerdown', () => {
            this.dialog.show('System', 'Opening Display Settings...');
            Bridge.openSettings();
        });
    }

    update() {
        if (this.player) this.player.update();
    }
}
