// app.js - Main Application Controller & View Renderers

import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "./router.js";
import { Auth } from "./auth.js";
import { Progress } from "./progress.js";
import { Storage } from "./storage.js";
import { Settings } from "./settings.js";
import { MODULES_DATA } from "../data/courses.js";
import { EXERCISES_DATABASE } from "../data/exercises.js";
import { AnalyticsCharts } from "./charts.js";
import { CalendarWidget } from "./calendar.js";
import { Timer } from "./timer.js";
import { SmartEditor } from "./editor.js";
import { AIEngine } from "./ai.js";
import { Speech } from "./speech.js";
import { Notifications } from "./notifications.js";
import { ReportGenerator } from "./reports.js";
import { BADGES_LIST, SHOP_ITEMS, Gamification } from "./gamification.js";
import { AdminPanel } from "./admin.js";
import { WeeklyProgressChart } from "../components/WeeklyProgressChart.tsx";
import { MultiMetricProgressChart } from "../components/MultiMetricProgressChart.tsx";
import { fireStreakConfetti, fireCelebrationConfetti } from "./confetti.js";
import { VocabularyEngine } from "./vocabulary.js";
import { MecanografiaEngine } from "./mecanografia.js";

class AppController {
  async init() {
    await Storage.initDB();
    await Auth.init();
    Settings.init();

    this.registerViews();
    this.bindGlobalEvents();
    this.updateHeaderUI();

    Auth.onChange(() => this.updateHeaderUI());

    // Boot default view
    Router.navigateTo("dashboard", {}, true);
  }

  updateHeaderUI() {
    const user = Auth.getUser();
    const avatarEl = document.getElementById("header-avatar");
    const nameEl = document.getElementById("header-name");
    const xpEl = document.getElementById("header-xp");
    const coinsEl = document.getElementById("header-coins");
    const streakEl = document.getElementById("header-streak");
    const levelTitleEl = document.getElementById("header-level-title");

    if (avatarEl) avatarEl.textContent = user.avatar;
    if (nameEl) nameEl.textContent = user.name;
    if (xpEl) xpEl.textContent = `${user.xp} XP`;
    if (coinsEl) coinsEl.textContent = `${user.coins}`;
    if (streakEl) streakEl.textContent = `🔥 ${user.streak} Días`;
    if (levelTitleEl) levelTitleEl.textContent = `Nivel ${user.level} (${user.levelTitle})`;
  }

  bindGlobalEvents() {
    // Expose modules globally for inline onclick handlers
    window.Speech = Speech;
    window.Vocabulary = VocabularyEngine;
    window.Gamification = Gamification;
    window.Timer = Timer;
    window.Settings = Settings;
    window.Auth = Auth;
    window.Progress = Progress;
    window.Storage = Storage;
    window.SmartEditor = SmartEditor;
    window.AIEngine = AIEngine;
    window.Notifications = Notifications;
    window.ReportGenerator = ReportGenerator;
    window.AdminPanel = AdminPanel;
    window.Router = Router;
    window.App = this;

    // Navigation clicks
    document.querySelectorAll("[data-nav]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const view = e.currentTarget.getAttribute("data-nav");
        this.setActiveNav(view);
        Router.navigateTo(view);

        // Close mobile drawer if open
        const sidebar = document.getElementById("app-sidebar");
        if (sidebar) sidebar.classList.remove("open");
      });
    });

    // Mobile drawer toggle & close
    const toggleBtn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("close-mobile-menu-btn");
    const sidebar = document.getElementById("app-sidebar");

    if (toggleBtn && sidebar) {
      toggleBtn.onclick = () => sidebar.classList.toggle("open");
    }
    if (closeBtn && sidebar) {
      closeBtn.onclick = () => sidebar.classList.remove("open");
    }

    // Header interactive badges
    const streakBadge = document.getElementById("header-streak");
    if (streakBadge) {
      streakBadge.classList.add("cursor-pointer", "hover:scale-105", "transition-transform");
      streakBadge.onclick = () => {
        const user = Auth.getUser();
        fireStreakConfetti();
        Notifications.show(`🔥 Racha activa: ${user.streak} días consecutivos de estudio. ¡Meta diaria en curso!`, "success");
      };
    }

    const coinsBadge = document.getElementById("header-coins");
    if (coinsBadge) {
      coinsBadge.classList.add("cursor-pointer", "hover:scale-105", "transition-transform");
      coinsBadge.onclick = () => {
        this.setActiveNav("tienda");
        Router.navigateTo("tienda");
      };
    }

    const xpBadge = document.getElementById("header-xp");
    if (xpBadge) {
      xpBadge.classList.add("cursor-pointer", "hover:scale-105", "transition-transform");
      xpBadge.onclick = () => {
        const user = Auth.getUser();
        Notifications.show(`🎓 ${user.xp} XP acumulados. Siguiente nivel a los ${user.xpToNextLevel} XP.`, "info");
      };
    }

    const userProfileArea = document.getElementById("header-avatar")?.parentElement?.parentElement;
    if (userProfileArea) {
      userProfileArea.classList.add("cursor-pointer", "hover:opacity-80", "transition-all");
      userProfileArea.onclick = () => {
        this.setActiveNav("admin");
        Router.navigateTo("admin");
      };
    }

    // Keyboard Shortcuts (Ctrl+K for search, ? for shortcuts modal)
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.openGlobalSearchModal();
      } else if (e.key === "?" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        this.openShortcutsModal();
      } else if (e.key === "Escape") {
        document.getElementById("search-modal")?.remove();
        document.getElementById("shortcuts-modal")?.remove();
        document.getElementById("badge-detail-modal")?.remove();
        document.getElementById("adjust-goal-modal")?.remove();
        document.getElementById("vocabulary-modal")?.remove();
        document.getElementById("exit-confirm-modal")?.remove();
      }
    });

    // Theme Switcher Button
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const current = Settings.settings.theme;
        const next = current === "light" ? "dark" : "light";
        Settings.update({ theme: next });
        Notifications.show(`Modo ${next === "dark" ? "Oscuro" : "Claro"} activado`, "info");
      });
    }
  }

  setActiveNav(viewName) {
    document.querySelectorAll("[data-nav]").forEach(btn => {
      const isMatch = btn.getAttribute("data-nav") === viewName;
      if (isMatch) {
        btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white bg-indigo-600/30 font-bold border border-indigo-500/30 shadow-md shadow-indigo-500/10";
      } else {
        btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10";
      }
    });
  }

  registerViews() {
    // 1. DASHBOARD VIEW
    Router.registerRoute("dashboard", (container) => {
      this.setActiveNav("dashboard");
      const user = Auth.getUser();
      user.moduleLevels = user.moduleLevels || {};
      user.commonMistakes = user.commonMistakes || [];

      // Calculate dynamic level (1-10) based on accuracy rate, XP and completed modules
      const calculatedLevel = Math.min(10, Math.max(1, user.level || Math.floor((user.xp || 100) / 200) + 1));
      const xpNeeded = user.xpToNextLevel || 300;
      const progressPct = Math.min(100, Math.round((user.xp / xpNeeded) * 100));

      const todayMinutes = user.todayMinutesStudied || 0;
      const targetMinutes = user.dailyGoalMinutes || 25;
      const dailyGoalPct = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));

      const badgesWithStatus = Gamification.getBadgesWithStatus();
      const unlockedCount = badgesWithStatus.filter(b => b.unlocked).length;

      // Common Mistakes list sorted by frequency
      const frequentMistakes = [...user.commonMistakes].sort((a,b) => (b.count || 1) - (a.count || 1)).slice(0, 5);

      container.innerHTML = `
        <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
          <!-- Hero Banner (Frosted Glass) -->
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-slate-900/90 backdrop-blur-xl border border-white/10 text-white p-6 md:p-8 shadow-2xl shadow-indigo-500/10">
            <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span class="inline-block px-3.5 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-3">
                  ¡Hola de nuevo, ${user.name}! 👋
                </span>
                <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">Continúa dominando el lenguaje y la escritura</h1>
                <p class="text-slate-300 text-sm mt-2 max-w-xl">
                  Racha de ${user.streak} días consecutivos. Has acumulado ${user.totalStudyTimeMinutes || 0} minutos de práctica y ${user.totalWordsWritten || 0} palabras redactadas.
                </p>
              </div>
              <button data-nav="modulos" class="px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all">
                ⚡ Ir a Módulos Educativos
              </button>
            </div>
          </div>

          <!-- Componente de Barra de Progreso Persistente: Nivel Académico (1-10) y Experiencia (XP) -->
          <div class="bg-gradient-to-r from-slate-900/90 via-purple-950/80 to-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 ring-4 ring-purple-400/40">
                  N${calculatedLevel}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="font-extrabold text-white text-lg">Nivel Académico Dificultad ${calculatedLevel} de 10</h2>
                    <span class="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-extrabold">${user.levelTitle || 'Estudiante Avanzado'}</span>
                  </div>
                  <p class="text-xs text-slate-300 mt-1">
                    Precisión acumulada: <strong class="text-emerald-400 font-bold">${user.accuracyRate || 88}%</strong> | Basado en el porcentaje de aciertos y el historial de práctica
                  </p>
                </div>
              </div>

              <div class="flex flex-col items-start md:items-end">
                <span class="text-xs font-black text-purple-200 bg-purple-500/20 px-4 py-2 rounded-2xl border border-purple-500/40 shadow-md">
                  ${user.xp} / ${xpNeeded} XP
                </span>
                <span class="text-[11px] text-slate-400 mt-1 font-semibold">
                  Faltan ${Math.max(0, xpNeeded - user.xp)} XP para subir al Nivel ${Math.min(10, calculatedLevel + 1)}
                </span>
              </div>
            </div>

            <!-- Main XP Progress Bar -->
            <div class="space-y-2">
              <div class="flex justify-between items-center text-xs font-extrabold text-slate-200">
                <span class="flex items-center gap-2">
                  <span>🎓 Progreso hacia el Nivel ${Math.min(10, calculatedLevel + 1)}</span>
                </span>
                <span class="text-purple-300">${progressPct}% completado</span>
              </div>
              <div class="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-purple-500/30 shadow-inner">
                <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(168,85,247,0.6)]" style="width: ${progressPct}%"></div>
              </div>
            </div>

            <!-- Breakdown of Levels by Educational Module -->
            <div class="pt-3 flex flex-wrap gap-2.5 items-center text-xs">
              <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Nivel Dinámico por Módulo:</span>
              <span class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold flex items-center gap-1.5">
                ✍️ Ortografía: <strong class="text-indigo-400">Nivel ${user.moduleLevels.ortografia || 1}/10</strong>
              </span>
              <span class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold flex items-center gap-1.5">
                ✅ Gramática: <strong class="text-purple-400">Nivel ${user.moduleLevels.gramatica || 1}/10</strong>
              </span>
              <span class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold flex items-center gap-1.5">
                📖 Comprensión: <strong class="text-emerald-400">Nivel ${user.moduleLevels.comprension || 1}/10</strong>
              </span>
              <span class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold flex items-center gap-1.5">
                📝 Redacción: <strong class="text-amber-400">Nivel ${user.moduleLevels.redaccion || 1}/10</strong>
              </span>
            </div>
          </div>

          <!-- Historial de Errores Comunes y Repaso Específico con IA -->
          <div class="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-rose-500/30 shadow-2xl space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-2xl flex items-center justify-center">
                  ⚠️
                </div>
                <div>
                  <h3 class="font-extrabold text-white text-base">Historial de Errores Comunes y Repaso Específico</h3>
                  <p class="text-xs text-slate-300">Reglas y palabras donde has fallado con frecuencia para reforzar tu aprendizaje</p>
                </div>
              </div>
              <button id="btn-generate-error-review" class="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition-all shadow-lg shadow-rose-500/30 flex items-center gap-2">
                ⚡ Generar Ejercicio de Repaso con IA
              </button>
            </div>

            ${frequentMistakes.length === 0 ? `
              <div class="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                <p class="text-sm font-bold text-emerald-300">🎉 ¡Sin errores frecuentes registrados!</p>
                <p class="text-xs text-slate-400">A medida que realices ejercicios y exámenes, aquí se guardarán automáticamente las reglas gramaticales y palabras que necesites reforzar.</p>
              </div>
            ` : `
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${frequentMistakes.map(m => `
                  <div class="p-4 rounded-2xl bg-white/5 border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-2 relative group">
                    <div class="flex justify-between items-start">
                      <span class="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        Fallado ${m.count || 1} ${m.count === 1 ? 'vez' : 'veces'}
                      </span>
                      <span class="text-[10px] text-slate-400 font-mono">${m.module || 'General'}</span>
                    </div>
                    <p class="font-bold text-xs text-white line-clamp-2">${m.question}</p>
                    ${m.rule ? `<p class="text-[11px] text-rose-300 italic font-semibold">Regla: ${m.rule}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Daily Study Goal Progress Bar -->
          <div class="bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-300">
                  🎯
                </div>
                <div>
                  <h3 class="font-extrabold text-white text-base">Meta Diaria de Estudio</h3>
                  <p class="text-xs text-slate-300">Avanza completando lecciones o redactando en el Editor Inteligente</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3.5 py-1.5 rounded-xl border border-indigo-500/20">
                  ${todayMinutes} / ${targetMinutes} min hoy
                </span>
                <button id="adjust-goal-btn" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all">
                  ✏️ Ajustar Meta
                </button>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Progreso acumulado hoy</span>
                <span class="text-indigo-400">${dailyGoalPct}% ${dailyGoalPct >= 100 ? '🎉 ¡META ALCANZADA!' : ''}</span>
              </div>
              <div class="w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(99,102,241,0.6)]" style="width: ${dailyGoalPct}%"></div>
              </div>
            </div>
          </div>

          <!-- Unlockable Achievement Badges Section -->
          <div class="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-extrabold text-white text-lg flex items-center gap-2">
                  🏆 Insignias y Hitos de Logro
                </h3>
                <p class="text-xs text-slate-300">Desbloquea insignias a medida que progresas en racha, palabras y precisión</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                ${unlockedCount} / ${badgesWithStatus.length} Desbloqueadas
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              ${badgesWithStatus.map(b => `
                <div onclick="window.showBadgeDetail('${b.id}')" class="p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-2 relative group ${
                  b.unlocked 
                    ? 'bg-gradient-to-b from-indigo-500/10 to-purple-500/20 border-indigo-500/40 hover:border-indigo-400 hover:scale-105 shadow-lg shadow-indigo-500/10' 
                    : 'bg-slate-900/40 border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                }">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl relative ${
                    b.unlocked ? 'bg-indigo-500/20 border border-indigo-400/30 ring-2 ring-indigo-500/30' : 'bg-slate-800/80 grayscale'
                  }">
                    ${b.icon}
                    ${!b.unlocked ? `<span class="absolute -top-1 -right-1 bg-slate-900 text-[10px] p-0.5 rounded-full border border-white/20">🔒</span>` : ''}
                  </div>
                  <div>
                    <p class="font-bold text-xs text-white line-clamp-1">${b.title}</p>
                    <p class="text-[10px] text-indigo-300 font-semibold mt-0.5">${b.unlocked ? '✓ Desbloqueada' : 'Bloqueada'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Quick Stats Cards (Frosted Glass) -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div id="dash-stat-streak" class="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4 hover:border-white/20 cursor-pointer transition-all">
              <div class="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-2xl">🔥</div>
              <div>
                <p class="text-xs text-slate-400 font-semibold">Racha Actual</p>
                <p class="text-xl font-bold text-white">${user.streak} Días</p>
              </div>
            </div>

            <div id="dash-stat-level" class="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4 hover:border-white/20 cursor-pointer transition-all">
              <div class="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl">🎓</div>
              <div>
                <p class="text-xs text-slate-400 font-semibold">Nivel Actual</p>
                <p class="text-xl font-bold text-white">${user.level} (${user.levelTitle})</p>
              </div>
            </div>

            <div class="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4 hover:border-white/20 transition-all">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">⏱️</div>
              <div>
                <p class="text-xs text-slate-400 font-semibold">Tiempo Total</p>
                <p class="text-xl font-bold text-white">${user.totalStudyTimeMinutes || 0} min</p>
              </div>
            </div>

            <div class="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-4 hover:border-white/20 transition-all">
              <div class="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl">🎯</div>
              <div>
                <p class="text-xs text-slate-400 font-semibold">Precisión Promedio</p>
                <p class="text-xl font-bold text-white">${user.accuracyRate || 95}%</p>
              </div>
            </div>
          </div>

          <!-- Recharts Analytics & Palabra del Día Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recharts Multi-Metric Progress Visualization (Speed, Accuracy, Vocabulary) -->
            <div class="lg:col-span-2">
              <div id="dashboard-recharts-container" class="w-full"></div>
            </div>

            <!-- Palabra del Día Section -->
            <div class="lg:col-span-1">
              <div id="dashboard-word-day-container" class="w-full"></div>
            </div>
          </div>

          <!-- Modules Quick Access & Right Side Widgets -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Left 2 Cols: Modules Quick Access -->
            <div class="md:col-span-2 space-y-4">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                📚 Módulos Principales de Estudio
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${MODULES_DATA.slice(0, 4).map(mod => `
                  <div class="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all shadow-lg flex flex-col justify-between">
                    <div>
                      <div class="flex justify-between items-start mb-3">
                        <span class="px-3 py-1 text-xs font-bold rounded-full bg-white/10 text-indigo-300 border border-white/10">
                          ${mod.badge}
                        </span>
                        <span class="text-2xl">${mod.icon === 'pen-tool' ? '✍️' : mod.icon === 'check-check' ? '✅' : mod.icon === 'book-open' ? '📖' : '📝'}</span>
                      </div>
                      <h4 class="font-bold text-white text-base">${mod.title}</h4>
                      <p class="text-xs text-slate-400 line-clamp-2 mt-1">${mod.description}</p>
                    </div>
                    <button onclick="window.launchModule('${mod.id}')" class="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-indigo-500 text-white font-semibold text-xs border border-white/10 transition-all">
                      Iniciar Práctica →
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Right Col: Calendar & Tutor Prompt -->
            <div class="space-y-6">
              <div id="dashboard-calendar-container" class="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg"></div>

              <!-- Quick Mecanografía Prompt Card -->
              <div class="bg-gradient-to-br from-indigo-900/80 to-purple-900/60 backdrop-blur-xl border border-white/10 text-white p-6 rounded-3xl shadow-xl space-y-4">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">⌨️</span>
                  <div>
                    <h4 class="font-bold text-sm">Mecanografía y Ortografía</h4>
                    <p class="text-xs text-indigo-300">Entrenamiento & Corrección IA</p>
                  </div>
                </div>
                <p class="text-xs text-slate-300">Practica tu velocidad de tecleo, acentuación y corrige tus palabras erradas automáticamente con IA.</p>
                <button data-nav="mecanografia" class="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20">
                  ⚡ Abrir Mecanografía →
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Render Recharts MultiMetricProgressChart
      const chartContainer = document.getElementById("dashboard-recharts-container");
      if (chartContainer) {
        if (!chartContainer._reactRoot) {
          chartContainer._reactRoot = createRoot(chartContainer);
        }
        chartContainer._reactRoot.render(
          React.createElement(MultiMetricProgressChart, {
            data: [
              { day: "Lun", wpm: 35, accuracy: 88, vocabularyWords: 12 },
              { day: "Mar", wpm: 40, accuracy: 90, vocabularyWords: 15 },
              { day: "Mié", wpm: 42, accuracy: 92, vocabularyWords: 18 },
              { day: "Jue", wpm: 45, accuracy: 94, vocabularyWords: 22 },
              { day: "Vie", wpm: 48, accuracy: 95, vocabularyWords: 25 },
              { day: "Sáb", wpm: 52, accuracy: 96, vocabularyWords: 28 },
              { day: "Dom", wpm: Math.max(50, user.wpm || 55), accuracy: user.accuracyRate || 97, vocabularyWords: Math.max(30, user.vocabularyCount || 32) }
            ]
          })
        );
      }

      // Render Word of the Day
      VocabularyEngine.renderWordOfTheDayCard("dashboard-word-day-container");

      // Render Calendar Widget
      CalendarWidget.render("dashboard-calendar-container");

      // Generate Targeted Error Review Exercise Button Listener
      document.getElementById("btn-generate-error-review")?.addEventListener("click", () => {
        const mistakes = user.commonMistakes || [];
        if (mistakes.length === 0) {
          Notifications.show("¡Felicidades! No tienes errores comunes registrados. Continúa practicando en los módulos.", "info");
          return;
        }
        const topMistake = mistakes.sort((a,b) => (b.count || 1) - (a.count || 1))[0];
        Notifications.show(`⚡ Generando ejercicio de repaso focalizado en: "${topMistake.rule || topMistake.question}"`, "success");
        window.launchModule(topMistake.module || "ortografia");
      });

      // Stats card listeners
      document.getElementById("dash-stat-streak")?.addEventListener("click", () => {
        fireStreakConfetti();
        Notifications.show(`🔥 Racha diaria de ${user.streak} días activa!`, "success");
      });

      document.getElementById("dash-stat-level")?.addEventListener("click", () => {
        fireCelebrationConfetti();
        Notifications.show(`🎓 ¡Felicidades! Eres Nivel ${user.level} (${user.levelTitle}).`, "info");
      });

      // Adjust Goal Modal Handler
      document.getElementById("adjust-goal-btn")?.addEventListener("click", () => {
        let modal = document.getElementById("adjust-goal-modal");
        if (!modal) {
          modal = document.createElement("div");
          modal.id = "adjust-goal-modal";
          modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in";
          modal.innerHTML = `
            <div class="bg-slate-900 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-white">
              <div class="flex justify-between items-center font-bold text-base border-b border-white/10 pb-3">
                <span>🎯 Ajustar Meta Diaria</span>
                <button onclick="document.getElementById('adjust-goal-modal').remove()" class="text-xs text-slate-400 hover:text-white">✕</button>
              </div>
              <div class="space-y-3">
                <label class="block text-xs text-slate-300 font-medium">Minutos de estudio por día:</label>
                <input id="goal-min-input" type="number" min="5" max="120" value="${targetMinutes}" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold outline-none focus:border-indigo-500">
                <div class="flex gap-2">
                  <button onclick="document.getElementById('goal-min-input').value = 15" class="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-indigo-300">15 min</button>
                  <button onclick="document.getElementById('goal-min-input').value = 30" class="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-indigo-300">30 min</button>
                  <button onclick="document.getElementById('goal-min-input').value = 45" class="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-indigo-300">45 min</button>
                </div>
              </div>
              <button id="save-goal-btn" class="w-full py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all">
                Guardar Nueva Meta
              </button>
            </div>
          `;
          document.body.appendChild(modal);

          document.getElementById("save-goal-btn").onclick = async () => {
            const val = parseInt(document.getElementById("goal-min-input").value) || 25;
            user.dailyGoalMinutes = val;
            await Auth.saveUser();
            Notifications.show(`Meta diaria actualizada a ${val} minutos por día.`, "success");
            modal.remove();
            Router.navigateTo("dashboard");
          };
        }
      });

      // Show Badge Detail Modal Helper
      window.showBadgeDetail = (badgeId) => {
        const badge = BADGES_LIST.find(b => b.id === badgeId);
        if (!badge) return;
        const isUnlocked = (user.badges || ["pionero"]).includes(badgeId);

        let modal = document.getElementById("badge-detail-modal");
        if (modal) modal.remove();

        modal = document.createElement("div");
        modal.id = "badge-detail-modal";
        modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in";
        modal.innerHTML = `
          <div class="bg-slate-900 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4 text-white relative">
            <button onclick="document.getElementById('badge-detail-modal').remove()" class="absolute top-4 right-4 text-xs text-slate-400 hover:text-white p-1">✕</button>
            <div class="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl ${
              isUnlocked ? 'bg-indigo-500/20 border-2 border-indigo-400/40 ring-4 ring-indigo-500/20' : 'bg-slate-800 grayscale'
            }">
              ${badge.icon}
            </div>
            <div>
              <h3 class="font-extrabold text-lg text-white">${badge.title}</h3>
              <p class="text-xs text-slate-300 mt-1 leading-relaxed">${badge.description}</p>
            </div>
            <div class="p-3 rounded-2xl ${isUnlocked ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'} text-xs font-bold">
              ${isUnlocked ? '🎉 ¡Insignia Desbloqueada y en tu Perfil!' : '🔒 Completa el objetivo indicado para desbloquear'}
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      };

      // Bind data-nav in dynamically injected HTML
      container.querySelectorAll("[data-nav]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const view = e.currentTarget.getAttribute("data-nav");
          this.setActiveNav(view);
          Router.navigateTo(view);
        });
      });

      window.launchModule = (modId) => {
        Router.navigateTo("ejercicio", { moduleId: modId });
      };
    });

    // 2. MODULOS VIEW
    Router.registerRoute("modulos", (container) => {
      this.setActiveNav("modulos");
      container.innerHTML = `
        <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
          <div>
            <h1 class="text-2xl md:text-3xl font-extrabold text-white">Módulos de Aprendizaje</h1>
            <p class="text-sm text-slate-300 mt-1">Selecciona el área lingüística que deseas ejercitar hoy.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${MODULES_DATA.map(mod => `
              <div class="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-lg hover:border-indigo-500/50 hover:bg-white/10 transition-all flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-center mb-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      ${mod.badge}
                    </span>
                    <span class="text-xs text-slate-400 font-semibold">${mod.lessons.length} Lecciones</span>
                  </div>
                  <h3 class="text-lg font-bold text-white mb-2">${mod.title}</h3>
                  <p class="text-xs text-slate-300 mb-6 leading-relaxed">${mod.description}</p>
                </div>
                <button onclick="window.launchModule('${mod.id}')" class="w-full py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all">
                  Abrir Módulo
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      window.launchModule = (modId) => {
        Router.navigateTo("ejercicio", { moduleId: modId });
      };
    });

    // 3. EJERCICIO INTERACTIVO VIEW
    Router.registerRoute("ejercicio", (container, params = {}) => {
      const moduleId = params.moduleId || "ortografia";
      const moduleInfo = MODULES_DATA.find(m => m.id === moduleId) || MODULES_DATA[1];

      Router.setTestActive(true);

      // Special modules (caligrafia, velocidad) with custom mechanics in construction
      if (moduleId === "caligrafia" || moduleId === "velocidad") {
        container.innerHTML = `
          <div class="p-6 md:p-8 max-w-2xl mx-auto space-y-6 animate-fade-in text-center">
            <div class="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
              <div class="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-4xl shadow-inner">
                🚧
              </div>
              <div class="space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">${moduleInfo.title}</span>
                <h2 class="text-2xl font-extrabold text-white">Módulo en Construcción</h2>
                <p class="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Este módulo tiene un formato especial y está en construcción 🚧
                </p>
              </div>
              <div class="pt-2">
                <button onclick="Router.navigateTo('modulos')" class="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
                  ← Volver a Módulos
                </button>
              </div>
            </div>
          </div>
        `;
        Router.setTestActive(false);
        return;
      }

      const user = Auth.getUser();
      user.completedQuestions = user.completedQuestions || [];
      user.moduleLevels = user.moduleLevels || {};
      user.spacedRepetitionList = user.spacedRepetitionList || [];

      const getExerciseKey = (ex) => {
        if (!ex) return "ex_unknown";
        if (ex.id) return String(ex.id);
        const qStr = (ex.question || "").trim().toLowerCase();
        const optsStr = (ex.options || []).join("_").toLowerCase();
        return `key_${qStr}_${optsStr}`;
      };

      const shuffleArray = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      // Spaced Repetition: Priority to failed questions for this module that haven't been completed yet
      const failedForModule = user.spacedRepetitionList.filter(item => 
        (item.module === moduleId || !item.module) && !user.completedQuestions.includes(getExerciseKey(item))
      );

      const baseExercises = EXERCISES_DATABASE[moduleId] || [];
      let exercises = [];
      
      // Load spaced repetition items first if available
      if (failedForModule.length > 0) {
        exercises.push(...failedForModule.map(item => ({ ...item, isSpacedRepetition: true })));
      }

      if (baseExercises && baseExercises.length > 0) {
        const uncompleted = baseExercises.filter(ex => !user.completedQuestions.includes(getExerciseKey(ex)));
        if (uncompleted.length > 0) {
          exercises.push(...shuffleArray(uncompleted));
        }
      }

      let currentIdx = 0;
      let difficultyLevel = user.moduleLevels[moduleId] || 1;
      let isFinalExam = false;
      let examCompleted = false;
      let isGenerating = false;

      // Block Accuracy Tracker for Level Up (>80% accuracy)
      let blockTotalCount = 0;
      let blockCorrectCount = 0;

      const autoGenerateAIExercise = async () => {
        isGenerating = true;
        renderQuestion();

        try {
          const topic = (moduleInfo.lessons && moduleInfo.lessons[0]?.title) || moduleInfo.title || "Ejercicios";
          const excludeKeys = user.completedQuestions.map(k => String(k));

          const aiExercise = await AIEngine.generateExercise(moduleId, difficultyLevel, topic, excludeKeys);
          const newKey = getExerciseKey(aiExercise);

          if (!user.completedQuestions.includes(newKey)) {
            exercises.push(aiExercise);
          } else {
            aiExercise.id = `gen_unique_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            exercises.push(aiExercise);
          }

          currentIdx = exercises.length - 1;
          isGenerating = false;
          Notifications.show(`✨ ${isFinalExam ? 'Pregunta de Examen Final' : `Nuevo Ejercicio Inédito (Nivel ${difficultyLevel}/10)`} generado`, "success");
          renderQuestion();
        } catch (err) {
          console.error("Error al generar ejercicio con IA:", err);
          isGenerating = false;
          Notifications.show("Error al conectar con la IA", "error");
          renderQuestion();
        }
      };

      // If no uncompleted exercises exist initially in static database, auto-generate fresh AI exercise immediately
      if (exercises.length === 0) {
        autoGenerateAIExercise();
      }

      const renderQuestion = () => {
        if (examCompleted) {
          // Render Final Exam Completed View
          container.innerHTML = `
            <div class="p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div class="bg-gradient-to-br from-amber-500/20 via-indigo-950/60 to-slate-900 p-8 rounded-3xl border-2 border-amber-400/50 shadow-2xl text-center space-y-6">
                <div class="inline-flex p-5 rounded-full bg-amber-500/20 text-amber-300 text-5xl shadow-xl shadow-amber-500/20 animate-bounce">
                  🏆
                </div>
                <div class="space-y-2">
                  <span class="text-xs font-extrabold uppercase tracking-widest text-amber-400">Módulo Completado al 100%</span>
                  <h2 class="text-2xl md:text-3xl font-extrabold text-white">¡Felicidades! Has superado el Examen Final</h2>
                  <p class="text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
                    Has completado exitosamente los <strong>10 Niveles de Dificultad</strong> y la evaluación final de <strong>${moduleInfo.title}</strong>.
                  </p>
                </div>

                <div class="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto flex items-center justify-around text-xs font-bold text-slate-200">
                  <div>
                    <span class="block text-slate-400 text-[10px] uppercase">Dificultad Superada</span>
                    <span class="text-amber-300 text-sm font-extrabold">10 / 10 ⚡</span>
                  </div>
                  <div class="h-8 w-px bg-white/10"></div>
                  <div>
                    <span class="block text-slate-400 text-[10px] uppercase">Recompensa Extra</span>
                    <span class="text-emerald-400 text-sm font-extrabold">+100 XP 🏅</span>
                  </div>
                </div>

                <div class="flex justify-center gap-3 pt-2">
                  <button onclick="Router.navigateTo('dashboard')" class="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 transition-all hover:scale-105">
                    🎓 Volver al Panel Principal
                  </button>
                </div>
              </div>
            </div>
          `;
          return;
        }

        const ex = exercises[currentIdx] || { question: "Cargando ejercicio inedito..." };

        container.innerHTML = `
          <div class="p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
            <!-- Header with Module Title, Completed HUD & Difficulty Gauge 1-10 -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">${moduleInfo.title}</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold tracking-wider uppercase">
                    ✓ ${user.completedQuestions.length} Resueltos
                  </span>
                  ${isFinalExam ? '<span class="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] tracking-wider uppercase animate-pulse">🏆 EXAMEN FINAL</span>' : ''}
                </div>
                <h2 class="text-xl font-bold text-white flex items-center gap-2 mt-1">
                  ${isFinalExam ? '🏆 Pregunta de Examen Final' : `Ejercicio ${currentIdx + 1} de ${Math.max(exercises.length, currentIdx + 1)}`}
                </h2>
              </div>

              <!-- Difficulty Gauge 1 to 10 -->
              <div class="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-xl shadow-lg">
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[11px] font-bold gap-3">
                    <span class="text-slate-300">Dificultad Dinámica</span>
                    <span class="text-amber-400 font-extrabold">${isFinalExam ? '10 / 10 (MÁXIMA)' : `Nivel ${difficultyLevel} / 10`}</span>
                  </div>
                  <!-- 10 Level Pips -->
                  <div class="flex items-center gap-1">
                    ${Array.from({ length: 10 }).map((_, i) => `
                      <div class="h-2 w-3 rounded-full transition-all ${i < difficultyLevel ? (isFinalExam ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-indigo-500 shadow-sm shadow-indigo-500/50') : 'bg-white/10'}"></div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Auto-Generating AI Loader State -->
            ${isGenerating ? `
              <div class="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-indigo-500/30 shadow-2xl text-center space-y-4 animate-fade-in">
                <div class="inline-flex p-4 rounded-full bg-indigo-500/20 text-indigo-400 text-3xl animate-bounce">
                  🤖
                </div>
                <h3 class="text-lg font-bold text-white">Generando automáticamente ejercicio inédito...</h3>
                <p class="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Creando contenido sin repetir de <strong class="text-amber-300">${isFinalExam ? 'Examen Final' : `Nivel de Dificultad ${difficultyLevel} de 10`}</strong> sobre "${moduleInfo.title}".
                </p>
                <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div class="bg-indigo-500 h-full rounded-full animate-progress-ripple"></div>
                </div>
              </div>
            ` : `
              <!-- Question Card (Frosted Glass) -->
              <div class="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                <p class="text-base md:text-lg font-semibold text-white leading-relaxed">${ex.question || 'Completa el ejercicio:'}</p>

                <!-- Interactive Area -->
                <div id="exercise-interactive-area"></div>

                <!-- Explanation Feedback Box -->
                <div id="exercise-feedback" class="hidden p-4 rounded-2xl border text-sm space-y-2"></div>
              </div>

              <div class="flex justify-between items-center gap-2 flex-wrap">
                <button onclick="Speech.speak('${(ex.question || '').replace(/'/g, "")}')" class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all">
                  🔊 Escuchar Pregunta
                </button>
                <div class="flex items-center gap-2">
                  <button id="next-ex-btn" class="hidden px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105">
                    Siguiente Ejercicio Inédito →
                  </button>
                </div>
              </div>
            `}
          </div>
        `;

        if (isGenerating) return;

        const interactiveArea = document.getElementById("exercise-interactive-area");
        const feedbackEl = document.getElementById("exercise-feedback");
        const nextBtn = document.getElementById("next-ex-btn");

        const setupNextButton = () => {
          if (!nextBtn) return;
          nextBtn.classList.remove("hidden");
          nextBtn.onclick = async () => {
            if (currentIdx < exercises.length - 1) {
              currentIdx++;
              renderQuestion();
            } else {
              // Automatically fetch a NEW non-repeated exercise with AI without asking user!
              if (difficultyLevel < 10) {
                if (blockTotalCount > 0 && (blockCorrectCount / blockTotalCount) > 0.8) {
                  difficultyLevel++;
                  user.moduleLevels[moduleId] = difficultyLevel;
                  await Auth.saveUser();
                  fireStreakConfetti();
                  Notifications.show(`🎯 ¡Excelente precisión! Subiste al Nivel ${difficultyLevel}`, "success");
                }
                await autoGenerateAIExercise();
              } else if (!isFinalExam) {
                isFinalExam = true;
                fireCelebrationConfetti();
                Notifications.show("🏆 ¡Has desbloqueado el Examen Final!", "success");
                await autoGenerateAIExercise();
              } else {
                examCompleted = true;
                await Progress.recordSession({ module: moduleId, score: 100, xpEarned: 100, durationMinutes: 10 });
                fireCelebrationConfetti();
                renderQuestion();
              }
            }
          };
        };

        let exType = ex.type || (ex.options ? "opcion_multiple" : "arrastrar");
        if (exType === "ordenar") {
          const parts = ex.parts || ex.options || [];
          const hasOrderingMeta = Array.isArray(ex.correctOrder) || Array.isArray(ex.correctSequence) || ex.correctText || ex.answer || (ex.parts && ex.parts.length);
          if (!parts.length || (!hasOrderingMeta && typeof ex.correctIndex === "number")) {
            exType = "opcion_multiple";
          }
        }

        if (exType === "opcion_multiple" || exType === "completar") {
          // MULTIPLE CHOICE / COMPLETAR WITH BUTTON SELECTION HIGHLIGHT & ANIMATIONS
          if (ex.options) {
            interactiveArea.innerHTML = `
              <div class="space-y-3" id="options-container">
                ${ex.options.map((opt, idx) => `
                  <button id="opt-btn-${idx}" data-idx="${idx}" class="opt-btn w-full text-left p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-indigo-500 hover:bg-white/10 transition-all text-sm font-medium text-slate-200 flex items-center justify-between group">
                    <span class="flex items-center gap-3">
                      <span class="w-7 h-7 rounded-xl bg-white/10 text-xs font-bold flex items-center justify-center text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">${String.fromCharCode(65 + idx)}</span>
                      <span>${opt}</span>
                    </span>
                    <span class="opt-badge text-xs text-slate-400 font-semibold">Opción ${idx + 1}</span>
                  </button>
                `).join('')}
              </div>
            `;

            interactiveArea.querySelectorAll(".opt-btn").forEach(btn => {
              btn.addEventListener("click", () => {
                const selectedIdx = parseInt(btn.getAttribute("data-idx"));
                window.submitAnswer(selectedIdx);
              });
            });
          }

          window.submitAnswer = async (selectedIdx) => {
            const isCorrect = selectedIdx === ex.correctIndex;

            // Block accuracy counter for level up tracking (>80% accuracy)
            blockTotalCount++;
            if (isCorrect) blockCorrectCount++;

            // Unique Exercise Key for Instant Real-Time Tracking
            const qKey = getExerciseKey(ex);

            if (isCorrect) {
              if (!user.completedQuestions.includes(qKey)) {
                user.completedQuestions.push(qKey);
              }
              // Remove from spaced repetition list if answered correctly
              user.spacedRepetitionList = user.spacedRepetitionList.filter(item => getExerciseKey(item) !== qKey);
              // Remove from common mistakes if answered correctly
              user.commonMistakes = (user.commonMistakes || []).filter(m => getExerciseKey(m) !== qKey);

              user.xp = (user.xp || 0) + 20;
              user.todayMinutesStudied = (user.todayMinutesStudied || 0) + 2;

              await Auth.saveUser();
              await Progress.recordSession({ module: moduleId, score: 100, xpEarned: 20, durationMinutes: 2 });
            } else {
              // Add to common mistakes and spaced repetition list
              user.commonMistakes = user.commonMistakes || [];
              const existingMistake = user.commonMistakes.find(m => getExerciseKey(m) === qKey || m.question === ex.question);
              if (existingMistake) {
                existingMistake.count = (existingMistake.count || 1) + 1;
              } else {
                user.commonMistakes.push({
                  id: qKey,
                  module: moduleId,
                  question: ex.question,
                  rule: ex.rule || "Regla ortográfica/gramatical",
                  count: 1
                });
              }

              user.spacedRepetitionList = user.spacedRepetitionList || [];
              if (!user.spacedRepetitionList.some(item => getExerciseKey(item) === qKey)) {
                user.spacedRepetitionList.push({
                  id: qKey,
                  module: moduleId,
                  question: ex.question,
                  options: ex.options,
                  correctIndex: ex.correctIndex,
                  explanation: ex.explanation,
                  rule: ex.rule,
                  type: ex.type || "opcion_multiple",
                  failedAt: new Date().toISOString()
                });
              }
              await Auth.saveUser();
            }

            // Check if accuracy > 80% in block of questions to increase difficulty level (1 to 10)
            if (blockTotalCount >= 3) {
              const accuracyPct = (blockCorrectCount / blockTotalCount) * 100;
              if (accuracyPct > 80 && difficultyLevel < 10) {
                difficultyLevel++;
                user.moduleLevels[moduleId] = difficultyLevel;
                await Auth.saveUser();
                Notifications.show(`🎯 ¡Precisión superior al 80%! Subiste al Nivel ${difficultyLevel} de 10`, "success");
              }
              blockTotalCount = 0;
              blockCorrectCount = 0;
            }

            // Freeze option buttons
            const allBtns = interactiveArea.querySelectorAll(".opt-btn");
            allBtns.forEach(b => {
              b.disabled = true;
              b.classList.remove("hover:border-indigo-500", "hover:bg-white/10");
              b.classList.add("cursor-default", "opacity-80");
            });

            // Highlight selected button & correct option with thick borders & keyframe animations
            const selectedBtn = interactiveArea.querySelector(`#opt-btn-${selectedIdx}`);
            const correctBtn = interactiveArea.querySelector(`#opt-btn-${ex.correctIndex}`);

            if (isCorrect) {
              if (selectedBtn) {
                selectedBtn.className = "w-full text-left p-4 rounded-2xl border-4 border-emerald-400 bg-emerald-500/30 text-emerald-100 ring-4 ring-emerald-400/50 shadow-xl shadow-emerald-500/30 animate-success-bounce text-sm font-bold flex items-center justify-between";
                const badge = selectedBtn.querySelector(".opt-badge");
                if (badge) badge.outerHTML = `<span class="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-lg">✓ ¡CORRECTO!</span>`;
              }

              feedbackEl.classList.remove("hidden");
              feedbackEl.className = "p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-1 animate-fade-in";
              feedbackEl.innerHTML = `
                <p class="font-bold flex items-center gap-2 text-white">🎉 ¡Respuesta Correcta! (+20 XP)</p>
                <p class="text-xs text-slate-200">${ex.explanation || ''}</p>
                ${ex.rule ? `<p class="text-[11px] opacity-80 italic text-emerald-400">Regla: ${ex.rule}</p>` : ''}
                <p class="text-[11px] text-emerald-300 font-extrabold flex items-center gap-1 pt-1">⚡ Ejercicio registrado automáticamente en tu progreso (${user.completedQuestions.length} resueltos)</p>
              `;
              fireStreakConfetti();
              Notifications.show("¡Respuesta Correcta! +20 XP (Guardado en vivo)", "success");
            } else {
              if (selectedBtn) {
                selectedBtn.className = "w-full text-left p-4 rounded-2xl border-4 border-rose-500 bg-rose-500/30 text-rose-100 ring-4 ring-rose-500/50 shadow-xl animate-shake text-sm font-bold flex items-center justify-between";
                const badge = selectedBtn.querySelector(".opt-badge");
                if (badge) badge.outerHTML = `<span class="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-lg">✗ Tu elección</span>`;
              }

              if (correctBtn && selectedIdx !== ex.correctIndex) {
                correctBtn.className = "w-full text-left p-4 rounded-2xl border-4 border-emerald-500/80 bg-emerald-500/20 text-emerald-200 text-sm font-bold flex items-center justify-between";
                const badge = correctBtn.querySelector(".opt-badge");
                if (badge) badge.outerHTML = `<span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">✓ Respuesta Correcta</span>`;
              }

              feedbackEl.classList.remove("hidden");
              feedbackEl.className = "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-1 animate-fade-in";
              feedbackEl.innerHTML = `
                <p class="font-bold flex items-center gap-2 text-white">❌ Respuesta Incorrecta (Registrada para Repaso Espaciado)</p>
                <p class="text-xs text-slate-200">${ex.explanation || ''}</p>
                ${ex.rule ? `<p class="text-[11px] opacity-80 italic text-rose-400">Regla: ${ex.rule}</p>` : ''}
              `;
              Notifications.show("Respuesta guardada para repaso prioritario", "warning");
            }

            setupNextButton();
          };
        } else if (exType === "ordenar") {
          // ORDENAR FRAGMENTOS / SECUENCIA
          const rawParts = ex.parts || ex.options || [];
          let availableTiles = rawParts.map((text, idx) => ({ idx, text })).sort(() => 0.5 - Math.random());
          let selectedTiles = [];
          let isVerified = false;

          const renderOrdering = () => {
            interactiveArea.innerHTML = `
              <div class="space-y-6">
                <!-- Answer / Sequence Assembly Zone -->
                <div class="space-y-2">
                  <div class="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span class="uppercase tracking-wider">Tu secuencia (Haz clic en una ficha para quitarla):</span>
                    <span class="text-indigo-400 font-extrabold">${selectedTiles.length} / ${rawParts.length} fichas</span>
                  </div>
                  <div id="answer-zone" class="min-h-[72px] p-4 rounded-2xl bg-white/5 border-2 border-dashed ${selectedTiles.length === 0 ? 'border-white/20' : 'border-indigo-500/50 bg-indigo-950/20'} flex flex-wrap items-center gap-2.5 transition-all">
                    ${selectedTiles.length === 0 ? `
                      <span class="text-xs text-slate-400 italic">Haz clic en las fichas inferiores en el orden correcto para armar la frase...</span>
                    ` : selectedTiles.map((tile, sIdx) => `
                      <button data-selected-idx="${sIdx}" class="selected-tile-btn px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-rose-500/80 border border-indigo-400 text-white font-semibold text-xs md:text-sm shadow-md transition-all flex items-center gap-2 group hover:scale-105 animate-fade-in">
                        <span><strong class="text-indigo-200 group-hover:text-white mr-1">${sIdx + 1}.</strong>${tile.text}</span>
                        <span class="text-indigo-300 group-hover:text-white text-xs">✕</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Available Tiles Pool -->
                <div class="space-y-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Fichas disponibles:</span>
                  <div class="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-black/20 border border-white/5 min-h-[56px]">
                    ${availableTiles.length === 0 ? `
                      <span class="text-xs text-emerald-400 font-medium">✓ Todas las fichas han sido colocadas</span>
                    ` : availableTiles.map((tile) => `
                      <button data-tile-idx="${tile.idx}" class="available-tile-btn px-4 py-2.5 rounded-xl bg-white/10 hover:bg-indigo-500/30 hover:border-indigo-400 border border-white/15 text-slate-200 font-semibold text-xs md:text-sm transition-all shadow-md hover:scale-105 active:scale-95">
                        ${tile.text}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Controls -->
                <div class="flex items-center justify-between gap-3 pt-2">
                  <button id="reset-order-btn" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all ${selectedTiles.length === 0 ? 'opacity-40 pointer-events-none' : ''}">
                    🔄 Reiniciar orden
                  </button>
                  <button id="verify-order-btn" class="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition-all ${selectedTiles.length === 0 || isVerified ? 'opacity-50 pointer-events-none' : 'hover:scale-105'}">
                    Verificar orden
                  </button>
                </div>
              </div>
            `;

            // Click available tile -> move to selected
            interactiveArea.querySelectorAll(".available-tile-btn").forEach(btn => {
              btn.addEventListener("click", () => {
                if (isVerified) return;
                const tileIdx = parseInt(btn.getAttribute("data-tile-idx"));
                const pos = availableTiles.findIndex(t => t.idx === tileIdx);
                if (pos !== -1) {
                  const [moved] = availableTiles.splice(pos, 1);
                  selectedTiles.push(moved);
                  feedbackEl.classList.add("hidden");
                  renderOrdering();
                }
              });
            });

            // Click selected tile -> move back to available
            interactiveArea.querySelectorAll(".selected-tile-btn").forEach(btn => {
              btn.addEventListener("click", () => {
                if (isVerified) return;
                const sIdx = parseInt(btn.getAttribute("data-selected-idx"));
                if (sIdx >= 0 && sIdx < selectedTiles.length) {
                  const [removed] = selectedTiles.splice(sIdx, 1);
                  availableTiles.push(removed);
                  feedbackEl.classList.add("hidden");
                  renderOrdering();
                }
              });
            });

            // Reset button
            const resetBtn = document.getElementById("reset-order-btn");
            if (resetBtn) {
              resetBtn.addEventListener("click", () => {
                if (isVerified) return;
                availableTiles = rawParts.map((text, idx) => ({ idx, text })).sort(() => 0.5 - Math.random());
                selectedTiles = [];
                feedbackEl.classList.add("hidden");
                renderOrdering();
              });
            }

            // Verify button
            const verifyBtn = document.getElementById("verify-order-btn");
            if (verifyBtn) {
              verifyBtn.addEventListener("click", async () => {
                if (selectedTiles.length === 0 || isVerified) return;

                const userIndices = selectedTiles.map(t => t.idx);
                const userTexts = selectedTiles.map(t => t.text.trim());
                const userJoinedSpace = userTexts.join(" ");
                const userJoinedNoSpace = userTexts.join("");

                let isCorrect = false;

                if (Array.isArray(ex.correctOrder)) {
                  isCorrect = userIndices.join(",") === ex.correctOrder.join(",");
                } else if (Array.isArray(ex.correctSequence)) {
                  const targetSeq = ex.correctSequence.map(s => String(s).trim());
                  isCorrect = userTexts.join("|") === targetSeq.join("|");
                } else if (ex.correctText) {
                  const target = String(ex.correctText).trim();
                  isCorrect = userJoinedSpace === target || userJoinedNoSpace === target.replace(/\s+/g, "");
                } else if (ex.answer) {
                  const target = String(ex.answer).trim();
                  isCorrect = userJoinedSpace === target || userJoinedNoSpace === target.replace(/\s+/g, "");
                } else {
                  isCorrect = userIndices.every((val, i) => val === i);
                }

                if (isCorrect) {
                  isVerified = true;
                  const qKey = getExerciseKey(ex);

                  if (!user.completedQuestions.includes(qKey)) {
                    user.completedQuestions.push(qKey);
                  }
                  user.spacedRepetitionList = user.spacedRepetitionList.filter(item => getExerciseKey(item) !== qKey);
                  user.commonMistakes = (user.commonMistakes || []).filter(m => getExerciseKey(m) !== qKey);

                  user.xp = (user.xp || 0) + 20;
                  user.todayMinutesStudied = (user.todayMinutesStudied || 0) + 2;

                  await Auth.saveUser();
                  await Progress.recordSession({ module: moduleId, score: 100, xpEarned: 20, durationMinutes: 2 });

                  feedbackEl.classList.remove("hidden");
                  feedbackEl.className = "p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-1 animate-fade-in";
                  feedbackEl.innerHTML = `
                    <p class="font-bold flex items-center gap-2 text-white">🎉 ¡Orden Correcto! (+20 XP)</p>
                    <p class="text-xs text-slate-200">${ex.explanation || 'Has colocado todas las fichas en la secuencia precisa.'}</p>
                    ${ex.rule ? `<p class="text-[11px] opacity-80 italic text-emerald-400">Regla: ${ex.rule}</p>` : ''}
                    <p class="text-[11px] text-emerald-300 font-extrabold flex items-center gap-1 pt-1">⚡ Ejercicio registrado automáticamente en tu progreso (${user.completedQuestions.length} resueltos)</p>
                  `;

                  fireStreakConfetti();
                  Notifications.show("¡Orden Correcto! +20 XP (Guardado en vivo)", "success");
                  setupNextButton();
                  renderOrdering();
                } else {
                  feedbackEl.classList.remove("hidden");
                  feedbackEl.className = "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-1 animate-fade-in";
                  feedbackEl.innerHTML = `
                    <p class="font-bold flex items-center gap-2 text-white">❌ Orden Incorrecto</p>
                    <p class="text-xs text-slate-200">Revisa la secuencia armada y vuelve a intentarlo haciendo clic en las fichas para ajustar la posición.</p>
                    ${ex.explanation ? `<p class="text-xs text-slate-300 mt-1">${ex.explanation}</p>` : ''}
                  `;
                  Notifications.show("Orden incorrecto, ajusta las fichas e intenta de nuevo", "warning");
                }
              });
            }
          };

          renderOrdering();
        } else if (exType === "arrastrar") {
          // ARRASTRAR / MATCHING
          const pairs = ex.pairs || [];
          const terms = pairs.map((p, i) => ({ id: i, text: p.term }));
          const matches = [...pairs.map((p, i) => ({ id: i, text: p.match }))].sort(() => 0.5 - Math.random());

          let selectedTermId = null;
          let selectedMatchId = null;
          const matchedIds = new Set();
          let errorPair = null;

          const renderMatching = () => {
            interactiveArea.innerHTML = `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Column 1: Terms -->
                <div class="space-y-2">
                  <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Términos</p>
                  ${terms.map(t => {
                    const isMatched = matchedIds.has(t.id);
                    const isSelected = selectedTermId === t.id;
                    const isError = errorPair && errorPair.termId === t.id;

                    let btnStyle = "bg-white/5 border-white/10 hover:border-indigo-500 hover:bg-white/10 text-slate-200";
                    if (isMatched) btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-default animate-success-bounce";
                    else if (isError) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-200 animate-shake";
                    else if (isSelected) btnStyle = "bg-indigo-600/40 border-indigo-400 text-white ring-2 ring-indigo-400/40 shadow-lg";

                    return `
                      <button data-term-id="${t.id}" class="term-btn w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-between ${btnStyle}">
                        <span>${t.text}</span>
                        ${isMatched ? '<span class="text-emerald-400 font-bold">✓</span>' : ''}
                      </button>
                    `;
                  }).join('')}
                </div>

                <!-- Column 2: Matches -->
                <div class="space-y-2">
                  <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Relación / Función</p>
                  ${matches.map(m => {
                    const isMatched = matchedIds.has(m.id);
                    const isSelected = selectedMatchId === m.id;
                    const isError = errorPair && errorPair.matchId === m.id;

                    let btnStyle = "bg-white/5 border-white/10 hover:border-indigo-500 hover:bg-white/10 text-slate-200";
                    if (isMatched) btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-default animate-success-bounce";
                    else if (isError) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-200 animate-shake";
                    else if (isSelected) btnStyle = "bg-indigo-600/40 border-indigo-400 text-white ring-2 ring-indigo-400/40 shadow-lg";

                    return `
                      <button data-match-id="${m.id}" class="match-btn w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-between ${btnStyle}">
                        <span>${m.text}</span>
                        ${isMatched ? '<span class="text-emerald-400 font-bold">✓</span>' : ''}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;

            interactiveArea.querySelectorAll(".term-btn").forEach(btn => {
              btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-term-id"));
                if (matchedIds.has(id) || errorPair) return;
                selectedTermId = selectedTermId === id ? null : id;
                checkPairing();
              });
            });

            interactiveArea.querySelectorAll(".match-btn").forEach(btn => {
              btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-match-id"));
                if (matchedIds.has(id) || errorPair) return;
                selectedMatchId = selectedMatchId === id ? null : id;
                checkPairing();
              });
            });
          };

          const checkPairing = async () => {
            if (selectedTermId !== null && selectedMatchId !== null) {
              if (selectedTermId === selectedMatchId) {
                matchedIds.add(selectedTermId);
                selectedTermId = null;
                selectedMatchId = null;
                renderMatching();

                if (matchedIds.size === pairs.length) {
                  feedbackEl.classList.remove("hidden");
                  feedbackEl.className = "p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-1 animate-fade-in";
                  feedbackEl.innerHTML = `
                    <p class="font-bold flex items-center gap-2 text-white">🎉 ¡Relación de conceptos completada! (+20 XP)</p>
                    <p class="text-xs text-slate-200">${ex.explanation || 'Has emparejado correctamente todos los términos.'}</p>
                  `;
                  await Progress.recordSession({ module: moduleId, score: 100, xpEarned: 20, durationMinutes: 3 });
                  fireStreakConfetti();
                  Notifications.show("¡Relación de conceptos completada! +20 XP", "success");
                  setupNextButton();
                }
              } else {
                errorPair = { termId: selectedTermId, matchId: selectedMatchId };
                renderMatching();
                Notifications.show("Pareja incorrecta, intenta de nuevo", "warning");

                setTimeout(() => {
                  selectedTermId = null;
                  selectedMatchId = null;
                  errorPair = null;
                  renderMatching();
                }, 700);
              }
            } else {
              renderMatching();
            }
          };

          renderMatching();
        } else if (exType === "flashcards") {
          // FLASHCARDS
          const cards = ex.cards || [];
          let cardIdx = 0;
          let isFlipped = false;
          const viewedCards = new Set([0]);
          let isRecorded = false;

          const renderFlashcard = () => {
            const card = cards[cardIdx] || { word: "", definition: "", example: "" };

            interactiveArea.innerHTML = `
              <div class="space-y-4">
                <div class="flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <span>Tarjeta ${cardIdx + 1} de ${cards.length}</span>
                  <span class="text-indigo-400 font-bold">${viewedCards.size} de ${cards.length} vistas</span>
                </div>

                <div id="flashcard-box" class="min-h-[220px] p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 backdrop-blur-xl flex flex-col items-center justify-center text-center cursor-pointer space-y-3 transition-all hover:border-indigo-400 shadow-xl relative overflow-hidden group">
                  ${!isFlipped ? `
                    <span class="text-xs font-bold uppercase tracking-widest text-indigo-400">Concepto / Palabra</span>
                    <h3 class="text-2xl md:text-3xl font-extrabold text-white tracking-wide">${card.word}</h3>
                    <p class="text-xs text-slate-400 font-medium flex items-center gap-1 mt-2">
                      <span>🔄 Haz clic para voltear y ver la definición</span>
                    </p>
                  ` : `
                    <span class="text-xs font-bold uppercase tracking-widest text-indigo-400">${card.word}</span>
                    <p class="text-sm md:text-base font-semibold text-slate-100 leading-relaxed max-w-lg">${card.definition}</p>
                    ${card.example ? `
                      <div class="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-indigo-200 italic max-w-md w-full">
                        Ejemplo: "${card.example}"
                      </div>
                    ` : ''}
                  `}
                </div>

                <div class="flex items-center justify-between gap-3 pt-2">
                  <button id="fc-prev-btn" class="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none" ${cardIdx === 0 ? 'disabled' : ''}>
                    ← Anterior
                  </button>
                  <button id="fc-flip-btn" class="px-5 py-2.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5">
                    🔄 Voltear
                  </button>
                  <button id="fc-next-btn" class="px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
                    ${cardIdx === cards.length - 1 ? 'Finalizar' : 'Siguiente →'}
                  </button>
                </div>
              </div>
            `;

            const cardBox = document.getElementById("flashcard-box");
            const flipBtn = document.getElementById("fc-flip-btn");
            const prevBtn = document.getElementById("fc-prev-btn");
            const nextBtnFc = document.getElementById("fc-next-btn");

            const toggleFlip = () => {
              isFlipped = !isFlipped;
              viewedCards.add(cardIdx);
              renderFlashcard();
              checkCompletion();
            };

            cardBox.addEventListener("click", toggleFlip);
            flipBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              toggleFlip();
            });

            prevBtn.addEventListener("click", () => {
              if (cardIdx > 0) {
                cardIdx--;
                isFlipped = false;
                viewedCards.add(cardIdx);
                renderFlashcard();
              }
            });

            nextBtnFc.addEventListener("click", () => {
              if (cardIdx < cards.length - 1) {
                cardIdx++;
                isFlipped = false;
                viewedCards.add(cardIdx);
                renderFlashcard();
              } else {
                checkCompletion(true);
              }
            });
          };

          const checkCompletion = async (forceFinish = false) => {
            if ((viewedCards.size === cards.length || forceFinish) && !isRecorded) {
              isRecorded = true;
              feedbackEl.classList.remove("hidden");
              feedbackEl.className = "p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-1 animate-fade-in";
              feedbackEl.innerHTML = `
                <p class="font-bold flex items-center gap-2 text-white">🎉 ¡Repaso con Flashcards completado! (+20 XP)</p>
                <p class="text-xs text-slate-200">Has revisado todas las tarjetas de vocabulario del módulo.</p>
              `;
              await Progress.recordSession({ module: moduleId, score: 100, xpEarned: 20, durationMinutes: 3 });
              fireStreakConfetti();
              Notifications.show("¡Repaso con Flashcards completado! +20 XP", "success");
              setupNextButton();
            }
          };

          renderFlashcard();
        } else if (exType === "memorama") {
          // MEMORAMA
          const pairs = ex.pairs || [];
          const deck = [];
          pairs.forEach(p => {
            deck.push({ pairId: p.id, text: p.concept, label: "Concepto" });
            deck.push({ pairId: p.id, text: p.detail, label: "Definición" });
          });
          deck.sort(() => 0.5 - Math.random());

          let flippedIndices = [];
          const matchedPairIds = new Set();
          let isChecking = false;

          const renderMemorama = () => {
            interactiveArea.innerHTML = `
              <div class="space-y-4">
                <div class="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span>Parejas encontradas: ${matchedPairIds.size} de ${pairs.length}</span>
                  <span class="text-indigo-400 font-bold">${matchedPairIds.size === pairs.length ? '🎉 ¡Completado!' : 'Encuentra las parejas'}</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  ${deck.map((card, idx) => {
                    const isMatched = matchedPairIds.has(card.pairId);
                    const isFlipped = flippedIndices.includes(idx);

                    if (isMatched) {
                      return `
                        <div class="bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-200 text-xs font-bold p-3 rounded-2xl h-24 flex flex-col items-center justify-center text-center shadow-lg cursor-default animate-success-bounce">
                          <span class="text-[10px] uppercase text-emerald-400 font-bold mb-1">${card.label}</span>
                          <span class="line-clamp-2">${card.text}</span>
                        </div>
                      `;
                    } else if (isFlipped) {
                      return `
                        <div class="bg-indigo-600/30 border-2 border-indigo-400 text-white text-xs font-bold p-3 rounded-2xl h-24 flex flex-col items-center justify-center text-center shadow-lg animate-fade-in">
                          <span class="text-[10px] uppercase text-indigo-300 font-bold mb-1">${card.label}</span>
                          <span class="line-clamp-2">${card.text}</span>
                        </div>
                      `;
                    } else {
                      return `
                        <button data-card-idx="${idx}" class="memo-card-btn bg-indigo-950/80 border border-indigo-500/30 hover:border-indigo-400 text-indigo-400 text-2xl font-bold p-4 rounded-2xl h-24 flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-105">
                          🧠
                        </button>
                      `;
                    }
                  }).join('')}
                </div>
              </div>
            `;

            interactiveArea.querySelectorAll(".memo-card-btn").forEach(btn => {
              btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-card-idx"));
                if (isChecking || flippedIndices.includes(idx) || matchedPairIds.has(deck[idx].pairId)) return;

                flippedIndices.push(idx);
                renderMemorama();

                if (flippedIndices.length === 2) {
                  isChecking = true;
                  const [i1, i2] = flippedIndices;

                  if (deck[i1].pairId === deck[i2].pairId) {
                    matchedPairIds.add(deck[i1].pairId);
                    flippedIndices = [];
                    isChecking = false;
                    renderMemorama();

                    if (matchedPairIds.size === pairs.length) {
                      (async () => {
                        feedbackEl.classList.remove("hidden");
                        feedbackEl.className = "p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-1 animate-fade-in";
                        feedbackEl.innerHTML = `
                          <p class="font-bold flex items-center gap-2 text-white">🎉 ¡Felicidades! Memorama completado con éxito (+20 XP)</p>
                          <p class="text-xs text-slate-200">Has ejercitado tu memoria y comprensión de conceptos clave.</p>
                        `;
                        await Progress.recordSession({ module: moduleId, score: 100, xpEarned: 20, durationMinutes: 3 });
                        fireStreakConfetti();
                        Notifications.show("¡Memorama completado con éxito! +20 XP", "success");
                        setupNextButton();
                      })();
                    }
                  } else {
                    setTimeout(() => {
                      flippedIndices = [];
                      isChecking = false;
                      renderMemorama();
                    }, 800);
                  }
                }
              });
            });
          };

          renderMemorama();
        } else if (exType === "ordenar") {
          // ORDENAR / SEQUENCE EXERCISES
          const rawParts = ex.parts || ex.options || [];
          const parts = rawParts.map((p, i) => ({ id: i, text: p }));
          let placedIndices = [];
          let isSubmitted = false;

          const renderOrdering = () => {
            const availableParts = parts.filter(p => !placedIndices.includes(p.id));

            interactiveArea.innerHTML = `
              <div class="space-y-4">
                <div class="space-y-2">
                  <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Tu secuencia:</p>
                  <div id="placed-chips-container" class="min-h-[60px] p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap gap-2 items-center shadow-inner">
                    ${placedIndices.length === 0 ? `
                      <span class="text-xs text-slate-400 italic">Haz clic en las palabras/fichas de abajo para formar la secuencia correcta.</span>
                    ` : placedIndices.map((pIdx, seqPos) => `
                      <button data-placed-pos="${seqPos}" class="placed-chip-btn px-3.5 py-2 rounded-xl bg-indigo-600/40 border border-indigo-400/50 text-white font-semibold text-xs transition-all hover:bg-rose-500/30 hover:border-rose-400 flex items-center gap-1.5 shadow-md ${isSubmitted ? 'cursor-default' : ''}">
                        <span>${parts[pIdx].text}</span>
                        ${!isSubmitted ? '<span class="text-[10px] text-indigo-300">✕</span>' : ''}
                      </button>
                    `).join('')}
                  </div>
                </div>

                ${!isSubmitted ? `
                  <div class="space-y-2">
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Fichas disponibles:</p>
                    <div class="flex flex-wrap gap-2">
                      ${availableParts.map(p => `
                        <button data-part-id="${p.id}" class="avail-chip-btn px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 hover:border-indigo-400 hover:bg-white/20 text-slate-200 font-semibold text-xs transition-all hover:scale-105 shadow-sm">
                          ${p.text}
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <div class="pt-2 flex justify-end gap-2">
                    ${placedIndices.length > 0 ? `
                      <button id="reset-order-btn" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs transition-all">
                        🔄 Reiniciar
                      </button>
                    ` : ''}
                    <button id="verify-order-btn" class="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all ${placedIndices.length < parts.length ? 'opacity-50 pointer-events-none' : 'hover:scale-105'}">
                      ✓ Verificar Orden
                    </button>
                  </div>
                ` : ''}
              </div>
            `;

            if (!isSubmitted) {
              interactiveArea.querySelectorAll(".avail-chip-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                  const id = parseInt(btn.getAttribute("data-part-id"));
                  placedIndices.push(id);
                  renderOrdering();
                });
              });

              interactiveArea.querySelectorAll(".placed-chip-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                  const pos = parseInt(btn.getAttribute("data-placed-pos"));
                  placedIndices.splice(pos, 1);
                  renderOrdering();
                });
              });

              const resetBtn = document.getElementById("reset-order-btn");
              if (resetBtn) {
                resetBtn.addEventListener("click", () => {
                  placedIndices = [];
                  renderOrdering();
                });
              }

              const verifyBtn = document.getElementById("verify-order-btn");
              if (verifyBtn) {
                verifyBtn.addEventListener("click", async () => {
                  let isCorrect = false;
                  const userTextSeq = placedIndices.map(i => parts[i].text);

                  if (Array.isArray(ex.correctOrder)) {
                    if (typeof ex.correctOrder[0] === "number") {
                      isCorrect = JSON.stringify(placedIndices) === JSON.stringify(ex.correctOrder);
                    } else {
                      isCorrect = JSON.stringify(userTextSeq) === JSON.stringify(ex.correctOrder);
                    }
                  } else if (Array.isArray(ex.correctSequence)) {
                    isCorrect = JSON.stringify(userTextSeq) === JSON.stringify(ex.correctSequence);
                  } else if (ex.correctText || ex.answer) {
                    const expectedStr = (ex.correctText || ex.answer).trim().toLowerCase();
                    const userStr = userTextSeq.join(" ").trim().toLowerCase();
                    isCorrect = userStr === expectedStr || userStr === expectedStr.replace(/[.,;]/g, "");
                  } else {
                    isCorrect = placedIndices.every((val, idx) => val === idx);
                  }

                  isSubmitted = true;
                  renderOrdering();

                  if (isCorrect) {
                    feedbackEl.classList.remove("hidden");
                    feedbackEl.className = "p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-1 animate-fade-in";
                    feedbackEl.innerHTML = `
                      <p class="font-bold flex items-center gap-2 text-white">🎉 ¡Orden Correcto! (+20 XP)</p>
                      <p class="text-xs text-slate-200">${ex.explanation || 'Has ordenado los elementos correctamente.'}</p>
                    `;
                    await Progress.recordSession({ module: moduleId, score: 100, xpEarned: 20, durationMinutes: 3 });
                    fireStreakConfetti();
                    Notifications.show("¡Orden Correcto! +20 XP", "success");
                    setupNextButton();
                  } else {
                    feedbackEl.classList.remove("hidden");
                    feedbackEl.className = "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-1 animate-fade-in flex items-center justify-between flex-wrap gap-2";
                    feedbackEl.innerHTML = `
                      <div>
                        <p class="font-bold flex items-center gap-2 text-white">❌ Orden Incorrecto</p>
                        <p class="text-xs text-slate-200">${ex.explanation || 'El orden de las palabras no es el adecuado.'}</p>
                      </div>
                      <button id="retry-order-btn" class="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold text-xs transition-all">
                        🔄 Intentar de nuevo
                      </button>
                    `;
                    Notifications.show("Orden incorrecto, intenta de nuevo", "warning");

                    const retryBtn = document.getElementById("retry-order-btn");
                    if (retryBtn) {
                      retryBtn.onclick = () => {
                        isSubmitted = false;
                        placedIndices = [];
                        feedbackEl.classList.add("hidden");
                        renderOrdering();
                      };
                    }
                  }
                });
              }
            }
          };

          renderOrdering();
        }
      };

      const initExercises = async () => {
        if (exercises.length === 0) {
          container.innerHTML = `
            <div class="p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in text-center">
              <div class="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-4">
                <div class="inline-flex p-4 rounded-full bg-indigo-500/20 text-indigo-400 text-4xl animate-bounce">
                  ✨
                </div>
                <h3 class="text-xl font-extrabold text-white">Preparando tus ejercicios de ${moduleInfo.title}...</h3>
                <p class="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Generando un primer ejercicio con Inteligencia Artificial personalizado para este módulo.
                </p>
                <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div class="bg-indigo-500 h-full rounded-full animate-progress-ripple"></div>
                </div>
              </div>
            </div>
          `;

          try {
            const topic = (moduleInfo.lessons && moduleInfo.lessons[0]?.title) || moduleInfo.title;
            const firstEx = await AIEngine.generateExercise(moduleId, "Principiante", topic);
            exercises.push(firstEx);
            renderQuestion();
          } catch (err) {
            console.error("Error al preparar ejercicio inicial con IA:", err);
            Notifications.show("Error al conectar con la IA. Inténtalo de nuevo.", "error");
          }
        } else {
          renderQuestion();
        }
      };

      initExercises();
    });

    // 4. MECANOGRAFÍA, TILDACIÓN Y CORRECCIÓN ORTOGRÁFICA VIEW
    Router.registerRoute("mecanografia", (container) => {
      this.setActiveNav("mecanografia");
      MecanografiaEngine.render(container);
    });

    Router.registerRoute("editor", () => Router.navigateTo("mecanografia"));
    Router.registerRoute("tutor", () => Router.navigateTo("mecanografia"));

    // 6. POMODORO & PRODUCTIVIDAD VIEW
    Router.registerRoute("productividad", (container) => {
      this.setActiveNav("productividad");
      container.innerHTML = `
        <div class="p-6 md:p-8 max-w-3xl mx-auto space-y-8 text-center animate-fade-in">
          <div>
            <h1 class="text-2xl md:text-3xl font-extrabold text-white">Modo Concentración y Temporizador de Trabajo Profundo</h1>
            <p class="text-xs text-slate-300 mt-1">Optimiza tus sesiones de escritura con la técnica Pomodoro, notificaciones de escritorio y sonidos ambientales relajantes.</p>
          </div>

          <div class="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-8">
            <!-- Mode Tabs -->
            <div class="flex justify-center gap-3">
              <button id="pomo-mode-work" onclick="window.switchPomoMode('pomodoro')" class="px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">Pomodoro (25m)</button>
              <button id="pomo-mode-short" onclick="window.switchPomoMode('short_break')" class="px-5 py-2.5 rounded-2xl text-xs font-bold bg-white/10 border border-white/10 text-slate-300 hover:text-white">Descanso Corto (5m)</button>
              <button id="pomo-mode-long" onclick="window.switchPomoMode('long_break')" class="px-5 py-2.5 rounded-2xl text-xs font-bold bg-white/10 border border-white/10 text-slate-300 hover:text-white">Descanso Largo (15m)</button>
            </div>

            <!-- Big Timer Display -->
            <div id="pomo-display" class="text-6xl md:text-8xl font-black text-white tracking-wider my-6 font-mono drop-shadow-md">
              25:00
            </div>

            <!-- Controls -->
            <div class="flex justify-center gap-4">
              <button id="pomo-start-btn" onclick="Timer.start(); Notifications.show('⚡ Sesión de concentración iniciada. Notificaciones activadas.', 'info');" class="px-8 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all">
                Iniciar Concentración
              </button>
              <button onclick="Timer.stop()" class="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all">
                Pausar
              </button>
              <button onclick="Timer.reset()" class="px-6 py-3.5 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all">
                Reiniciar
              </button>
            </div>
          </div>

          <!-- Ambient Noise Toggle -->
          <div class="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-lg flex justify-between items-center">
            <div class="flex items-center gap-4 text-left">
              <span class="text-3xl">🌧️</span>
              <div>
                <p class="font-bold text-sm text-white">Sonido Ambiental de Lluvia Relajante</p>
                <p class="text-xs text-slate-400">Generado en tiempo real con Web Audio API para aislar distracciones.</p>
              </div>
            </div>
            <button id="ambient-toggle-btn" class="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all">
              Activar Lluvia
            </button>
          </div>
        </div>
      `;

      window.switchPomoMode = (mode) => {
        Timer.setMode(mode);
        const btnWork = document.getElementById("pomo-mode-work");
        const btnShort = document.getElementById("pomo-mode-short");
        const btnLong = document.getElementById("pomo-mode-long");

        [btnWork, btnShort, btnLong].forEach(b => {
          if (b) {
            b.className = "px-5 py-2.5 rounded-2xl text-xs font-bold bg-white/10 border border-white/10 text-slate-300 hover:text-white";
          }
        });

        if (mode === "pomodoro" && btnWork) {
          btnWork.className = "px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30";
        } else if (mode === "short_break" && btnShort) {
          btnShort.className = "px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30";
        } else if (mode === "long_break" && btnLong) {
          btnLong.className = "px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30";
        }
      };

      Timer.onTick(({ formatted }) => {
        const display = document.getElementById("pomo-display");
        if (display) display.textContent = formatted;
      });

      let isRainActive = false;
      document.getElementById("ambient-toggle-btn").onclick = () => {
        isRainActive = !isRainActive;
        Timer.toggleAmbientRain(isRainActive);
        document.getElementById("ambient-toggle-btn").textContent = isRainActive ? "Desactivar Lluvia" : "Activar Lluvia";
      };
    });

    // 7. TIENDA VIRTUAL VIEW
    Router.registerRoute("tienda", (container) => {
      this.setActiveNav("tienda");
      const user = Auth.getUser();

      container.innerHTML = `
        <div class="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-extrabold text-white">Tienda Virtual y Recompensas</h1>
              <p class="text-xs text-slate-300">Canjea tus monedas y gemas ganadas por nuevos avatares y potenciadores.</p>
            </div>
            <div class="flex gap-4 font-bold text-sm">
              <span class="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5">🪙 ${user.coins} Monedas</span>
              <span class="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5">💎 ${user.gems} Gemas</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${SHOP_ITEMS.map(item => `
              <div class="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between text-center space-y-4 hover:border-white/20 transition-all">
                <span class="text-5xl mx-auto py-2">${item.icon}</span>
                <div>
                  <h3 class="font-bold text-white text-base">${item.name}</h3>
                  <p class="text-xs text-slate-300 mt-1 leading-relaxed">${item.description || 'Desbloquea este avatar personalizado para tu perfil.'}</p>
                </div>
                <div class="flex justify-center gap-3 text-xs font-bold">
                  ${item.costCoins > 0 ? `<span class="text-amber-300">🪙 ${item.costCoins}</span>` : ''}
                  ${item.costGems > 0 ? `<span class="text-cyan-300">💎 ${item.costGems}</span>` : ''}
                </div>
                <button onclick="window.buyShopItem('${item.id}')" class="w-full py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all">
                  Comprar Recompensa
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      window.buyShopItem = async (id) => {
        const ok = await Gamification.buyItem(id);
        if (ok) {
          fireStreakConfetti();
          Router.navigateTo("tienda");
        }
      };
    });

    // 8. CONFIGURACION VIEW
    Router.registerRoute("configuracion", (container) => {
      this.setActiveNav("configuracion");
      container.innerHTML = `
        <div class="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h1 class="text-2xl font-extrabold text-white">Configuración y Accesibilidad</h1>
            <p class="text-xs text-slate-300">Personaliza la interfaz según tus necesidades de aprendizaje y visión.</p>
          </div>

          <div class="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl space-y-8">
            <!-- Theme Selection -->
            <div>
              <label class="block font-bold text-sm text-white mb-3">Tema Visual</label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onclick="Settings.update({theme:'light', mode:'adult'}); Notifications.show('Modo Claro activado', 'info')" class="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-center text-white transition-all">
                  ☀️ Claro
                </button>
                <button onclick="Settings.update({theme:'dark', mode:'adult'}); Notifications.show('Modo Oscuro activado', 'info')" class="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-center text-white transition-all">
                  🌙 Oscuro
                </button>
                <button onclick="Settings.update({mode:'high-contrast'}); Notifications.show('Alto Contraste activado', 'info')" class="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-center text-white transition-all">
                  👁️ Alto Contraste
                </button>
                <button onclick="Settings.update({mode:'kids'}); Notifications.show('Modo Infantil activado', 'info')" class="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-center text-white transition-all">
                  🎈 Modo Infantil
                </button>
              </div>
            </div>

            <!-- Dyslexia Font Toggle -->
            <div class="flex justify-between items-center pt-6 border-t border-white/10">
              <div>
                <p class="font-bold text-sm text-white">Tipografía para Dislexia (OpenDyslexic)</p>
                <p class="text-xs text-slate-400">Facilita la lectura a usuarios con dislexia aumentando el contraste de formas.</p>
              </div>
              <button onclick="Settings.update({font: Settings.settings.font === 'dyslexia' ? 'sans' : 'dyslexia'}); Notifications.show('Tipografía actualizada', 'info')" class="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all">
                Alternar Fuente
              </button>
            </div>

            <!-- Export / Backup -->
            <div class="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p class="font-bold text-sm text-white">Diploma en PDF & Reporte de Progreso</p>
                <p class="text-xs text-slate-400">Genera tu certificado oficial descargable en PDF o exporta a Excel.</p>
              </div>
              <div class="flex gap-3">
                <button onclick="ReportGenerator.generateCertificate()" class="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all">
                  🎓 Descargar Diploma PDF
                </button>
                <button onclick="ReportGenerator.exportProgressToExcel()" class="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-xs text-white transition-all">
                  📊 Exportar Excel
                </button>
              </div>
            </div>

            <!-- Reset Data -->
            <div class="pt-6 border-t border-white/10 flex justify-between items-center">
              <div>
                <p class="font-bold text-sm text-rose-400">Reiniciar Progreso local</p>
                <p class="text-xs text-slate-400">Restaura las estadísticas y elimina datos guardados del navegador.</p>
              </div>
              <button onclick="if(confirm('¿Seguro que deseas reiniciar tu progreso?')){ localStorage.clear(); location.reload(); }" class="px-4 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all">
                🗑️ Reiniciar Datos
              </button>
            </div>
          </div>
        </div>
      `;
    });

    // 9. ADMIN PANEL VIEW
    Router.registerRoute("admin", (container) => {
      this.setActiveNav("admin");
      container.innerHTML = `
        <div class="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h1 class="text-2xl font-extrabold text-white">Panel Administrativo y Perfiles</h1>
            <p class="text-xs text-slate-300">Gestiona múltiples usuarios, perfiles de estudiante y configuraciones avanzadas.</p>
          </div>

          <div id="admin-user-table-container" class="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl"></div>
        </div>
      `;

      AdminPanel.renderUserList("admin-user-table-container");
    });
  }

  openGlobalSearchModal() {
    let modal = document.getElementById("search-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "search-modal";
      modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4 animate-fade-in";
      modal.innerHTML = `
        <div class="bg-slate-900/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4">
          <div class="flex items-center gap-3 border-b border-white/10 pb-3">
            <span class="text-xl">🔍</span>
            <input id="search-input" type="text" placeholder="Buscar módulo, regla u ortografía..." class="flex-1 bg-transparent text-base outline-none text-white placeholder-slate-400 font-medium">
            <button onclick="document.getElementById('search-modal').remove()" class="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5">Esc</button>
          </div>
          <div id="search-results" class="text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto">
            <p>Escribe palabras clave como "tildes", "b y v", "redacción", "mecanografía"...</p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const input = document.getElementById("search-input");
      input.focus();
      input.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsEl = document.getElementById("search-results");
        if (!query) {
          resultsEl.innerHTML = `<p>Escribe palabras clave para buscar en la plataforma...</p>`;
          return;
        }

        const matches = MODULES_DATA.filter(m => m.title.toLowerCase().includes(query) || m.description.toLowerCase().includes(query));
        resultsEl.innerHTML = matches.map(m => `
          <div onclick="Router.navigateTo('ejercicio', {moduleId:'${m.id}'}); document.getElementById('search-modal').remove()" class="p-3.5 rounded-2xl bg-white/5 hover:bg-indigo-500/20 border border-white/10 cursor-pointer font-bold text-white flex justify-between items-center transition-all">
            <span>${m.title}</span>
            <span class="text-[10px] text-indigo-400">Ir al módulo →</span>
          </div>
        `).join('') || `<p>No se encontraron resultados.</p>`;
      };
    }
  }

  openShortcutsModal() {
    let modal = document.getElementById("shortcuts-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "shortcuts-modal";
      modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in";
      modal.innerHTML = `
        <div class="bg-slate-900/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs text-slate-200">
          <div class="flex justify-between items-center font-bold text-base text-white border-b border-white/10 pb-3">
            <span>⌨️ Atajos de Teclado</span>
            <button onclick="document.getElementById('shortcuts-modal').remove()" class="text-xs text-slate-400 hover:text-white">✕</button>
          </div>
          <div class="space-y-3 pt-1">
            <div class="flex justify-between items-center"><span>Búsqueda Global</span> <kbd class="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg font-mono text-indigo-300">Ctrl + K</kbd></div>
            <div class="flex justify-between items-center"><span>Mostrar Atajos</span> <kbd class="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg font-mono text-indigo-300">?</kbd></div>
            <div class="flex justify-between items-center"><span>Cerrar Ventanas</span> <kbd class="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg font-mono text-indigo-300">Escape</kbd></div>
          </div>
        </div>
      `;
      document.appendChild ? document.body.appendChild(modal) : null;
    }
  }
}

export const App = new AppController();
