class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // DialogData.js is already loaded via index.html script tag
    }

    create() {
        this.generateAsciiSprites();

        // Load dialog data then show welcome
        DialogData.load().then(() => {
            this.showWelcome();
        }).catch(() => {
            // Fallback if CSV fails to load
            this.showWelcome();
        });
    }

    showWelcome() {
        const name = window.userName || 'Traveler';

        // Title theme (starts immediately if autoplay is allowed,
        // otherwise on the first click via the global unlock listener)
        Chiptune.play('title');
        Chiptune.unlock();

        // Terminal-style welcome screen
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.95);
        bg.fillRect(0, 0, 1920, 1080);

        const lines = [
            { text: '> OMARCHY PLANET v1.0.0', y: 300, size: '24px', color: '#00ff00' },
            { text: '> ─────────────────────────────────────────', y: 340, size: '16px', color: '#006600' },
            { text: `> Welcome, ${name}!`, y: 400, size: '20px', color: '#00ff00' },
            { text: '>', y: 440, size: '16px', color: '#00ff00' },
            { text: '> You have been chosen to explore the lands of Omarchy.', y: 470, size: '16px', color: '#00aa00' },
            { text: '> Talk to the villagers to learn the ways of this system.', y: 500, size: '16px', color: '#00aa00' },
            { text: '>', y: 530, size: '16px', color: '#00ff00' },
            { text: '> CONTROLS:', y: 570, size: '16px', color: '#ffff00' },
            { text: '>   Click ground    - Move your character', y: 600, size: '14px', color: '#00cc00' },
            { text: '>   Click NPC       - Talk to them', y: 630, size: '14px', color: '#00cc00' },
            { text: '>   Click during dialog - Advance text', y: 660, size: '14px', color: '#00cc00' },
            { text: '>', y: 690, size: '16px', color: '#00ff00' },
            { text: '> Press Super+P to toggle this world on/off.', y: 720, size: '14px', color: '#008800' },
            { text: '>', y: 760, size: '16px', color: '#00ff00' },
            { text: '> [CLICK TO BEGIN]', y: 820, size: '18px', color: '#ffff00' },
        ];

        lines.forEach(line => {
            this.add.text(960, line.y, line.text, {
                fontSize: line.size,
                fill: line.color,
                fontFamily: 'monospace'
            }).setOrigin(0.5);
        });

        // Click anywhere to start
        this.input.once('pointerdown', () => {
            this.scene.start('Village');
        });
    }

    generateAsciiSprites() {
        const font = '14px monospace';

        // Player character
        this.createAsciiSprite('player', [
            '  @  ',
            ' /|\\ ',
            '  |  ',
            ' / \\ '
        ], '#00ff00', font);

        // NPCs
        this.createAsciiSprite('elder', [
            '  O  ',
            ' /|\\ ',
            '  |  ',
            ' / \\ '
        ], '#ffcc00', font);

        this.createAsciiSprite('blacksmith', [
            '  #  ',
            ' /|\\ ',
            '  |  ',
            ' / \\ '
        ], '#ff6600', font);

        this.createAsciiSprite('merchant', [
            '  $  ',
            ' /|\\ ',
            '  |  ',
            ' / \\ '
        ], '#00ccff', font);

        // Tiles
        this.createAsciiTile('grass', '.', '#00aa00');
        this.createAsciiTile('stone', '#', '#666666');
        this.createAsciiTile('water', '~', '#0066cc');
        this.createAsciiTile('wood', '=', '#885533');
        this.createAsciiTile('cave', '%', '#444444');
        this.createAsciiTile('path', '-', '#ccaa77');

        // Objects
        this.createAsciiSprite('sign', [
            '||',
            '==',
            '||'
        ], '#886633', '12px monospace');

        this.createAsciiSprite('workbench', [
            '====',
            '|  |',
            '|  |'
        ], '#885533', '12px monospace');

        this.createAsciiSprite('keyboard', [
            '[][][]',
            '[][][]',
            '[][][]'
        ], '#333333', '12px monospace');

        this.createAsciiSprite('building', [
            '  /\\  ',
            ' /  \\ ',
            '======',
            '|    |',
            '| [] |',
            '|  ()|',
            '======'
        ], '#aa8866', '12px monospace');

        this.createAsciiSprite('tree', [
            '  @  ',
            ' @@@ ',
            '@@@@@',
            '  |  ',
            '  |  '
        ], '#228833', '12px monospace');
    }

    createAsciiSprite(key, lines, color, font) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const charWidth = 10;
        const charHeight = 16;
        const width = Math.max(...lines.map(l => l.length)) * charWidth;
        const height = lines.length * charHeight;

        // Create canvas texture
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, width, height);

        ctx.font = font || '14px monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        lines.forEach((line, y) => {
            ctx.fillText(line, 0, y * charHeight);
        });

        // Add to textures
        if (this.textures.exists(key)) {
            this.textures.remove(key);
        }
        this.textures.addCanvas(key, canvas);
        g.destroy();
    }

    createAsciiTile(key, char, color) {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Dark background
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, size, size);

        // Character in center
        ctx.font = '20px monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, size / 2, size / 2);

        if (this.textures.exists(key)) {
            this.textures.remove(key);
        }
        this.textures.addCanvas(key, canvas);
    }
}
