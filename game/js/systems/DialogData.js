const DialogData = {
    data: null,

    async load() {
        try {
            const response = await fetch('data/dialog.csv');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const csv = await response.text();
            this.data = this.parse(csv);
        } catch (e) {
            this.data = this.loadSync();
        }
        if (!this.data) this.data = this.getFallbackData();
        return this.data;
    },

    loadSync() {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'data/dialog.csv', false);
            xhr.send();
            if (xhr.status === 200 || xhr.status === 0) {
                return this.parse(xhr.responseText);
            }
        } catch (e) {
            // fallback
        }
        return null;
    },

    getFallbackData() {
        return {"Village":{"elder":{"type":"npc","name":"Elder Omarch","lines":["Welcome! I am Elder Omarch, keeper of workspaces.","Omarchy has 10 workspaces. Super+1 through Super+0 to jump.","Super+Tab cycles next, Super+Shift+Tab cycles previous.","Super+Ctrl+Tab returns to your former workspace.","Super+Shift+1 groups windows together.","Grouped windows tile and resize as one."],"recommendation":"Head to the Forest to learn all keybinds!"},"blacksmith":{"type":"npc","name":"Blacksmith Tiling","lines":["I am Blacksmith Tiling! I forge window layouts.","Super+方向键 to resize windows.","Super+J splits down, Super+K splits up.","Super+L splits right, Super+H splits left.","Super+Enter replaces the focused tile.","Super+Space toggles the focused window to floating."],"recommendation":"Visit the Workshop to explore themes and tools!"},"merchant":{"type":"npc","name":"Merchant Theme","lines":["Greetings! I trade in beauty and notifications.","Super+M opens the Omarchy menu.","Super+N opens notifications.","Super+Shift+R adds a reminder.","Super+Period opens the emoji picker.","Super+Shift+V opens the clipboard manager."],"recommendation":"Check the Cave for system settings!"}},"Forest":{"app_launcher":{"type":"sign","name":"App Launcher","lines":["App Launcher: Super+A"]},"browser":{"type":"sign","name":"Browser","lines":["Browser: Super+B"]},"chatgpt":{"type":"sign","name":"ChatGPT","lines":["ChatGPT: Super+Shift+A"]},"files":{"type":"sign","name":"File Manager","lines":["File Manager: Super+F"]},"spotify":{"type":"sign","name":"Spotify","lines":["Spotify: Super+Shift+S"]},"screenshot":{"type":"sign","name":"Screenshots","lines":["Screenshot: Print Screen"]},"calculator":{"type":"sign","name":"Calculator","lines":["Calculator: Super+C"]}},"SettingsCave":{"guard":{"type":"npc","name":"Cave Guard","lines":["Welcome to the Settings Cave!","Super+Shift+D opens display settings.","Super+Shift+N opens network settings."],"recommendation":"Visit the Display Keeper for monitor setup!"},"network":{"type":"npc","name":"Network Keeper","lines":["I manage all network connections.","Omarchy uses NetworkManager.","DNS is handled by systemd-resolved.","Tailscale is available for VPN.","The firewall uses ufw."],"recommendation":"Ask the Display Keeper about monitors!"},"display":{"type":"npc","name":"Display Keeper","lines":["I configure your monitors.","Use wlr-randr for CLI display control.","Scale is set per-monitor.","Brightness uses brightnessctl.","Multi-monitor is supported natively."],"recommendation":"Return to the Village or visit the Workshop!"}},"Workshop":{"tinkerer":{"type":"npc","name":"Tinkerer","lines":["I customize themes!","Omarchy has 22 built-in themes.","Super+Shift+T cycles themes.","Backgrounds can be solid colors or images.","Theme files live in ~/.config/omarchy/themes/."],"recommendation":"Ask the Shell Master about productivity tools!"},"shell":{"type":"npc","name":"Shell Master","lines":["I teach shell productivity!","fzf for fuzzy finding.","zoxide for smart cd.","ripgrep for fast search.","eza for modern ls.","fd for finding files.","bat for cat with syntax highlighting."],"recommendation":"Talk to the Bar Master about the top bar!"},"bar":{"type":"npc","name":"Bar Master","lines":["I configure the top bar.","The bar shows workspace, clock, and system tray.","Bar position is configurable.","Widgets can be added or removed.","Check omarchy-plugins.com for community widgets!"],"recommendation":"You have explored Omarchy! Enjoy your journey!"}}}
    },

    parse(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const result = {};

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = this.parseCSVLine(line);
            const row = {};
            headers.forEach((h, idx) => {
                row[h.trim()] = values[idx] ? values[idx].trim() : '';
            });

            const scene = row.scene;
            const id = row.id;

            if (!result[scene]) result[scene] = {};
            if (!result[scene][id]) {
                result[scene][id] = {
                    type: row.type,
                    name: row.name,
                    lines: [],
                    recommendation: ''
                };
            }

            if (row.text) {
                result[scene][id].lines.push(row.text.replace(/\\n/g, '\n'));
            }
            if (row.recommendation) {
                result[scene][id].recommendation = row.recommendation;
            }
        }

        return result;
    },

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (inQuotes) {
                if (char === '"') {
                    if (i + 1 < line.length && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    values.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
        }
        values.push(current);
        return values;
    },

    getNPCs(scene) {
        if (!this.data || !this.data[scene]) return [];
        const npcs = [];
        for (const [id, info] of Object.entries(this.data[scene])) {
            if (info.type === 'npc') {
                npcs.push({ id, ...info });
            }
        }
        return npcs;
    },

    getSigns(scene) {
        if (!this.data || !this.data[scene]) return [];
        const signs = [];
        for (const [id, info] of Object.entries(this.data[scene])) {
            if (info.type === 'sign') {
                signs.push({ id, ...info });
            }
        }
        return signs;
    },

    getNPC(scene, id) {
        if (!this.data || !this.data[scene] || !this.data[scene][id]) return null;
        return this.data[scene][id];
    }
};
