// speech.js - Speech Synthesis (TTS) & Speech Recognition (Voice Dictation)

class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.recognition = null;
    this.isListening = false;
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "es-ES";
    }
  }

  // Text-to-Speech
  speak(text, onEnd = null) {
    if (!this.synth) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (onEnd) utterance.onend = onEnd;

    this.synth.speak(utterance);
  }

  stopSpeech() {
    if (this.synth) this.synth.cancel();
  }

  // Speech-to-Text (Dictado por Voz)
  startListening(onResultCallback, onErrorCallback, onEndCallback) {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      if (onErrorCallback) onErrorCallback("El navegador no soporta reconocimiento de voz por micrófono.");
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    this.recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResultCallback) {
        onResultCallback(finalTranscript, interimTranscript);
      }
    };

    this.recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err);
      this.isListening = false;
      if (onErrorCallback) onErrorCallback(err.error || "Error al acceder al micrófono");
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEndCallback) onEndCallback();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error(e);
      this.isListening = false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
      this.isListening = false;
    }
  }
}

export const Speech = new SpeechEngine();
