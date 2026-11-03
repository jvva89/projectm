/**
 * MAYSA — A DIGITAL LOVE ARCHIVE
 * Romantic Ambient Audio Engine
 * Uses Web Audio API to create a gentle, warm, cinematic ambient score offline.
 * Also checks if a local custom audio file (e.g. 'musica.mp3') exists.
 */

class RomanticAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.customAudio = null;
    this.useCustomAudio = false;
    this.timerId = null;
    this.step = 0;

    // Romantic chords (frequencies in Hz): Dbmaj9 - Fm7 - Gbmaj7 - Abadd9
    this.chordProgressions = [
      [138.59, 174.61, 207.65, 261.63, 311.13], // Dbmaj9 (Db3, F3, Ab3, C4, Eb4)
      [174.61, 207.65, 261.63, 311.13, 392.00], // Fm7 (F3, Ab3, C4, Eb4, G4)
      [185.00, 233.08, 277.18, 349.23, 440.00], // Gbmaj7 (Gb3, Bb3, Db4, F4, A4)
      [207.65, 261.63, 311.13, 392.00, 466.16]  // Abadd9 (Ab3, C4, Eb4, G4, Bb4)
    ];

    this.melodyNotes = [
      523.25, 587.33, 622.25, 698.46, 783.99, 880.00, 1046.50
    ];

    this.checkCustomAudio();
  }

  checkCustomAudio() {
    // Check if user placed a musica.mp3 file in the project
    const testAudio = new Audio('musica.mp3');
    testAudio.addEventListener('canplaythrough', () => {
      this.customAudio = testAudio;
      this.customAudio.loop = true;
      this.useCustomAudio = true;
    }, { once: true });
    testAudio.load();
  }

  initWebAudio() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.audioCtx = new AudioContext();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);

    // Warm Lowpass Filter
    this.filter = this.audioCtx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(650, this.audioCtx.currentTime);
    this.filter.Q.setValueAtTime(1.2, this.audioCtx.currentTime);

    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);
  }

  playWarmPadChord(freqs, duration = 6) {
    if (!this.audioCtx || !this.isPlaying) return;
    const now = this.audioCtx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Mix gentle sine and warm triangle
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle warm detuning for lush stereo-like feel
      const detune = (idx - 2) * 4;
      osc.detune.setValueAtTime(detune, now);

      const maxGain = 0.04 / freqs.length;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(maxGain, now + 2.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.filter);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  playGentleChime(freq) {
    if (!this.audioCtx || !this.isPlaying) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.015, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 3.6);
  }

  scheduleNext() {
    if (!this.isPlaying) return;

    const chord = this.chordProgressions[this.step % this.chordProgressions.length];
    this.playWarmPadChord(chord, 6.5);

    // Occasionally play a soft music box chime
    if (Math.random() > 0.3) {
      setTimeout(() => {
        if (!this.isPlaying) return;
        const note = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)];
        this.playGentleChime(note);
      }, 1500 + Math.random() * 2000);
    }

    this.step++;
    this.timerId = setTimeout(() => this.scheduleNext(), 5500);
  }

  async start() {
    if (this.isPlaying) return;

    if (this.useCustomAudio && this.customAudio) {
      try {
        await this.customAudio.play();
        this.isPlaying = true;
        this.updateUI();
        return;
      } catch (e) {
        // Fallback to web audio if autoplay policy blocked it
      }
    }

    try {
      this.initWebAudio();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.isPlaying = true;
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.linearRampToValueAtTime(0.85, now + 2);

      this.scheduleNext();
      this.updateUI();
    } catch (e) {
      console.warn('Audio start failed:', e);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.customAudio) {
      this.customAudio.pause();
    }

    if (this.audioCtx && this.masterGain) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    }

    this.updateUI();
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  updateUI() {
    const btn = document.getElementById('audioToggleBtn');
    if (!btn) return;

    if (this.isPlaying) {
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Pausar música ambiente');
      btn.title = 'Música ambiente: Tocando';
      const label = btn.querySelector('.audio-label');
      if (label) label.textContent = 'Música';
    } else {
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Tocar música ambiente');
      btn.title = 'Música ambiente: Pausada';
      const label = btn.querySelector('.audio-label');
      if (label) label.textContent = 'Música';
    }
  }
}

window.RomanticAudioEngine = RomanticAudioEngine;
