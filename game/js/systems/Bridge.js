const Bridge = {
    send(command, data = {}) {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.omarchy) {
            const message = JSON.stringify({ command, ...data });
            window.webkit.messageHandlers.omarchy.postMessage(message);
        } else {
            console.log('[Bridge]', command, data);
        }
    },

    openSettings() {
        this.send('open-settings');
    },

    openTheme() {
        this.send('open-theme');
    },

    openKeyboard() {
        this.send('open-keyboard');
    },

    dismiss() {
        this.send('dismiss');
    }
};
