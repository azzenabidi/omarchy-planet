class SettingsCave extends Phaser.Scene {
    constructor() {
        super('SettingsCave');
    }

    create() {
        this.cameras.main.setBackgroundColor('#111111');
        this.createMap();
        this.createCaveEntrance();

        this.guard = new NPC(this, 960, 350, 'blacksmith', 'Cave Guard', [
            'Halt! This is the Cave of Settings.',
            'Here you can configure every aspect of your Omarchy system.',
            'Click the entrance below to open the Display settings panel.',
            'From the Omarchy Menu (Super+Space), you can access all settings:',
            'Monitors, Keybindings, Input, Network DNS, Default apps,',
            'Plugins, Security (fingerprint/FIDO2), and Hyprland config.',
            'Use Super+Ctrl+D for Display, Super+Ctrl+A for Audio,',
            'Super+Ctrl+B for Bluetooth, Super+Ctrl+W for Network.'
        ]);

        this.player = new Player(this, 960, 100);
        this.dialog = new Dialog(this);

        this.add.text(960, 30, '[ SETTINGS CAVE ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);
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
