class DemoButton {
    constructor(scene, x, y, label, action, feedback, options = {}) {
        this.scene = scene;
        this.action = action;
        this.feedback = feedback || `Running ${label}...`;

        const style = {
            fontSize: options.fontSize || '13px',
            fill: options.fill || '#00ff88',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        };

        this.label = scene.add.text(x, y, label, style)
            .setOrigin(options.originX !== undefined ? options.originX : 0.5,
                       options.originY !== undefined ? options.originY : 0.5)
            .setDepth(options.depth !== undefined ? options.depth : 30)
            .setInteractive({ useHandCursor: true });

        this.label.on('pointerover', () => this.label.setScale(1.1));
        this.label.on('pointerout', () => this.label.setScale(1));

        this.label.on('pointerdown', () => {
            if (scene.dialog && scene.dialog.isOpen) return;
            scene.dialog.show('Demo', this.feedback);
            Bridge.run(this.action);
        });

        // Gentle pulse so buttons read as interactive
        scene.tweens.add({
            targets: this.label,
            alpha: 0.65,
            duration: 900,
            yoyo: true,
            repeat: -1
        });
    }

    setPosition(x, y) {
        this.label.setPosition(x, y);
        return this;
    }
}
