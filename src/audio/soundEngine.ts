class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(mute: boolean) {
    this.muted = mute;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.08,
    delay: number = 0,
    endFreq?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.playTone(680, 0.045, 'triangle', 0.05, 0, 420);
  }

  playIncomingRing() {
    this.playTone(880, 0.12, 'sine', 0.08, 0);
    this.playTone(1174.66, 0.16, 'sine', 0.09, 0.13);
  }

  playDiagnosticBeep() {
    this.playTone(520, 0.07, 'square', 0.035, 0);
    this.playTone(780, 0.07, 'square', 0.035, 0.09);
    this.playTone(1040, 0.11, 'triangle', 0.05, 0.18);
  }

  playRebootTick(step: number) {
    const base = 320 + (step % 3) * 60;
    this.playTone(base, 0.04, 'sine', 0.035, 0);
  }

  playRebootComplete() {
    this.playTone(440, 0.1, 'triangle', 0.07, 0);
    this.playTone(659.25, 0.16, 'triangle', 0.08, 0.1);
  }

  playDeescalate() {
    this.playTone(392, 0.18, 'sine', 0.06, 0);
    this.playTone(493.88, 0.22, 'sine', 0.06, 0.08);
  }

  playSuccessChime() {
    this.playTone(523.25, 0.14, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.08, 0.09);
    this.playTone(783.99, 0.24, 'triangle', 0.09, 0.18);
  }

  playWarning() {
    this.playTone(310, 0.12, 'sawtooth', 0.045, 0, 220);
  }

  playHangupAlert() {
    this.playTone(480, 0.16, 'sawtooth', 0.07, 0, 260);
    this.playTone(320, 0.22, 'sawtooth', 0.07, 0.18, 170);
    this.playTone(425, 0.14, 'square', 0.04, 0.44);
  }
}

export const soundEngine = new SoundEngine();
