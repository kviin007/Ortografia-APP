// timer.js - Pomodoro Timer, Stopwatch & Web Audio Ambient Sound Generator

import { Notifications } from "./notifications.js";
import { Progress } from "./progress.js";
import { fireCelebrationConfetti } from "./confetti.js";

class TimerEngine {
  constructor() {
    this.secondsLeft = 25 * 60; // 25 min Pomodoro
    this.initialSeconds = 25 * 60;
    this.isRunning = false;
    this.timerId = null;
    this.mode = "pomodoro"; // pomodoro, short_break, long_break
    this.listeners = [];

    this.audioCtx = null;
    this.ambientNodes = {};
  }

  onTick(callback) {
    this.listeners.push(callback);
  }

  notify() {
    const minutes = Math.floor(this.secondsLeft / 60);
    const seconds = this.secondsLeft % 60;
    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    this.listeners.forEach(cb => cb({ secondsLeft: this.secondsLeft, formatted, isRunning: this.isRunning, mode: this.mode }));
  }

  setMode(mode) {
    this.stop();
    this.mode = mode;
    if (mode === "pomodoro") this.initialSeconds = 25 * 60;
    else if (mode === "short_break") this.initialSeconds = 5 * 60;
    else if (mode === "long_break") this.initialSeconds = 15 * 60;

    this.secondsLeft = this.initialSeconds;
    this.notify();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.notify();

    this.timerId = setInterval(async () => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
        this.notify();
      } else {
        this.stop();
        this.playChime();
        fireCelebrationConfetti();

        const durationMin = Math.round(this.initialSeconds / 60);
        if (this.mode === "pomodoro") {
          Notifications.sendSystemNotification(
            "⚡ Sesión de Trabajo Profundo Completada",
            `¡Felicitaciones! Has completado ${durationMin} minutos de estudio profundo.`
          );
          await Progress.recordSession({
            module: "concentracion",
            durationMinutes: durationMin,
            xpEarned: 35
          });
        } else {
          Notifications.sendSystemNotification(
            "🔔 Tiempo de Descanso Finalizado",
            "Tu pausa ha terminado. ¡Listo para reanudar el estudio!"
          );
        }

        this.notify();
      }
    }, 1000);
  }

  stop() {
    if (this.timerId) clearInterval(this.timerId);
    this.isRunning = false;
    this.notify();
  }

  reset() {
    this.stop();
    this.secondsLeft = this.initialSeconds;
    this.notify();
  }

  // Web Audio Chime Sound
  playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 1.2); // C6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  // Web Audio Relaxing White Noise / Rain Ambient Generator
  toggleAmbientRain(enable) {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (enable) {
        if (this.ambientNodes.rain) return;
        const bufferSize = this.audioCtx.sampleRate * 2;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 800; // Rain-like frequency filter

        const gain = this.audioCtx.createGain();
        gain.gain.value = 0.15;

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        whiteNoise.start();
        this.ambientNodes.rain = { whiteNoise, gain };
      } else {
        if (this.ambientNodes.rain) {
          this.ambientNodes.rain.whiteNoise.stop();
          delete this.ambientNodes.rain;
        }
      }
    } catch (e) {
      console.warn("Rain ambient error:", e);
    }
  }
}

export const Timer = new TimerEngine();
