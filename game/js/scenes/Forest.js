class Forest extends Phaser.Scene {
    constructor() {
        super('Forest');
    }

    create() {
        this.cameras.main.setBackgroundColor('#001100');
        this.createMap();
        this.createSignposts();

        this.player = new Player(this, 960, 100);
        this.dialog = new Dialog(this);

        this.add.text(960, 30, '[ FOREST PATH - KEYBINDS ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

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
        const signData = [
            { x: 960, y: 150, text: 'Super+Return: Open Terminal\nSuper+Shift+Return: Open Browser\nSuper+Shift+F: File Manager' },
            { x: 960, y: 280, text: 'Super+Space: Omarchy Menu\nSuper+Alt+Space: Apps Menu\nSuper+Escape: System Menu' },
            { x: 960, y: 410, text: 'Super+C/V/X: Universal Copy/Paste/Cut\nSuper+Ctrl+V: Clipboard Manager\nSuper+Ctrl+E: Emoji Picker' },
            { x: 960, y: 540, text: 'Print: Screenshot\nAlt+Print: Screen Record\nSuper+Alt+Print: Color Picker\nSuper+Ctrl+Print: OCR Text Extract' },
            { x: 960, y: 670, text: 'Super+K: Keybindings Help\nSuper+Ctrl+Q: Calculator\nSuper+Ctrl+L: Lock Screen\nSuper+Ctrl+N: Night Light' },
            { x: 960, y: 800, text: 'Super+Ctrl+A: Audio Panel\nSuper+Ctrl+B: Bluetooth Panel\nSuper+Ctrl+D: Display Panel\nSuper+Ctrl+W: Network Panel\nSuper+Ctrl+P: Power Panel' },
        ];

        signData.forEach(data => {
            const sign = this.add.image(data.x, data.y, 'sign');
            sign.setInteractive({ useHandCursor: true });
            sign.setScale(1.5);

            const label = this.add.text(data.x, data.y - 30, '[SIGN]', {
                fontSize: '10px',
                fill: '#00ff00',
                fontFamily: 'monospace'
            }).setOrigin(0.5);

            sign.on('pointerdown', () => {
                this.dialog.show('Signpost', data.text);
            });

            this.signs = this.signs || [];
            this.signs.push({ sign, label, data });
        });
    }

    update() {
        if (this.player) this.player.update();
    }
}
