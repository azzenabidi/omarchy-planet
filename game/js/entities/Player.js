class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDepth(10);

        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        this.speed = 160;

        scene.input.on('pointerdown', (pointer) => {
            if (!planetActive) return;
            this.moveTo(pointer.worldX, pointer.worldY);
        });
    }

    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
    }

    update() {
        if (!this.isMoving) return;

        const dx = this.targetX - this.sprite.x;
        const dy = this.targetY - this.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 4) {
            this.sprite.setVelocity(0, 0);
            this.isMoving = false;
            return;
        }

        const vx = (dx / dist) * this.speed;
        const vy = (dy / dist) * this.speed;
        this.sprite.setVelocity(vx, vy);

        // Flip sprite based on direction
        if (dx < -2) {
            this.sprite.setFlipX(true);
        } else if (dx > 2) {
            this.sprite.setFlipX(false);
        }
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    setPosition(x, y) {
        this.sprite.setPosition(x, y);
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        this.sprite.setVelocity(0, 0);
    }
}
