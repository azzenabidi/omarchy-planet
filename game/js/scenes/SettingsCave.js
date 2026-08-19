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
            'Here you can configure every aspect of your system.',
            'Click the entrance to open Display settings.',
            'From Super+Space menu, access all settings:',
            'Monitors, Keybindings, Input, Network DNS,',
            'Default apps, Plugins, Security, and Hyprland config.'
        ]);

        // Network & System NPC
        const networker = new NPC(this, 400, 500, 'merchant', 'Network Keeper', [
            'NETWORKING: NetworkManager backend.',
            'Super+Ctrl+W opens WiFi panel.',
            'nmtui for terminal network management.',
            'omarchy network password <iface> prints WiFi password.',
            'omarchy network speedtest down/up for speed tests.',
            'omarchy dns to see/set DNS (Cloudflare, Google, Custom).',
            'WiFi QR sharing: Setup > Network > QR Code.',
            'Firewall on by default, blocks incoming traffic.',
            'Tailscale available: Install > Service > Tailscale.'
        ]);

        // Monitor & Display NPC
        const displayKeeper = new NPC(this, 1500, 500, 'elder', 'Display Keeper', [
            'MONITORS: Auto-extend on connect.',
            'Super+/ steps monitor scaling up (1x/1.25x/1.6x/2x/3x/4x).',
            'Super+Alt+/ steps scaling down.',
            'omarchy display text size <9-20> adjusts text.',
            'Brightness keys adjust display brightness.',
            'Shift+Brightness for max/min. Alt+Brightness for 1%.',
            'Config: ~/.config/hypr/monitors.lua',
            'Laptop display: Super+Ctrl+Delete toggles on/off.',
            'Mirror displays: Super+Ctrl+Alt+Delete.'
        ]);

        this.player = new Player(this, 960, 100);
        this.dialog = new Dialog(this);

        this.add.text(960, 30, '[ SETTINGS CAVE ]', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);

        // Return portal
        const returnPortal = this.add.text(30, 540, '> [VILLAGE]', {
            fontSize: '14px',
            fill: '#ffff00',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0.5).setDepth(20).setInteractive({ useHandCursor: true });

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
