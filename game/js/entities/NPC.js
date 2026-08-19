class NPC {
    constructor(scene, x, y, texture, name, dialogLines, recommendation) {
        this.scene = scene;
        this.name = name;
        this.dialogLines = dialogLines;
        this.recommendation = recommendation || null;
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
        // If dialog is open and it's ours, clicking NPC does nothing (dialog click handles it)
        if (this.scene.dialog && this.scene.dialog.isOpen) {
            return;
        }

        this.showNextLine();
    }

    showNextLine() {
        // If we've shown all regular lines, show recommendation then reset
        if (this.currentLine >= this.dialogLines.length) {
            if (this.recommendation) {
                const rec = this.recommendation;
                this.currentLine = 0;
                this.scene.dialog.show(this.name, rec, null);
            } else {
                this.currentLine = 0;
            }
            return;
        }

        // Show next line in sequence
        const line = this.dialogLines[this.currentLine];
        this.currentLine++;

        // onAdvance callback: when player clicks dialog, show next line
        this.scene.dialog.show(this.name, line, () => {
            this.showNextLine();
        });
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
