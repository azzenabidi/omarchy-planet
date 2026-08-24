const Bridge = {
    // Fail closed: the bridge to the desktop is only live when the reviewed,
    // integrity-verified engine actually loaded. A tampered or missing
    // engine means no game and no desktop actions, ever.
    enabled: typeof Phaser !== 'undefined',

    send(command, data = {}) {
        if (!this.enabled) {
            console.error('[Bridge] blocked: engine not verified');
            return;
        }
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
