// confetti.js - Confetti Particle Effect Wrapper using canvas-confetti

import confetti from 'canvas-confetti';

export function fireStreakConfetti() {
  const streakEl = document.getElementById('header-streak');
  if (streakEl) {
    const rect = streakEl.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // First burst
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { x, y },
      colors: ['#f97316', '#fbbf24', '#6366f1', '#10b981', '#ec4899']
    });

    // Secondary festive fireworks burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: Math.max(0.1, x - 0.1), y },
        colors: ['#38bdf8', '#fbbf24', '#a855f7']
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: Math.min(0.9, x + 0.1), y },
        colors: ['#f43f5e', '#10b981', '#6366f1']
      });
    }, 200);
  } else {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.25 },
      colors: ['#f97316', '#fbbf24', '#6366f1', '#10b981', '#ec4899']
    });
  }
}

export function fireCelebrationConfetti() {
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}
