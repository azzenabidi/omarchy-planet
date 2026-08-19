class NPC {
    constructor(scene, x, y, texture, name, dialogLines) {
        this.scene = scene;
        this.name = name;
        this.dialogLines = dialogLines;
        this.currentLine = 0;

        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.setImmovable(true);
        this.sprite.setDepth(5);

        // Make clickable
        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on('pointerdown', () => {
            if (!planetActive) return;
            this.talk();
        });

        // Floating indicator
        this.indicator = scene.add.text(x, y - 20, '!', {
            fontSize: '16px',
            fill: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.indicator.setDepth(11);

        // Float animation
        scene.tweens.add({
            targets: this.indicator,
            y: y - 24,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    talk() {
        if (this.scene.dialog && this.scene.dialog.isOpen) {
            return;
        }

        const line = this.dialogLines[this.currentLine % this.dialogLines.length];
        this.currentLine++;

        if (this.scene.dialog) {
            this.scene.dialog.show(this.name, line);
        }
    }

    hideIndicator() {
        this.indicator.setVisible(false);
    }

    showIndicator() {
        this.indicator.setVisible(true);
    }
}
