class Dialog {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentText = '';
        this.displayedText = '';
        this.textIndex = 0;
        this.charDelay = 20;
        this.speaker = '';
        this.typeTimer = null;
        this._boundAdvance = null;
        this.onAdvance = null;

        // Create terminal-style UI
        this.container = scene.add.container(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 200);
        this.container.setDepth(100);
        this.container.setVisible(false);

        // Terminal border
        const border = scene.add.graphics();
        border.lineStyle(2, 0x00ff00, 1);
        border.strokeRect(-450, -90, 900, 180);

        // Terminal background
        const bg = scene.add.graphics();
        bg.fillStyle(0x000000, 0.95);
        bg.fillRect(-450, -90, 900, 180);
        bg.lineStyle(2, 0x00ff00, 0.5);
        bg.strokeRect(-450, -90, 900, 180);

        this.container.add(bg);
        this.container.add(border);

        // Speaker name
        this.nameText = scene.add.text(-430, -80, '> GUEST:', {
            fontSize: '14px',
            fill: '#00ff00',
            fontStyle: 'bold',
            fontFamily: 'monospace'
        });
        this.container.add(this.nameText);

        // Dialog text
        this.textObj = scene.add.text(-430, -55, '', {
            fontSize: '13px',
            fill: '#00ff00',
            fontFamily: 'monospace',
            wordWrap: { width: 860 },
            lineSpacing: 4
        });
        this.container.add(this.textObj);

        // Continue indicator
        this.continueText = scene.add.text(410, 70, '[CLICK]', {
            fontSize: '12px',
            fill: '#00ff00',
            fontFamily: 'monospace'
        }).setOrigin(1, 1);
        this.container.add(this.continueText);

        // Bind advance once, reuse
        this._boundAdvance = () => {
            if (!this.isOpen) return;
            this.advance();
        };

        scene.events.on('shutdown', this.destroy, this);
    }

    show(speaker, text, onAdvance) {
        this.speaker = speaker;
        this.currentText = text;
        this.displayedText = '';
        this.textIndex = 0;
        this.isOpen = true;
        this.onAdvance = onAdvance || null;

        this.nameText.setText(`> ${speaker.toUpperCase()}:`);
        this.textObj.setText('');
        this.textObj.setWordWrapWidth(860);
        this.container.setVisible(true);
        this.continueText.setVisible(false);

        // Resize dialog box to fit content
        this.textObj.setText(text);
        const textHeight = this.textObj.height;
        const boxHeight = Math.max(180, textHeight + 60);
        this.container.y = GameConfig.HEIGHT - boxHeight / 2 - 20;

        // Register click handler when dialog opens
        this.scene.input.on('pointerdown', this._boundAdvance);

        this.startTyping();
    }

    startTyping() {
        if (this.typeTimer) this.typeTimer.remove();

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
            // Typing in progress - finish it
            this.typeTimer.remove();
            this.typeTimer = null;
            this.displayedText = this.currentText;
            this.textObj.setText(this.displayedText);
            this.continueText.setVisible(true);
        } else {
            // Text fully shown - ask NPC for next line
            if (this.onAdvance) {
                this.onAdvance();
            } else {
                this.hide();
            }
        }
    }

    hide() {
        this.isOpen = false;
        this.onAdvance = null;
        this.container.setVisible(false);
        this.scene.input.off('pointerdown', this._boundAdvance);
        if (this.typeTimer) {
            this.typeTimer.remove();
            this.typeTimer = null;
        }
    }

    destroy() {
        this.hide();
        this._boundAdvance = null;
    }
}
