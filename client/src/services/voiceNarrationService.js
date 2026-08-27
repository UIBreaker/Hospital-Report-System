// High-Performance Speech Synthesis Service for Hospital Presentation Briefing
import { normalizeMedicalSpeechText } from './medicalPhonetics';

class VoiceNarrationService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.selectedVoiceIndex = 0;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.subscribers = new Set();
    this.keepAliveTimer = null;

    if (this.synth) {
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    const allVoices = this.synth.getVoices() || [];
    
    // Prioritize Vietnamese voices
    const viVoices = allVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith('vi'));
    const otherVoices = allVoices.filter(v => !v.lang || !v.lang.toLowerCase().startsWith('vi'));

    // Sort Vietnamese voices to prioritize natural neural voices (Microsoft HoaiMy, NamMinh, Google)
    viVoices.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      if (aName.includes('hoaimy') || aName.includes('hoài my')) return -1;
      if (bName.includes('hoaimy') || bName.includes('hoài my')) return 1;
      if (aName.includes('namminh') || aName.includes('nam minh')) return -1;
      if (bName.includes('namminh') || bName.includes('nam minh')) return 1;
      if (aName.includes('google')) return -1;
      if (bName.includes('google')) return 1;
      return 0;
    });

    this.voices = [...viVoices, ...otherVoices];
    this.notifyStateChange();
  }

  getVoices() {
    return this.voices;
  }

  getVietnameseVoices() {
    return this.voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('vi'));
  }

  setVoice(index) {
    if (index >= 0 && index < this.voices.length) {
      this.selectedVoiceIndex = index;
      this.notifyStateChange();
    }
  }

  setRate(rate) {
    this.rate = Math.max(0.7, Math.min(1.5, Number(rate) || 1.0));
    this.notifyStateChange();
  }

  setPitch(pitch) {
    this.pitch = Math.max(0.8, Math.min(1.2, Number(pitch) || 1.0));
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifyStateChange() {
    const state = {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      voices: this.voices,
      selectedVoiceIndex: this.selectedVoiceIndex,
      rate: this.rate,
      selectedVoice: this.voices[this.selectedVoiceIndex] || null
    };
    this.subscribers.forEach(cb => {
      try { cb(state); } catch (e) { console.error('Voice state subscriber error:', e); }
    });
  }

  /**
   * Speak a text string with complete lifecycle handlers
   */
  speak(rawText, options = {}) {
    if (!this.synth) {
      if (options.onEnd) options.onEnd();
      return;
    }

    this.stop();

    const normalizedText = normalizeMedicalSpeechText(rawText);
    if (!normalizedText || normalizedText.trim().length === 0) {
      if (options.onEnd) options.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(normalizedText);

    // Pick best voice
    const voiceToUse = options.voice || this.voices[this.selectedVoiceIndex] || this.voices.find(v => v.lang?.startsWith('vi')) || null;
    if (voiceToUse) {
      utterance.voice = voiceToUse;
      utterance.lang = voiceToUse.lang || 'vi-VN';
    } else {
      utterance.lang = 'vi-VN';
    }

    utterance.rate = options.rate || this.rate;
    utterance.pitch = options.pitch || this.pitch;
    utterance.volume = options.volume || this.volume;

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.notifyStateChange();
      if (options.onStart) options.onStart({ text: normalizedText });
      this.startKeepAlive();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.stopKeepAlive();
      this.notifyStateChange();
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      // Ignore 'interrupted' or 'canceled' when user deliberately skips/pauses
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis error:', e);
      }
      this.isPlaying = false;
      this.isPaused = false;
      this.stopKeepAlive();
      this.notifyStateChange();
      if (options.onError) options.onError(e);
      else if (options.onEnd) options.onEnd();
    };

    utterance.onboundary = (e) => {
      if (options.onBoundary) {
        options.onBoundary({
          charIndex: e.charIndex,
          charLength: e.charLength,
          name: e.name
        });
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyStateChange();
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notifyStateChange();
    }
  }

  stop() {
    if (this.synth) {
      this.stopKeepAlive();
      this.synth.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notifyStateChange();
    }
  }

  // Workaround for Chromium 15-second speech synthesis pause bug
  startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (this.synth && this.isPlaying && !this.isPaused) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 12000);
  }

  stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}

// Singleton Instance
export const voiceNarrationService = new VoiceNarrationService();
export default voiceNarrationService;
