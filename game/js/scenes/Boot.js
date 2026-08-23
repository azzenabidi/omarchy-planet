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

        // Select the title theme. WebKitGTK holds the AudioContext in an
        // interrupted/suspended state until the first user gesture, so the
        // first click enables sound; the second click starts the game.
        Chiptune.play('title');
        Chiptune.unlock();
        this.soundEnabled = false;

        // Terminal-style welcome screen
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.95);
        bg.fillRect(0, 0, 1920, 1080);

        const lines = [
            { text: '> OMARCHY PLANET v1.0.0', y: 270, size: '24px', color: '#00ff00' },
            { text: '> ─────────────────────────────────────────', y: 310, size: '16px', color: '#006600' },
            { text: `> Welcome, ${name}!`, y: 360, size: '20px', color: '#00ff00' },
            { text: '>', y: 392, size: '16px', color: '#00ff00' },
            { text: '> You have been chosen to explore the lands of Omarchy.', y: 420, size: '16px', color: '#00aa00' },
            { text: '> Talk to the villagers to learn the ways of this system.', y: 448, size: '16px', color: '#00aa00' },
            { text: '>', y: 476, size: '16px', color: '#00ff00' },
            { text: '> CONTROLS:', y: 508, size: '16px', color: '#ffff00' },
            { text: '>   Click ground      - Move your character', y: 538, size: '14px', color: '#00cc00' },
            { text: '>   Click NPC         - Talk to them', y: 562, size: '14px', color: '#00cc00' },
            { text: '>   Click dialog box  - Advance text', y: 586, size: '14px', color: '#00cc00' },
            { text: '>   Click yellow portals - Travel between scenes', y: 610, size: '14px', color: '#00cc00' },
            { text: '>   Click [TRY:*] signs, crystals & bench tools - Run real actions', y: 634, size: '14px', color: '#00cc00' },
            { text: '>   [ MUSIC ] button (bottom-right) - Toggle the soundtrack', y: 658, size: '14px', color: '#00cc00' },
            { text: '>', y: 690, size: '16px', color: '#00ff00' },
            { text: '> KEYBINDS:', y: 722, size: '16px', color: '#ffff00' },
            { text: '>   Super+Alt+P   - Hide/show Omarchy Planet', y: 750, size: '14px', color: '#00cc00' },
            { text: '>   Super+Ctrl+Alt+P - Quit Omarchy Planet', y: 774, size: '14px', color: '#00cc00' },
        ];

        lines.forEach(line => {
            this.add.text(960, line.y, line.text, {
                fontSize: line.size,
                fill: line.color,
                fontFamily: 'monospace'
            }).setOrigin(0.5);
        });

        const beginText = this.add.text(960, 820,
            '> [ CLICK TO ENABLE SOUND ]', {
                fontSize: '18px',
                fill: '#ffff00',
                fontFamily: 'monospace'
            }).setOrigin(0.5);

        this.tweens.add({
            targets: beginText,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // First click unlocks audio (title theme), second click begins.
        // The state flip is async, so watch for it; fall back to starting
        // the game after several clicks even if audio never unlocks.
        this.soundEnabled = false;
        this.welcomeClicks = 0;

        const enableSound = () => {
            if (this.soundEnabled) return;
            this.soundEnabled = true;
            beginText.setText('> [ CLICK TO BEGIN ]');
        };

        if (Chiptune.ctx && Chiptune.ctx.state === 'running') {
            enableSound();
        } else {
            const watch = setInterval(() => {
                if (Chiptune.ctx && Chiptune.ctx.state === 'running') {
                    clearInterval(watch);
                    enableSound();
                }
            }, 120);
            this.events.once('shutdown', () => clearInterval(watch));
        }

        this.input.on('pointerdown', () => {
            this.welcomeClicks++;
            if (!this.soundEnabled) {
                Chiptune.unlock();
                if (this.soundEnabled || this.welcomeClicks >= 3) {
                    this.input.removeAllListeners('pointerdown');
                    this.scene.start('Village');
                }
                return;
            }
            this.input.removeAllListeners('pointerdown');
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
