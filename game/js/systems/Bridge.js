const Bridge = {
    send(command, data = {}) {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.omarchy) {
            const message = JSON.stringify({ command, ...data });
            window.webkit.messageHandlers.omarchy.postMessage(message);
        } else {
            console.log('[Bridge]', command, data);
        }
    },

    // Trigger a real desktop action (allowlisted in planet.py)
    run(action) {
        this.send('run', { action });
    },

    menu(route) {
        this.run(`menu-${route}`);
    },

    panel(id) {
        this.run(`panel-${id}`);
    },

    openSettings() {
        this.run('panel-monitor');
    },

    openTheme() {
        this.run('menu-theme');
    },

    openKeyboard() {
        this.run('keybindings');
    },

    dismiss() {
        this.send('dismiss');
    },

    exit() {
        this.send('exit');
    }
};
