const Chiptune = {
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
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.master.gain.value = this.muted ? 0 : 0.14;
            this.master.connect(this.ctx.destination);

            const len = this.ctx.sampleRate * 0.06;
            this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
            const data = this.noiseBuf.getChannelData(0);
            for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

            const check = () => {
                if (this.ctx.state === 'running' && !this.playing && !this.muted && this.trackName) {
                    this.start();
                }
            };
            this.ctx.onstatechange = check;
            check();
        } else {
            this.ensureRunning();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.ensureRunning();
    },

    ensureRunning() {
        if (this.ctx && this.ctx.state === 'running' && !this.playing && !this.muted && this.trackName) {
            this.start();
        }
    },

    start() {
        if (this.playing || !this.ctx || this.ctx.state !== 'running') return;
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
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        this.ensureRunning();
    },

    suspend() {
        if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
        this.stopLoop();
    }
};
