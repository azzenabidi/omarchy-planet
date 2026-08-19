class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setDepth(10);
        this.label = scene.add.text(x, y - 20, '@', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(11);
        this.isMoving = false;

        // Click to move
        scene.input.on('pointerdown', (pointer) => {
            if (scene.dialog && scene.dialog.isOpen) return;
            const hitObjects = scene.input.hitTestPointer(pointer);
            if (hitObjects.length > 0) return;
            this.moveTo(pointer.worldX, pointer.worldY);
        });
    }

    moveTo(x, y) {
        this.scene.physics.moveTo(this.sprite, x, y, 150);
        this.isMoving = true;
        this.scene.input.on('pointerdown', () => this.stopMovement());
    }

    stopMovement() {
        this.sprite.body.setVelocity(0);
        this.isMoving = false;
    }

    update() {
        this.label.setPosition(this.sprite.x, this.sprite.y - 20);

        if (this.isMoving) {
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.sprite.body.velocity.x === 0 ? this.sprite.x : this.sprite.x,
                this.sprite.body.velocity.y === 0 ? this.sprite.y : this.sprite.y
            );

            if (this.sprite.body.velocity.x === 0 && this.sprite.body.velocity.y === 0) {
                this.isMoving = false;
            }
        }
    }
}
