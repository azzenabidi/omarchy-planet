class SettingsCave extends Phaser.Scene {
    constructor() {
        super('SettingsCave');
    }

    create() {
        this.cameras.main.setBackgroundColor('#111111');

        // Create tile map
        this.createMap();

        // Create cave entrance
        this.createCaveEntrance();

        // Create guard NPC
        this.guard = new NPC(this, 960, 350, 'blacksmith', 'Cave Guard', [
            'Halt! This is the Cave of Settings.',
            'Inside you can configure your display, audio, and network.',
            'Click the cave entrance to open Omarchy Settings.'
        ]);

        // Create player at top
        this.player = new Player(this, 960, 100);

        // Create dialog system
        this.dialog = new Dialog(this);

        // Scene title
        this.add.text(960, 30, '~ Settings Cave ~', {
            fontSize: '24px',
            fill: '#8888ff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);
    }

    createMap() {
        const tileSize = 32;
        const mapWidth = 60;
        const mapHeight = 34;

        // Cave floor
        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'cave');
            }
        }

        // Stone path
        for (let x = 10; x < 50; x++) {
            this.add.image(x * tileSize + 16, 15 * tileSize + 16, 'stone');
            this.add.image(x * tileSize + 16, 16 * tileSize + 16, 'stone');
        }

        // Cave walls (edges)
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

        this.add.text(960, 680, 'Click to open Settings', {
            fontSize: '14px',
            fill: '#88aaff',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);

        entrance.on('pointerdown', () => {
            if (!planetActive) return;
            this.dialog.show('System', 'Opening Omarchy Settings...');
            Bridge.openSettings();
        });
    }

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}
