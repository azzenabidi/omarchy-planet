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

        this.add.text(960, 1050, '> Click signs to learn keybinds | Click [VILLAGE] to return', {
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
        const signData = [
            // Launching Apps
            { x: 960, y: 150, text: 'LAUNCHING APPS:\nSuper+Return: Terminal\nSuper+Alt+Return: Tmux terminal\nSuper+Shift+Return: Browser\nSuper+Shift+Alt+B: Incognito browser\nSuper+Shift+F: File Manager\nSuper+Shift+N: Neovim' },

            // More Apps
            { x: 960, y: 280, text: 'MORE APPS:\nSuper+Shift+M: Music (Spotify)\nSuper+Shift+Alt+M: Music (cliamp)\nSuper+Shift+D: Docker (LazyDocker)\nSuper+Shift+O: Obsidian\nSuper+Shift+X: X (Twitter)\nSuper+Shift+Y: YouTube\nSuper+Shift+S: Google Maps' },

            // AI & Communication
            { x: 960, y: 410, text: 'AI & COMMUNICATION:\nSuper+Shift+A: AI (ChatGPT)\nSuper+Shift+Alt+A: AI (Grok)\nSuper+Shift+G: Signal\nSuper+Shift+Alt+G: WhatsApp\nSuper+Shift+Ctrl+G: Messenger\nSuper+Shift+E: Email (HEY)\nSuper+Shift+C: Calendar (HEY)' },

            // Clipboard & Input
            { x: 960, y: 540, text: 'CLIPBOARD & INPUT:\nSuper+C: Copy\nSuper+X: Cut\nSuper+V: Paste\nSuper+Ctrl+V: Clipboard history\nSuper+Ctrl+E: Emoji picker\nSuper+Ctrl+Q: Calculator\nCapsLock+Space+Space: Em dash' },

            // Screenshots & Recording
            { x: 960, y: 670, text: 'SCREENSHOTS & RECORDING:\nPrint: Screenshot\nAlt+Print: Screen record (start/stop)\nSuper+Print: Color picker\nSuper+Ctrl+Print: OCR text extract\nSuper+Ctrl+X: Start/stop dictation\nF9: Push-to-talk dictation\nSuper+Ctrl+C: Capture menu' },

            // Notifications & Reminders
            { x: 960, y: 800, text: 'NOTIFICATIONS & REMINDERS:\nSuper+,: Dismiss notification\nSuper+Shift+,: Dismiss all\nSuper+Ctrl+,: Silence notifications\nSuper+Alt+,: Invoke last notification\nSuper+Ctrl+R: Set reminder\nSuper+Ctrl+Alt+R: See all reminders\nSuper+Ctrl+Shift+R: Clear all reminders' },

            // System Panels
            { x: 960, y: 930, text: 'SYSTEM PANELS:\nSuper+Ctrl+A: Audio\nSuper+Ctrl+W: Network/WiFi\nSuper+Ctrl+B: Bluetooth\nSuper+Ctrl+D: Display\nSuper+Ctrl+P: Power\nSuper+Ctrl+Alt+D: Calendar\nSuper+Ctrl+T: Activity monitor (btop)' }
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
