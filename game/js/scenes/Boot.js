class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {}

    create() {
        this.generateAsciiSprites();
        this.scene.start('Village');
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

        this.createAsciiSprite('cave_entrance', [
            '%%%%%%',
            '%    %',
            '% ## %',
            '%    %',
            '%%%%%%'
        ], '#222222', '12px monospace');

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
