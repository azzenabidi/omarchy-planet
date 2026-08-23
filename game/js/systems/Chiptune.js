const Chiptune = {
    _dbg(msg) {
        try {
            if (window.__PLANET_DEBUG && window.webkit &&
                window.webkit.messageHandlers && window.webkit.messageHandlers.omarchy) {
                window.webkit.messageHandlers.omarchy.postMessage(
                    JSON.stringify({ command: '__probe', trace: msg }));
            }
        } catch (e) { /* ignored */ }
    },

    ctx: null,
    master: null,
    noiseBuf: null,
    playing: false,
    muted: false,
    trackName: null,

    step: 0,
    nextTime: 0,
    timer: null,

    tracks: {
        // Calm arpeggio for the welcome screen
        title: {
            tempo: 84,
            leadType: 'triangle', leadDur: 0.30, leadVol: 0.05,
            bassEvery: 8, bassDur: 0.50, bassVol: 0.09,
            hat: false,
            lead: [
                69, 0, 72, 0, 76, 0, 72, 0, 81, 0, 76, 0, 79, 0, 76, 0,
                65, 0, 69, 0, 72, 0, 69, 0, 77, 0, 72, 0, 76, 0, 72, 0
            ],
            bassRoots: [45, 41]
        },
        // Upbeat overworld theme
        game: {
            tempo: 118,
            leadType: 'square', leadDur: 0.16, leadVol: 0.055,
            bassEvery: 4, bassDur: 0.30, bassVol: 0.10,
            hat: true,
            lead: [
                76, 0, 79, 0, 81, 0, 79, 0, 76, 0, 74, 0, 72, 0, 74, 0,
                76, 0, 79, 0, 81, 0, 84, 0, 83, 0, 81, 0, 79, 0, 76, 0
            ],
            bassRoots: [45, 45, 41, 41, 48, 48, 43, 43]
        }
    },

    freq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    },

    track() {
        return this.tracks[this.trackName] || this.tracks.game;
    },

    play(name) {
        if (this.trackName === name) return;
        this.trackName = name;
        this.step = 0;
    },

    unlock() {
        this._dbg(`unlock enter state=${this.ctx ? this.ctx.state : 'no-ctx'}`);
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            this._dbg(`ctx created state=${this.ctx.state}`);
            this.master = this.ctx.createGain();
            this.master.gain.value = this.muted ? 0 : 0.14;
            this.master.connect(this.ctx.destination);

            const len = this.ctx.sampleRate * 0.06;
            this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
            const data = this.noiseBuf.getChannelData(0);
            for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

            this.ctx.onstatechange = () => {
                this._dbg(`onstatechange state=${this.ctx.state}`);
                this.ensureRunning();
            };
        }
        this.ensureRunning();
    },

    // WebKitGTK can report states other than 'suspended' (e.g. 'interrupted')
    // when the context is created before a user gesture. Resume anything
    // that isn't running, and retry — the flip may need a gesture or may
    // complete asynchronously.
    wake() {
        if (!this.ctx || this.ctx.state === 'running') return;
        this._dbg(`wake resume state=${this.ctx.state}`);
        try {
            this.ctx.resume();
        } catch (e) { this._dbg(`resume threw ${e}`); }
    },

    ensureRunning() {
        if (!this.ctx || this.muted || !this.trackName) {
            this._dbg(`ensureRunning bail ctx=${!!this.ctx} muted=${this.muted} track=${this.trackName}`);
            return;
        }
        if (this.ctx.state === 'running') {
            this._dbg('ensureRunning -> start');
            this.start();
            return;
        }

        this.wake();

        if (!this._retryTimer) {
            let tries = 0;
            this._retryTimer = setInterval(() => {
                tries++;
                if (!this.ctx || this.muted || !this.trackName ||
                    this.ctx.state === 'running' || tries > 40) {
                    clearInterval(this._retryTimer);
                    this._retryTimer = null;
                    this.ensureRunning();
                    return;
                }
                this.wake();
            }, 250);
        }
    },

    start() {
        if (this.playing || !this.ctx || this.ctx.state !== 'running') {
            this._dbg(`start blocked playing=${this.playing} state=${this.ctx ? this.ctx.state : 'no-ctx'}`);
            return;
        }
        this._dbg('start OK');
        this.playing = true;
        this.nextTime = this.ctx.currentTime + 0.06;
        this.timer = setInterval(() => this.schedule(), 25);
    },

    stopLoop() {
        this.playing = false;
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    },

    schedule() {
        if (!this.playing) return;
        const stepDur = 60 / this.track().tempo / 4;
        while (this.nextTime < this.ctx.currentTime + 0.12) {
            this.playStep(this.step % this.track().lead.length, this.nextTime);
            this.step++;
            this.nextTime += stepDur;
        }
    },

    playStep(s, t) {
        const tr = this.track();

        const note = tr.lead[s];
        if (note) this.blip(tr.leadType, this.freq(note), t, tr.leadDur, tr.leadVol);

        if (s % tr.bassEvery === 0) {
            const root = tr.bassRoots[(s / tr.bassEvery) % tr.bassRoots.length | 0];
            this.blip('triangle', this.freq(root), t, tr.bassDur, tr.bassVol);
        }

        if (tr.hat && s % 4 === 2) this.hat(t);
    },

    blip(type, freq, t, dur, vol) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g);
        g.connect(this.master);
        o.start(t);
        o.stop(t + dur + 0.02);
    },

    hat(t) {
        const src = this.ctx.createBufferSource();
        const g = this.ctx.createGain();
        const f = this.ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 6000;
        src.buffer = this.noiseBuf;
        g.gain.setValueAtTime(0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        src.connect(f);
        f.connect(g);
        g.connect(this.master);
        src.start(t);
    },

    toggleMute() {
        this.muted = !this.muted;
        if (!this.ctx) return this.muted;
        if (this.muted) {
            this.master.gain.value = 0;
            this.stopLoop();
        } else {
            this.master.gain.value = 0.14;
            this.ensureRunning();
        }
        return this.muted;
    },

    resume() {
        this.ensureRunning();
    },

    suspend() {
        if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
        this.stopLoop();
    }
};
