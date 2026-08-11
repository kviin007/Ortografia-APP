// notifications.js - Toast Notifications & System Desktop Cues Engine

class NotificationManager {
  constructor() {
    this.container = null;
    this.initContainer();
    this.requestSystemPermission();
  }

  initContainer() {
    if (document.getElementById("toast-container")) return;
    this.container = document.createElement("div");
    this.container.id = "toast-container";
    this.container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none";
    document.body.appendChild(this.container);
  }

  requestSystemPermission() {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      try {
        Notification.requestPermission();
      } catch (e) {
        // Silently handle if blocked by browser policy
      }
    }
  }

  sendSystemNotification(title, body) {
    this.show(`${title}: ${body}`, "success", 5000);
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "✍️" });
      } catch (e) {
        console.warn("Desktop notification error:", e);
      }
    }
  }

  show(message, type = "success", duration = 3500) {
    this.initContainer();

    const toast = document.createElement("div");
    toast.className = `pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-2xl border text-sm font-semibold animate-fade-in transition-all backdrop-blur-xl ${
      type === "success"
        ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-500/10"
        : type === "warning"
        ? "bg-amber-950/90 text-amber-200 border-amber-500/40 shadow-amber-500/10"
        : type === "error"
        ? "bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-500/10"
        : "bg-indigo-950/90 text-indigo-200 border-indigo-500/40 shadow-indigo-500/10"
    }`;

    const icon = type === "success" ? "✅" : type === "warning" ? "⚠️" : type === "error" ? "❌" : "ℹ️";

    toast.innerHTML = `
      <span class="text-xl">${icon}</span>
      <span class="flex-1 text-xs leading-relaxed">${message}</span>
      <button class="ml-2 text-xs opacity-70 hover:opacity-100 p-1" onclick="this.parentElement.remove()">✕</button>
    `;

    this.container.appendChild(toast);

    if (type === "success") this.playBeep(800, 0.1);
    else if (type === "error") this.playBeep(300, 0.2);

    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, duration);
  }

  playBeep(freq = 600, duration = 0.1) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Quiet fail if web audio disabled
    }
  }
}

export const Notifications = new NotificationManager();
