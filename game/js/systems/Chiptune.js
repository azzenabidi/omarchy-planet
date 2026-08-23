const Chiptune = {
    ctx: null,
    master: null,
    noiseBuf: null,
    playing: false,
    muted: false,

    tempo: 118,
    step: 0,
    nextTime: 0,
    timer: null,

    // 16th-note melody (MIDI notes, 0 = rest)
    lead: [
        76, 0, 79, 0, 81, 0, 79, 0, 76, 0, 74, 0, 72, 0, 74, 0,
        76, 0, 79, 0, 81, 0, 84, 0, 83, 0, 81, 0, 79, 0, 76, 0
    ],
    // Bass root per quarter note (Am F C G)
    bassRoots: [45, 45, 41, 41, 48, 48, 43, 43],

    freq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
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
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        if (!this.playing && !this.muted) this.start();
    },

    start() {
        if (this.playing || !this.ctx) return;
        this.playing = true;
        this.nextTime = this.ctx.currentTime + 0.06;
        this.timer = setInterval(() => this.schedule(), 25);
    },

    schedule() {
        const stepDur = 60 / this.tempo / 4;
        while (this.nextTime < this.ctx.currentTime + 0.12) {
            this.playStep(this.step % 32, this.nextTime);
            this.step++;
            this.nextTime += stepDur;
        }
    },

    playStep(s, t) {
        const lead = this.lead[s];
        if (lead) this.blip('square', this.freq(lead), t, 0.16, 0.055);

        if (s % 4 === 0) {
            const root = this.bassRoots[(s / 4) | 0];
            this.blip('triangle', this.freq(root), t, 0.30, 0.10);
        }

        if (s % 4 === 2) this.hat(t);
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
            if (this.ctx.state === 'running') this.start();
        }
        return this.muted;
    },

    stopLoop() {
        this.playing = false;
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        if (this.ctx && !this.playing && !this.muted) this.start();
    },

    suspend() {
        if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
        this.stopLoop();
    }
};
