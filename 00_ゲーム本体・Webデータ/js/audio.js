// Web Audio APIによる自律型効果音エンジン
class KidsSoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initOnFirstInteraction();
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    initOnFirstInteraction() {
        const unlock = () => {
            this.initContext();
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
    }

    setMute(isMuted) {
        this.enabled = !isMuted;
    }

    toggleMute() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // ぷるん・タップ音（ボタンクリック時）
    playTap(freq = 440) {
        if (!this.enabled) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {
            console.warn(e);
        }
    }

    // 風船が割れる音（ポップ）
    playPop() {
        if (!this.enabled) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            // 短いホワイトノイズ + ピッチドロップ
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    // キラキラ正解音（チャイム）
    playSuccess() {
        if (!this.enabled) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const now = this.ctx.currentTime + idx * 0.08;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.35);
            });
        } catch (e) {}
    }

    // 動物の鳴き声風シンセ
    playAnimal(type) {
        if (!this.enabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        try {
            switch(type) {
                case 'cat': { // にゃーん（音程が上がって下がる）
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(450, now);
                    osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
                    osc.frequency.exponentialRampToValueAtTime(380, now + 0.4);

                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.42);
                    break;
                }
                case 'dog': { // わん！
                    for (let i = 0; i < 2; i++) {
                        const t = now + i * 0.15;
                        const osc = this.ctx.createOscillator();
                        const gain = this.ctx.createGain();
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(320, t);
                        osc.frequency.exponentialRampToValueAtTime(140, t + 0.1);

                        gain.gain.setValueAtTime(0.18, t);
                        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.11);

                        osc.connect(gain);
                        gain.connect(this.ctx.destination);
                        osc.start(t);
                        osc.stop(t + 0.12);
                    }
                    break;
                }
                case 'chick': { // ぴよぴよ
                    for (let i = 0; i < 2; i++) {
                        const t = now + i * 0.14;
                        const osc = this.ctx.createOscillator();
                        const gain = this.ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(1800, t);
                        osc.frequency.exponentialRampToValueAtTime(2400, t + 0.05);
                        osc.frequency.exponentialRampToValueAtTime(1600, t + 0.1);

                        gain.gain.setValueAtTime(0.15, t);
                        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

                        osc.connect(gain);
                        gain.connect(this.ctx.destination);
                        osc.start(t);
                        osc.stop(t + 0.11);
                    }
                    break;
                }
                case 'frog': { // げこっ
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.linearRampToValueAtTime(240, now + 0.05);
                    osc.frequency.linearRampToValueAtTime(130, now + 0.18);

                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
                }
                case 'lion': { // がおー（低音うなり）
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(110, now);
                    osc.frequency.linearRampToValueAtTime(150, now + 0.15);
                    osc.frequency.linearRampToValueAtTime(70, now + 0.45);

                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.5);
                    break;
                }
                case 'bear': { // どっしり
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(160, now);
                    osc.frequency.linearRampToValueAtTime(90, now + 0.3);

                    gain.gain.setValueAtTime(0.22, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.35);
                    break;
                }
            }
        } catch(e) {}
    }

    // ファンファーレ（ゲームクリア時）
    playFanfare() {
        if (!this.enabled) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const chords = [
                { f: 523.25, t: 0 },    // C5
                { f: 659.25, t: 0.12 }, // E5
                { f: 783.99, t: 0.24 }, // G5
                { f: 1046.50, t: 0.38, hold: 0.4 } // C6
            ];
            const baseTime = this.ctx.currentTime;
            chords.forEach(c => {
                const now = baseTime + c.t;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(c.f, now);

                const dur = c.hold || 0.15;
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + dur);
            });
        } catch(e) {}
    }
}

window.kidsSound = new KidsSoundManager();
