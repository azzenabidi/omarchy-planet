class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {}

    create() {
        this.generateSprites();
        this.scene.start('Village');
    }

    generateSprites() {
        // Player character (16x16)
        this.generatePlayerSprite();

        // NPCs
        this.generateElderSprite();
        this.generateBlacksmithSprite();
        this.generateMerchantSprite();

        // Tiles
        this.generateGrassTile();
        this.generateStoneTile();
        this.generateWaterTile();
        this.generateWoodTile();
        this.generateCaveTile();
        this.generatePathTile();

        // Objects
        this.generateSignSprite();
        this.generateWorkbenchSprite();
        this.generateKeyboardSprite();
        this.generateCaveEntranceSprite();
        this.generateBuildingSprite();
        this.generateTreeSprite();
    }

    generatePlayerSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const s = 16;

        // Body
        g.fillStyle(0x4a9eff);
        g.fillRect(4, 6, 8, 6);

        // Head
        g.fillStyle(0xffcc99);
        g.fillRect(5, 1, 6, 5);

        // Hair
        g.fillStyle(0x553300);
        g.fillRect(5, 1, 6, 2);

        // Eyes
        g.fillStyle(0x000000);
        g.fillRect(6, 3, 1, 1);
        g.fillRect(9, 3, 1, 1);

        // Legs
        g.fillStyle(0x333366);
        g.fillRect(5, 12, 2, 4);
        g.fillRect(9, 12, 2, 4);

        g.generateTexture('player', s, s);
        g.destroy();
    }

    generateElderSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const s = 16;

        // Robe
        g.fillStyle(0x6633aa);
        g.fillRect(3, 6, 10, 8);

        // Head
        g.fillStyle(0xffcc99);
        g.fillRect(5, 1, 6, 5);

        // Beard
        g.fillStyle(0xffffff);
        g.fillRect(5, 4, 6, 3);

        // Hat
        g.fillStyle(0x6633aa);
        g.fillRect(4, 0, 8, 2);

        g.generateTexture('elder', s, s);
        g.destroy();
    }

    generateBlacksmithSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const s = 16;

        // Body
        g.fillStyle(0x884422);
        g.fillRect(4, 6, 8, 6);

        // Head
        g.fillStyle(0xffcc99);
        g.fillRect(5, 1, 6, 5);

        // Apron
        g.fillStyle(0x996633);
        g.fillRect(5, 8, 6, 4);

        // Arms
        g.fillStyle(0xffcc99);
        g.fillRect(2, 6, 2, 4);
        g.fillRect(12, 6, 2, 4);

        // Legs
        g.fillStyle(0x444444);
        g.fillRect(5, 12, 2, 4);
        g.fillRect(9, 12, 2, 4);

        g.generateTexture('blacksmith', s, s);
        g.destroy();
    }

    generateMerchantSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const s = 16;

        // Body
        g.fillStyle(0x22aa44);
        g.fillRect(4, 6, 8, 6);

        // Head
        g.fillStyle(0xffcc99);
        g.fillRect(5, 1, 6, 5);

        // Hat
        g.fillStyle(0xaa6622);
        g.fillRect(4, 0, 8, 2);
        g.fillRect(6, 0, 4, 1);

        // Legs
        g.fillStyle(0x553322);
        g.fillRect(5, 12, 2, 4);
        g.fillRect(9, 12, 2, 4);

        g.generateTexture('merchant', s, s);
        g.destroy();
    }

    generateGrassTile() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x44aa44);
        g.fillRect(0, 0, 32, 32);
        // Grass details
        g.fillStyle(0x55bb55);
        for (let i = 0; i < 8; i++) {
            g.fillRect(
                Phaser.Math.Between(0, 28),
                Phaser.Math.Between(0, 28),
                2, 4
            );
        }
        g.generateTexture('grass', 32, 32);
        g.destroy();
    }

    generateStoneTile() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x888888);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x777777);
        g.fillRect(0, 0, 16, 16);
        g.fillRect(16, 16, 16, 16);
        g.fillStyle(0x999999);
        g.fillRect(16, 0, 16, 16);
        g.fillRect(0, 16, 16, 16);
        g.generateTexture('stone', 32, 32);
        g.destroy();
    }

    generateWaterTile() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x3366cc);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x4477dd);
        g.fillRect(4, 8, 8, 2);
        g.fillRect(20, 16, 8, 2);
        g.generateTexture('water', 32, 32);
        g.destroy();
    }

    generateWoodTile() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x885533);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x774422);
        for (let y = 0; y < 32; y += 8) {
            g.fillRect(0, y, 32, 1);
        }
        g.generateTexture('wood', 32, 32);
        g.destroy();
    }

    generateCaveTile() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x444444);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x555555);
        g.fillRect(2, 2, 12, 12);
        g.fillRect(18, 18, 12, 12);
        g.generateTexture('cave', 32, 32);
        g.destroy();
    }

    generatePathTile() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xccaa77);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0xbbaa66);
        g.fillRect(4, 4, 4, 4);
        g.fillRect(20, 20, 4, 4);
        g.generateTexture('path', 32, 32);
        g.destroy();
    }

    generateSignSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        // Post
        g.fillStyle(0x664422);
        g.fillRect(14, 16, 4, 16);
        // Sign board
        g.fillStyle(0x886633);
        g.fillRect(4, 4, 24, 14);
        g.fillStyle(0x997744);
        g.fillRect(6, 6, 20, 10);
        g.generateTexture('sign', 32, 32);
        g.destroy();
    }

    generateWorkbenchSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        // Table top
        g.fillStyle(0x885533);
        g.fillRect(0, 8, 32, 8);
        // Legs
        g.fillStyle(0x664422);
        g.fillRect(2, 16, 4, 16);
        g.fillRect(26, 16, 4, 16);
        // Tools on top
        g.fillStyle(0xaaaaaa);
        g.fillRect(4, 4, 8, 4);
        g.fillStyle(0xcc6600);
        g.fillRect(20, 4, 8, 4);
        g.generateTexture('workbench', 32, 32);
        g.destroy();
    }

    generateKeyboardSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        // Base
        g.fillStyle(0x333333);
        g.fillRect(0, 8, 32, 16);
        // Keys
        g.fillStyle(0x555555);
        for (let x = 2; x < 30; x += 4) {
            for (let y = 10; y < 22; y += 4) {
                g.fillRect(x, y, 3, 3);
            }
        }
        g.generateTexture('keyboard', 32, 32);
        g.destroy();
    }

    generateCaveEntranceSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        // Cave opening
        g.fillStyle(0x555555);
        g.fillRect(0, 0, 64, 64);
        g.fillStyle(0x222222);
        g.fillRect(8, 16, 48, 48);
        g.fillStyle(0x111111);
        g.fillRect(12, 24, 40, 40);
        // Rocky edges
        g.fillStyle(0x666666);
        g.fillRect(0, 0, 8, 8);
        g.fillRect(56, 0, 8, 8);
        g.generateTexture('cave_entrance', 64, 64);
        g.destroy();
    }

    generateBuildingSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        // Walls
        g.fillStyle(0xaa8866);
        g.fillRect(0, 24, 64, 40);
        // Roof
        g.fillStyle(0xcc4444);
        g.fillRect(0, 16, 64, 12);
        g.fillStyle(0xbb3333);
        g.fillTriangle(32, 0, 0, 16, 64, 16);
        // Door
        g.fillStyle(0x553311);
        g.fillRect(24, 40, 16, 24);
        // Windows
        g.fillStyle(0x88ccff);
        g.fillRect(8, 32, 12, 12);
        g.fillRect(44, 32, 12, 12);
        g.generateTexture('building', 64, 64);
        g.destroy();
    }

    generateTreeSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        // Trunk
        g.fillStyle(0x664422);
        g.fillRect(12, 24, 8, 24);
        // Foliage
        g.fillStyle(0x228833);
        g.fillCircle(16, 16, 16);
        g.fillStyle(0x33aa44);
        g.fillCircle(16, 12, 12);
        g.generateTexture('tree', 32, 48);
        g.destroy();
    }
}
