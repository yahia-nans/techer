import { CallerMood, Language } from '../data/scenarios';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface ListenCallbacks {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (errorCode: string) => void;
  onListeningChange: (listening: boolean) => void;
}

export interface SpeakCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
}

class VoiceEngine {
  private voices: SpeechSynthesisVoice[] = [];
  private recognition: SpeechRecognitionLike | null = null;
  private activeListening = false;
  private voicesLoaded = false;
  private speakSafetyTimer: number | null = null;
  private keepListening = false;
  private lastListenArgs: {
    lang: Language;
    continuous: boolean;
    callbacks: ListenCallbacks;
  } | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.loadVoices();
        window.speechSynthesis.addEventListener?.('voiceschanged', () => {
          this.loadVoices();
        });
      } catch {
        // Ignore restricted environments
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const list = window.speechSynthesis.getVoices();
      if (list && list.length > 0) {
        this.voices = list;
        this.voicesLoaded = true;
      }
    } catch {
      // Ignore
    }
  }

  isTtsSupported(): boolean {
    try {
      return typeof window !== 'undefined' && 'speechSynthesis' in window;
    } catch {
      return false;
    }
  }

  isSttSupported(): boolean {
    try {
      return getSpeechRecognitionCtor() !== null;
    } catch {
      return false;
    }
  }

  getAvailableVoiceSummary(lang: Language): string | null {
    const voice = this.pickVoice(lang);
    return voice ? `${voice.name} (${voice.lang})` : null;
  }

  private pickVoice(lang: Language): SpeechSynthesisVoice | null {
    if (!this.voicesLoaded && this.isTtsSupported()) {
      this.loadVoices();
    }
    if (this.voices.length === 0) return null;

    if (lang === 'ar') {
      return (
        this.voices.find((v) => v.lang.toLowerCase() === 'ar-eg') ||
        this.voices.find((v) => v.lang.toLowerCase() === 'ar-sa') ||
        this.voices.find((v) => v.lang.toLowerCase().startsWith('ar')) ||
        null
      );
    }

    return (
      this.voices.find((v) => v.lang.toLowerCase() === 'en-us') ||
      this.voices.find((v) => v.lang.toLowerCase() === 'en-gb') ||
      this.voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
      null
    );
  }

  stopSpeaking() {
    if (this.speakSafetyTimer) {
      window.clearTimeout(this.speakSafetyTimer);
      this.speakSafetyTimer = null;
    }
    if (this.isTtsSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel errors
      }
    }
  }

  speak(
    text: string,
    lang: Language,
    mood: CallerMood,
    patience: number,
    callbacks?: SpeakCallbacks
  ) {
    if (!this.isTtsSupported() || !text.trim()) {
      callbacks?.onEnd?.();
      return;
    }

    this.stopSpeaking();

    let finished = false;
    const finishOnce = () => {
      if (finished) return;
      finished = true;
      if (this.speakSafetyTimer) {
        window.clearTimeout(this.speakSafetyTimer);
        this.speakSafetyTimer = null;
      }
      callbacks?.onEnd?.();
    };

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-EG' : 'en-US';

      const voice = this.pickVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }

      const lowPatienceBoost = patience < 35 ? 0.08 : 0;
      switch (mood) {
        case 'furious':
          utterance.rate = Math.min(1.35, 1.18 + lowPatienceBoost);
          utterance.pitch = 1.16;
          utterance.volume = 1.0;
          break;
        case 'impatient':
          utterance.rate = Math.min(1.28, 1.12 + lowPatienceBoost);
          utterance.pitch = 1.08;
          utterance.volume = 1.0;
          break;
        case 'sarcastic':
          utterance.rate = 1.0;
          utterance.pitch = 0.93;
          utterance.volume = 0.95;
          break;
        case 'confused':
          utterance.rate = 0.92;
          utterance.pitch = 1.04;
          utterance.volume = 0.95;
          break;
        case 'calm':
        default:
          utterance.rate = 0.98;
          utterance.pitch = 1.0;
          utterance.volume = 0.95;
          break;
      }

      utterance.onstart = () => {
        callbacks?.onStart?.();
      };
      utterance.onend = finishOnce;
      utterance.onerror = finishOnce;

      // Chrome workaround: resume if synthesis queue got paused, plus safety timeout if onend never fires
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);

      const estimatedMs = Math.max(3500, Math.min(14000, text.length * 145));
      this.speakSafetyTimer = window.setTimeout(finishOnce, estimatedMs);
    } catch {
      finishOnce();
    }
  }

  async requestMicPermission(): Promise<{ granted: boolean; error?: string }> {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return { granted: false, error: 'unsupported' };
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return { granted: true };
    } catch (err) {
      const name = err instanceof Error ? err.name : 'unknown';
      return { granted: false, error: name };
    }
  }

  startListening(lang: Language, continuous: boolean, callbacks: ListenCallbacks): boolean {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      callbacks.onError('unsupported');
      return false;
    }

    this.stopListening();
    this.keepListening = continuous;
    this.lastListenArgs = { lang, continuous, callbacks };

    try {
      const recognition = new Ctor();
      recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.activeListening = true;
        callbacks.onListeningChange(true);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = '';
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const piece = result[0]?.transcript || '';
          if (result.isFinal) {
            finalChunk += piece + ' ';
          } else {
            interim += piece;
          }
        }
        if (interim.trim()) {
          callbacks.onInterim(interim.trim());
        }
        if (finalChunk.trim()) {
          callbacks.onFinal(finalChunk.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        this.activeListening = false;
        callbacks.onListeningChange(false);
        const code = event.error || 'unknown';
        if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'audio-capture') {
          this.keepListening = false;
        }
        if (code !== 'aborted' && code !== 'no-speech') {
          callbacks.onError(code);
        } else if (code === 'no-speech' && !this.keepListening) {
          callbacks.onError(code);
        }
      };

      recognition.onend = () => {
        this.activeListening = false;
        if (this.keepListening && this.lastListenArgs) {
          // Auto-restart continuous session cleanly after Chrome silence timeout
          window.setTimeout(() => {
            if (this.keepListening && this.lastListenArgs) {
              this.startListening(
                this.lastListenArgs.lang,
                this.lastListenArgs.continuous,
                this.lastListenArgs.callbacks
              );
            }
          }, 150);
          return;
        }
        callbacks.onListeningChange(false);
      };

      this.recognition = recognition;
      recognition.start();
      return true;
    } catch {
      this.keepListening = false;
      this.activeListening = false;
      callbacks.onListeningChange(false);
      callbacks.onError('start-failed');
      return false;
    }
  }

  stopListening() {
    this.keepListening = false;
    this.lastListenArgs = null;
    if (this.recognition) {
      const rec = this.recognition;
      this.recognition = null;
      try {
        rec.onend = null;
        rec.stop();
      } catch {
        try {
          rec.abort();
        } catch {
          // Ignore
        }
      }
    }
    this.activeListening = false;
  }

  isListening(): boolean {
    return this.activeListening;
  }
}

export const voiceEngine = new VoiceEngine();
