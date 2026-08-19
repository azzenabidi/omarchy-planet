class Dialog {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentText = '';
        this.displayedText = '';
        this.textIndex = 0;
        this.charDelay = 30;
        this.speaker = '';

        // Create terminal-style UI
        this.container = scene.add.container(960, 900);
        this.container.setDepth(100);
        this.container.setVisible(false);

        // Terminal border
        const border = scene.add.graphics();
        border.lineStyle(2, 0x00ff00, 1);
        border.strokeRect(-400, -70, 800, 140);

        // Terminal background
        const bg = scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(-400, -70, 800, 140);
        bg.lineStyle(2, 0x00ff00, 0.5);
        bg.strokeRect(-400, -70, 800, 140);

        this.container.add(bg);
        this.container.add(border);

        // Speaker name (terminal prompt style)
        this.nameText = scene.add.text(-380, -60, '> GUEST: ', {
            fontSize: '14px',
            fill: '#00ff00',
            fontStyle: 'bold',
            fontFamily: 'monospace'
        });
        this.container.add(this.nameText);

        // Dialog text
        this.textObj = scene.add.text(-380, -30, '', {
            fontSize: '14px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            wordWrap: { width: 760 }
        });
        this.container.add(this.textObj);

        // Continue indicator
        this.continueText = scene.add.text(360, 50, '[ENTER]', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'monospace'
        }).setOrigin(1, 1);
        this.container.add(this.continueText);

        // Click to continue
        scene.input.on('pointerdown', () => {
            if (!this.isOpen || !planetActive) return;
            this.advance();
        });

        // Typing timer
        this.typeTimer = null;
    }

    show(speaker, text) {
        this.speaker = speaker;
        this.currentText = text;
        this.displayedText = '';
        this.textIndex = 0;
        this.isOpen = true;

        this.nameText.setText(`> ${speaker.toUpperCase()}: `);
        this.textObj.setText('');
        this.container.setVisible(true);
        this.continueText.setVisible(false);

        this.startTyping();
    }

    startTyping() {
        if (this.typeTimer) {
            this.typeTimer.remove();
        }

        this.typeTimer = this.scene.time.addEvent({
            delay: this.charDelay,
            callback: () => {
                if (this.textIndex < this.currentText.length) {
                    this.displayedText += this.currentText[this.textIndex];
                    this.textObj.setText(this.displayedText);
                    this.textIndex++;
                } else {
                    this.typeTimer.remove();
                    this.typeTimer = null;
                    this.continueText.setVisible(true);
                }
            },
            repeat: this.currentText.length - 1
        });
    }

    advance() {
        if (this.typeTimer) {
            // Skip typing animation
            this.typeTimer.remove();
            this.typeTimer = null;
            this.displayedText = this.currentText;
            this.textObj.setText(this.displayedText);
            this.continueText.setVisible(true);
        } else {
            // Close dialog
            this.hide();
        }
    }

    hide() {
        this.isOpen = false;
        this.container.setVisible(false);
        if (this.typeTimer) {
            this.typeTimer.remove();
            this.typeTimer = null;
        }
    }
}
