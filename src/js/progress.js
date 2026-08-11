// progress.js - Study Metrics, Streaks, Adaptive Difficulty & Learning Analytics

import { Auth } from "./auth.js";
import { Storage } from "./storage.js";
import { Gamification } from "./gamification.js";
import { fireStreakConfetti } from "./confetti.js";
import { Notifications } from "./notifications.js";

class ProgressEngine {
  async recordSession(sessionData) {
    const user = Auth.getUser();
    const today = new Date().toISOString().split("T")[0];

    // Check streak
    if (user.lastStudyDate) {
      const last = new Date(user.lastStudyDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr - last) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1; // Streak reset if missed
      }
    } else {
      user.streak = 1;
    }
    user.lastStudyDate = today;

    // Daily goal reset check
    if (user.lastDailyGoalDate !== today) {
      user.todayMinutesStudied = 0;
      user.todayWordsWritten = 0;
      user.lastDailyGoalDate = today;
    }

    // Update study time & daily progress
    const addedMinutes = sessionData.durationMinutes || 5;
    const addedWords = sessionData.wordsWritten || 0;

    user.totalStudyTimeMinutes = (user.totalStudyTimeMinutes || 0) + addedMinutes;
    user.todayMinutesStudied = (user.todayMinutesStudied || 0) + addedMinutes;

    user.totalWordsWritten = (user.totalWordsWritten || 0) + addedWords;
    user.todayWordsWritten = (user.todayWordsWritten || 0) + addedWords;

    const dailyTargetMinutes = user.dailyGoalMinutes || 25;
    const previousPct = Math.min(100, Math.round(((user.todayMinutesStudied - addedMinutes) / dailyTargetMinutes) * 100));
    const currentPct = Math.min(100, Math.round((user.todayMinutesStudied / dailyTargetMinutes) * 100));

    // Check if daily goal achieved right now
    if (previousPct < 100 && currentPct >= 100) {
      fireStreakConfetti();
      Notifications.show(`🎉 ¡Meta Diaria de Estudio Cumplida! Has completado tus ${dailyTargetMinutes} minutos de hoy.`, "success", 5000);
    }

    // Save history log
    const log = {
      id: `hist_${Date.now()}`,
      userId: user.id,
      module: sessionData.module,
      score: sessionData.score || 100,
      durationMinutes: addedMinutes,
      wordsWritten: addedWords,
      date: new Date().toISOString(),
      details: sessionData.details || ""
    };

    await Storage.saveRecord("history", log);
    await Auth.addXP(sessionData.xpEarned || 20);
    await Auth.saveUser();

    // Auto check achievement badges
    await Gamification.checkAndAwardBadges();
  }

  async getRecentActivity(limit = 5) {
    const user = Auth.getUser();
    const history = await Storage.getAllRecords("history");
    return history
      .filter(h => h.userId === user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }

  // Adaptive difficulty predictor
  calculateAdaptiveLevel(accuracyRate) {
    if (accuracyRate >= 90) return "Avanzado / Experto";
    if (accuracyRate >= 75) return "Intermedio";
    if (accuracyRate >= 60) return "Básico";
    return "Principiante";
  }
}

export const Progress = new ProgressEngine();
