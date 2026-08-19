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
            this.talk();
        });

        // Name label
        this.nameLabel = scene.add.text(x, y - 30, name, {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        // Floating indicator
        this.indicator = scene.add.text(x, y - 45, '>', {
            fontSize: '14px',
            fill: '#ffff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(11);

        // Blink animation
        scene.tweens.add({
            targets: this.indicator,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
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
        this.nameLabel.setVisible(false);
    }

    showIndicator() {
        this.indicator.setVisible(true);
        this.nameLabel.setVisible(true);
    }
}
