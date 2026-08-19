class Forest extends Phaser.Scene {
    constructor() {
        super('Forest');
    }

    create() {
        this.cameras.main.setBackgroundColor('#001100');

        // Create tile map
        this.createMap();

        // Create signposts
        this.signs = [];
        this.createSignposts();

        // Create player at top (coming from village)
        this.player = new Player(this, 960, 100);

        // Create dialog system
        this.dialog = new Dialog(this);

        // Scene title
        this.add.text(960, 30, '[ FOREST PATH ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        // Instructions
        this.add.text(960, 1050, '> Click signs to learn keybinds | Continue south for more', {
            fontSize: '12px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);
    }

    createMap() {
        const tileSize = 32;
        const mapWidth = 60;
        const mapHeight = 34;

        // Dark grass/forest floor
        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'grass');
            }
        }

        // Path through forest
        for (let y = 2; y < mapHeight - 2; y++) {
            this.add.image(960, y * tileSize + 16, 'path');
            this.add.image(992, y * tileSize + 16, 'path');
        }

        // Trees lining the path
        for (let y = 0; y < mapHeight; y += 2) {
            this.add.image(800, y * tileSize + 16, 'tree');
            this.add.image(1120, y * tileSize + 16, 'tree');
        }

        // Extra trees for density
        for (let x = 0; x < mapWidth; x += 3) {
            for (let y = 0; y < mapHeight; y += 3) {
                if (Math.abs(x * tileSize + 16 - 960) > 200) {
                    this.add.image(x * tileSize + 16, y * tileSize + 16, 'tree');
                }
            }
        }
    }

    createSignposts() {
        const signData = [
            { x: 960, y: 200, text: 'Super+1 to Super+9: Switch workspaces' },
            { x: 960, y: 350, text: 'Super+Q: Close the focused window' },
            { x: 960, y: 500, text: 'Super+F: Toggle floating mode' },
            { x: 960, y: 650, text: 'Super+Shift+T: Change theme' },
            { x: 960, y: 800, text: 'Super+E: Open file manager' },
        ];

        signData.forEach(data => {
            const sign = this.add.image(data.x, data.y, 'sign');
            sign.setInteractive({ useHandCursor: true });

            const label = this.add.text(data.x, data.y - 24, '[SIGN]', {
                fontSize: '10px',
                fill: '#00ff00',
                fontFamily: 'monospace'
            }).setOrigin(0.5);

            sign.on('pointerdown', () => {
                if (!planetActive) return;
                this.dialog.show('Signpost', data.text);
            });

            this.signs.push({ sign, label, data });
        });
    }

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}
