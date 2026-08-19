class Workshop extends Phaser.Scene {
    constructor() {
        super('Workshop');
    }

    create() {
        this.cameras.main.setBackgroundColor('#221100');

        // Create tile map
        this.createMap();

        // Create interactive objects
        this.createWorkshop();

        // Create tinkerer NPC
        this.tinkerer = new NPC(this, 400, 300, 'merchant', 'Tinkerer', [
            'Welcome to the Workshop!',
            'Here you can customize everything about your Omarchy experience.',
            'Click the workbench to change themes, or the keyboard to edit keybinds.'
        ]);

        // Create player
        this.player = new Player(this, 960, 700);

        // Create dialog system
        this.dialog = new Dialog(this);

        // Scene title
        this.add.text(960, 30, '[ WORKSHOP ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        // Instructions
        this.add.text(960, 1050, '> Click objects to customize | Talk to the Tinkerer', {
            fontSize: '12px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);
    }

    createMap() {
        const tileSize = 32;
        const mapWidth = 60;
        const mapHeight = 34;

        // Wood floor
        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'wood');
            }
        }

        // Stone work area
        for (let x = 15; x < 45; x++) {
            for (let y = 10; y < 20; y++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'stone');
            }
        }

        // Walls
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
        // Workbench (theme picker)
        const workbench = this.add.image(600, 400, 'workbench');
        workbench.setInteractive({ useHandCursor: true });
        workbench.setScale(2);

        this.add.text(600, 480, '> Theme Bench', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);

        workbench.on('pointerdown', () => {
            if (!planetActive) return;
            this.dialog.show('Workbench', 'Opening Theme Picker...');
            Bridge.openTheme();
        });

        // Keyboard (keybind editor)
        const keyboard = this.add.image(1300, 400, 'keyboard');
        keyboard.setInteractive({ useHandCursor: true });
        keyboard.setScale(2);

        this.add.text(1300, 480, '> Keybind Station', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);

        keyboard.on('pointerdown', () => {
            if (!planetActive) return;
            this.dialog.show('Keyboard', 'Opening Keybind Settings...');
            Bridge.openKeyboard();
        });
    }

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}
