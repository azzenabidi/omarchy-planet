const DialogData = {
    data: null,

    async load() {
        const response = await fetch('data/dialog.csv');
        const csv = await response.text();
        this.data = this.parse(csv);
        return this.data;
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
