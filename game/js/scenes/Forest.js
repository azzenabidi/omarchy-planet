class Forest extends Phaser.Scene {
    constructor() {
        super('Forest');
    }

    create() {
        this.cameras.main.setBackgroundColor('#001100');
        this.createMap();
        this.createSignposts();
        this.createTryButtons();

        this.player = new Player(this, 960, 100);
        this.dialog = new Dialog(this);

        this.add.text(960, 30, '[ FOREST PATH - KEYBINDS ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        this.add.text(960, 1050, '> Click signs to learn keybinds | Click [TRY:*] to run it live | Click [VILLAGE] to return', {
            fontSize: '12px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);

        // Return portal
        const returnPortal = this.add.text(960, 50, '> [VILLAGE] <', {
            fontSize: '14px',
            fill: '#ffff00',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });

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
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'grass');
            }
        }

        for (let y = 2; y < mapHeight - 2; y++) {
            this.add.image(960, y * tileSize + 16, 'path');
            this.add.image(992, y * tileSize + 16, 'path');
        }

        for (let y = 0; y < mapHeight; y += 2) {
            this.add.image(800, y * tileSize + 16, 'tree');
            this.add.image(1120, y * tileSize + 16, 'tree');
        }

        for (let x = 0; x < mapWidth; x += 3) {
            for (let y = 0; y < mapHeight; y += 3) {
                if (Math.abs(x * tileSize + 16 - 960) > 200) {
                    this.add.image(x * tileSize + 16, y * tileSize + 16, 'tree');
                }
            }
        }
    }

    createSignposts() {
        const signs = DialogData.getSigns('Forest');
        const yPositions = [150, 280, 410, 540, 670, 800, 930];

        signs.forEach((sign, index) => {
            const y = yPositions[index] || 150 + index * 130;
            const signSprite = this.add.image(960, y, 'sign');
            signSprite.setInteractive({ useHandCursor: true });
            signSprite.setScale(1.5);
            signSprite.setDepth(5);

            const label = this.add.text(960, y - 30, '[SIGN]', {
                fontSize: '10px',
                fill: '#00ff00',
                fontFamily: 'monospace'
            }).setOrigin(0.5).setDepth(6);

            signSprite.on('pointerdown', () => {
                this.dialog.show('Signpost', sign.lines[0]);
            });
        });
    }

    createTryButtons() {
        // Each TRY button fires the actual keybind action on the desktop
        new DemoButton(this, 1270, 150, '[TRY: TERMINAL]', 'terminal',
            'Launching a terminal (Super+Return)...');
        new DemoButton(this, 650, 280, '[TRY: EMOJI PICKER]', 'emoji-picker',
            'Opening the emoji picker (Super+Ctrl+E)...');
        new DemoButton(this, 1270, 410, '[TRY: CLIPBOARD HISTORY]', 'clipboard-history',
            'Opening clipboard history (Super+Ctrl+V)...');
        new DemoButton(this, 650, 540, '[TRY: SCREENSHOT]', 'screenshot',
            'Taking a screenshot (Print)...');
        new DemoButton(this, 1270, 800, '[TRY: AUDIO PANEL]', 'panel-audio',
            'Opening the audio panel (Super+Ctrl+A)...');
    }

    update() {
        if (this.player) this.player.update();
    }
}
