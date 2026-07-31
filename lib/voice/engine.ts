/**
 * SIA Voice Engine — Production-grade speech synthesis controller
 *
 * Features:
 * - Queue management (sequential, never overlapping)
 * - Cancel / interrupt support
 * - Pause / resume
 * - Mute (persists)
 * - Replay (re-speak last message)
 * - Speech rate / pitch / volume (persisted)
 * - Debounce duplicate narration
 * - Auto voice selection (female, en-IN → en-UK → en-US preference)
 * - Graceful fallback when SpeechSynthesis unavailable
 */

export interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  muted: boolean;
}

export interface VoiceEngineState {
  supported: boolean;
  speaking: boolean;
  paused: boolean;
  muted: boolean;
  voicesLoaded: boolean;
}

export type VoiceStateListener = (state: VoiceEngineState) => void;

const SETTINGS_KEY = 'sia-voice-settings';
const DEFAULT_SETTINGS: VoiceSettings = {
  rate: 0.95,
  pitch: 1.05,
  volume: 1,
  muted: false,
};

const LOCALE_LANG: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  te: 'te-IN',
};

// Female voice name hints across platforms
const FEMALE_HINTS =
  /female|woman|samantha|sonia|priya|kalpana|veena|tessa|serena|fiona|moira|sara|zira|google uk english female|google india english female|aria|jenny|astra/i;
const MALE_HINTS = /male|man|david|george|ravi|alex|daniel|oliver|arthur|guy|james/i;

let _engine: VoiceEngine | null = null;

export class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private supported = false;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  private queue: string[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lastSpokenText: string | null = null;
  private lastSpokenAt = 0;

  private speaking = false;
  private paused = false;
  private muted = false;

  private settings: VoiceSettings = { ...DEFAULT_SETTINGS };
  private locale = 'en';

  private listeners = new Set<VoiceStateListener>();
  private voiceResolveQueue: Array<() => void> = [];
  private retryCount = 0;
  private disposed = false;

  private constructor() {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    this.synth = window.speechSynthesis;
    this.supported = true;
    this.loadSettings();
    this.setupVoices();

    // Resume hack: Chrome pauses synthesis after ~15s
    if (this.supported) {
      setInterval(() => {
        if (this.speaking && !this.paused && this.synth) {
          this.synth.resume();
        }
      }, 10000);
    }
  }

  static getInstance(): VoiceEngine {
    if (!_engine) {
      _engine = new VoiceEngine();
    }
    return _engine;
  }

  // ── Setup ──────────────────────────────────────────────────────────────

  private loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        this.muted = this.settings.muted;
      }
    } catch {
      // localStorage unavailable
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  private setupVoices() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth!.getVoices();
      if (voices.length > 0) {
        this.voices = voices;
        this.voicesLoaded = true;
        this.selectVoice();
        this.notify();
        // Resolve any waiting promises
        this.voiceResolveQueue.forEach((resolve) => resolve());
        this.voiceResolveQueue = [];
      }
    };

    loadVoices();

    if (!this.voicesLoaded) {
      this.synth.addEventListener('voiceschanged', loadVoices);
      // Retry fallback — some browsers don't fire voiceschanged promptly
      const retry = setInterval(() => {
        if (this.voicesLoaded || this.disposed) {
          clearInterval(retry);
          return;
        }
        this.retryCount++;
        loadVoices();
        if (this.retryCount > 10) clearInterval(retry);
      }, 250);
    }
  }

  private selectVoice() {
    const targetLang = LOCALE_LANG[this.locale] || 'en-IN';

    // Priority order: exact female → exact any → lang-prefix female → lang-prefix any → en female → en any
    const candidates: SpeechSynthesisVoice[] = [
      // Exact match, female
      this.voices.find(
        (v) => v.lang === targetLang && FEMALE_HINTS.test(v.name) && !MALE_HINTS.test(v.name)
      ),
      // Exact match, not male
      this.voices.find((v) => v.lang === targetLang && !MALE_HINTS.test(v.name)),
      // Exact match, any
      this.voices.find((v) => v.lang === targetLang),
      // Prefix match (en-IN → en), female
      this.voices.find(
        (v) =>
          v.lang.startsWith(targetLang.split('-')[0]) &&
          FEMALE_HINTS.test(v.name) &&
          !MALE_HINTS.test(v.name)
      ),
      // Prefix match, not male
      this.voices.find(
        (v) => v.lang.startsWith(targetLang.split('-')[0]) && !MALE_HINTS.test(v.name)
      ),
      // Prefix match, any
      this.voices.find((v) => v.lang.startsWith(targetLang.split('-')[0])),
      // English fallback, female
      this.voices.find((v) => v.lang.startsWith('en') && FEMALE_HINTS.test(v.name)),
      // English fallback, not male
      this.voices.find((v) => v.lang.startsWith('en') && !MALE_HINTS.test(v.name)),
      // English fallback, any
      this.voices.find((v) => v.lang.startsWith('en')),
      // Any voice
      this.voices[0],
    ].filter(Boolean) as SpeechSynthesisVoice[];

    this.selectedVoice = candidates[0] || null;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  setLocale(locale: string) {
    if (this.locale === locale) return;
    this.locale = locale;
    if (this.voicesLoaded) this.selectVoice();
  }

  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  updateSettings(partial: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...partial };
    if (partial.muted !== undefined) {
      this.muted = partial.muted;
      if (this.muted) {
        this.cancel();
      }
    }
    this.saveSettings();
    this.notify();
  }

  getRate() { return this.settings.rate; }
  getPitch() { return this.settings.pitch; }
  getVolume() { return this.settings.volume; }

  setRate(rate: number) { this.updateSettings({ rate }); }
  setPitch(pitch: number) { this.updateSettings({ pitch }); }
  setVolume(volume: number) { this.updateSettings({ volume }); }

  isMuted() { return this.muted; }
  isSupported() { return this.supported; }
  isSpeaking() { return this.speaking; }
  isPaused() { return this.paused; }
  areVoicesLoaded() { return this.voicesLoaded; }

  getState(): VoiceEngineState {
    return {
      supported: this.supported,
      speaking: this.speaking,
      paused: this.paused,
      muted: this.muted,
      voicesLoaded: this.voicesLoaded,
    };
  }

  subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  // ── Speaking ───────────────────────────────────────────────────────────

  /**
   * Speak text immediately, cancelling any current speech.
   * Use for primary narration.
   */
  speak(text: string, immediate = true) {
    if (!this.supported || !this.synth || !text.trim()) return;
    if (this.muted) return;

    // Debounce: skip if same text spoken within last 3 seconds
    const now = Date.now();
    if (
      immediate &&
      text === this.lastSpokenText &&
      now - this.lastSpokenAt < 3000
    ) {
      return;
    }

    if (immediate) {
      this.cancel();
      this.lastSpokenText = text;
      this.lastSpokenAt = now;
      this.processQueue(text);
    } else {
      this.queue.push(text);
      if (!this.speaking) {
        this.processNext();
      }
    }
  }

  /**
   * Queue text to speak after current speech finishes.
   */
  enqueue(text: string) {
    this.speak(text, false);
  }

  private processQueue(text: string) {
    const utterance = this.createUtterance(text);
    this.currentUtterance = utterance;
    this.speaking = true;
    this.paused = false;
    this.notify();

    try {
      this.synth!.speak(utterance);
    } catch {
      this.speaking = false;
      this.notify();
    }
  }

  private processNext() {
    if (this.queue.length === 0) {
      this.speaking = false;
      this.notify();
      return;
    }
    if (this.muted) {
      this.queue = [];
      this.speaking = false;
      this.notify();
      return;
    }
    const text = this.queue.shift()!;
    this.processQueue(text);
  }

  private createUtterance(text: string): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALE_LANG[this.locale] || 'en-IN';
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (this.queue.length > 0) {
        this.processNext();
      } else {
        this.speaking = false;
        this.notify();
      }
    };

    utterance.onerror = (e) => {
      // 'interrupted' and 'canceled' are expected from cancel() — don't treat as errors
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        // Retry once on network error
        // Silent fail — UI shows captions regardless
      }
      this.currentUtterance = null;
      this.speaking = false;
      this.paused = false;
      this.queue = [];
      this.notify();
    };

    return utterance;
  }

  // ── Controls ───────────────────────────────────────────────────────────

  cancel() {
    if (!this.synth) return;
    this.queue = [];
    this.currentUtterance = null;
    this.speaking = false;
    this.paused = false;
    this.synth.cancel();
    this.notify();
  }

  pause() {
    if (!this.synth || !this.speaking || this.paused) return;
    this.synth.pause();
    this.paused = true;
    this.notify();
  }

  resume() {
    if (!this.synth || !this.paused) return;
    this.synth.resume();
    this.paused = false;
    this.notify();
  }

  togglePause() {
    if (this.paused) this.resume();
    else this.pause();
  }

  mute() {
    this.updateSettings({ muted: true });
  }

  unmute() {
    this.updateSettings({ muted: false });
  }

  toggleMute() {
    if (this.muted) this.unmute();
    else this.mute();
  }

  replay() {
    if (!this.lastSpokenText) return;
    this.speak(this.lastSpokenText);
  }

  hasLastSpoken() { return this.lastSpokenText !== null; }
  getLastSpoken() { return this.lastSpokenText; }

  /**
   * Wait for voices to load (with timeout).
   */
  async waitForVoices(timeoutMs = 2000): Promise<boolean> {
    if (this.voicesLoaded) return true;
    return new Promise<boolean>((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(this.voicesLoaded);
        }
      }, timeoutMs);

      this.voiceResolveQueue.push(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(true);
        }
      });
    });
  }

  dispose() {
    this.disposed = true;
    this.cancel();
    this.listeners.clear();
  }
}

// ── Singleton accessor ────────────────────────────────────────────────────

export function getVoiceEngine(): VoiceEngine {
  return VoiceEngine.getInstance();
}
