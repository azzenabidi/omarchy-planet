class Village extends Phaser.Scene {
    constructor() {
        super('Village');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        // Create tile map
        this.createMap();

        // Create NPCs
        this.npcs = [];

        const elder = new NPC(this, 400, 300, 'elder', 'Elder Omarch', [
            'Welcome, traveler! I am Elder Omarch, keeper of workspaces.',
            'In Omarchy, you can have multiple workspaces. Press Super+1 through Super+9 to switch between them.',
            'Each workspace is like a different room in your house. Keep your apps organized!'
        ]);

        const blacksmith = new NPC(this, 960, 400, 'blacksmith', 'Blacksmith Tiling', [
            'Greetings! I forge the windows of Omarchy.',
            'Windows are automatically tiled - no dragging needed! Use Super+Q to close them.',
            'Press Super+F to toggle floating mode when you need a window free.'
        ]);

        const merchant = new NPC(this, 1500, 300, 'merchant', 'Merchant Theme', [
            'Looking to customize your world?',
            'Press Super+Shift+T to change your theme. Colors, backgrounds, everything!',
            'Double-click the desktop to pick a new wallpaper.'
        ]);

        this.npcs = [elder, blacksmith, merchant];

        // Create player
        this.player = new Player(this, 960, 700);

        // Create dialog system
        this.dialog = new Dialog(this);

        // Welcome text (terminal style)
        this.welcomeText = this.add.text(960, 30, '[ OMACHY PLANET ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        // Instructions
        this.add.text(960, 1050, '> Click to move | Click NPCs to talk | Head south to explore', {
            fontSize: '12px',
            fill: '#00aa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(50);
    }

    createMap() {
        const tileSize = 32;
        const mapWidth = 60;
        const mapHeight = 34;

        // Grass background
        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'grass');
            }
        }

        // Stone path (center)
        for (let x = 10; x < 50; x++) {
            this.add.image(x * tileSize + 16, 15 * tileSize + 16, 'path');
            this.add.image(x * tileSize + 16, 16 * tileSize + 16, 'path');
            this.add.image(x * tileSize + 16, 17 * tileSize + 16, 'path');
        }

        // Buildings
        this.add.image(200, 200, 'building');
        this.add.image(800, 150, 'building');
        this.add.image(1400, 200, 'building');

        // Trees around edges
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
        if (this.player) {
            this.player.update();
        }
    }
}
