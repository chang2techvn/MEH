// Text-to-Speech utility for vocabulary pronunciation
export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly THROTTLE_DELAY = 500; // 500ms throttle

  constructor() {
    // Only initialize in client-side environment
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      
      // Handle voices loaded event
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    
    this.voices = this.synth.getVoices();
  }

  // Get the best English voice available (prioritize Google voices, then female voices)
  private getEnglishVoice(): SpeechSynthesisVoice | null {
    // First priority: Google voices
    const googleVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en-') && 
      voice.name.toLowerCase().includes('google')
    );
    
    if (googleVoices.length > 0) {
      // Prefer Google US English, then Google UK English
      return googleVoices.find(voice => voice.lang === 'en-US') ||
             googleVoices.find(voice => voice.lang === 'en-GB') ||
             googleVoices[0];
    }
    
    
    // Fallback: Prioritize native English voices (any gender)
    const englishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en-') && voice.localService
    );
    
    if (englishVoices.length > 0) {
      // Prefer US English, then UK English
      return englishVoices.find(voice => voice.lang === 'en-US') ||
             englishVoices.find(voice => voice.lang === 'en-GB') ||
             englishVoices[0];
    }
    
    // Last fallback to any English voice
    const anyEnglishVoice = this.voices.find(voice => voice.lang.startsWith('en-'));
    return anyEnglishVoice || null;
  }

  // Speak the given text
  public speak(text: string, options: {
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if synthesis is available
      if (!this.synth) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Throttle rapid fire requests
      const now = Date.now();
      if (now - this.lastSpeakTime < this.THROTTLE_DELAY) {
        resolve(); // Skip if called too frequently
        return;
      }
      this.lastSpeakTime = now;

      // Cancel any ongoing speech
      this.synth.cancel();

      if (!text.trim()) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      const voice = this.getEnglishVoice();
      if (voice) {
        utterance.voice = voice;
      }
      
      // Set speech parameters
      utterance.rate = options.rate || 0.9; // Slightly slower for clarity
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = 'en-US';

      // Handle events
      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      
      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.isSpeaking = false;
        // Only treat non-interrupted errors as actual errors
        if (event.error === 'interrupted' || event.error === 'canceled') {
          // These are expected when user clicks multiple times quickly
          resolve();
        } else {
          console.error('Speech synthesis error:', event);
          reject(new Error(`Speech synthesis failed: ${event.error}`));
        }
      };

      // Speak
      this.isSpeaking = true;
      this.synth.speak(utterance);
    });
  }

  // Stop any ongoing speech
  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  // Check if currently speaking
  public get speaking(): boolean {
    return this.isSpeaking || (this.synth ? this.synth.speaking : false);
  }

  // Check if speech synthesis is supported
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && this.synth !== null;
  }

  // Get available voices for debugging
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  // Get available English voices for debugging
  public getAvailableEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en-'));
  }

  // Get currently selected voice
  public getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.getEnglishVoice();
  }
}

// Create a singleton instance
export const textToSpeechService = new TextToSpeechService();

// Helper function for vocabulary pronunciation
export const pronounceVocabulary = async (
  term: string, 
  pronunciation?: string,
  showError: (message: string) => void = console.error
) => {
  try {
    if (!textToSpeechService.isSupported()) {
      showError('Text-to-speech is not supported in this browser');
      return;
    }

    // Use pronunciation guide if available, otherwise use the term
    const textToSpeak = term;

    await textToSpeechService.speak(textToSpeak, {
      rate: 0.8, // Slower for vocabulary learning
      pitch: 1.0,
      volume: 1.0
    });
  } catch (error: any) {
    // Only show error if it's not an interruption/cancellation
    if (error.message && !error.message.includes('interrupted') && !error.message.includes('canceled')) {
      console.error('Failed to pronounce vocabulary:', error);
      showError('Failed to pronounce the word. Please try again.');
    }
    // For interrupted/canceled errors, silently ignore them as they're expected
  }
};
