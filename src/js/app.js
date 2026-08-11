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
      const progressPct = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

      const todayMinutes = user.todayMinutesStudied || 0;
      const targetMinutes = user.dailyGoalMinutes || 25;
      const dailyGoalPct = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));

      const badgesWithStatus = Gamification.getBadgesWithStatus();
      const unlockedCount = badgesWithStatus.filter(b => b.unlocked).length;

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

              <!-- Quick Tutor Prompt Card -->
              <div class="bg-gradient-to-br from-indigo-900/80 to-purple-900/60 backdrop-blur-xl border border-white/10 text-white p-6 rounded-3xl shadow-xl space-y-4">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">🧙‍♂️</span>
                  <div>
                    <h4 class="font-bold text-sm">Profesor Gramaticus</h4>
                    <p class="text-xs text-indigo-300">Tutor Virtual con IA</p>
                  </div>
                </div>
                <p class="text-xs text-slate-300">¿Tienes dudas sobre alguna regla ortográfica o gramatical? Pregúntame lo que desees.</p>
                <button data-nav="tutor" class="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold text-xs transition-all">
                  Chatear con el Tutor →
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
      const exercises = EXERCISES_DATABASE[moduleId] || EXERCISES_DATABASE["ortografia"];
      let currentIdx = 0;

      Router.setTestActive(true);

      const renderQuestion = () => {
        const ex = exercises[currentIdx] || exercises[0];

        container.innerHTML = `
          <div class="p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div class="flex justify-between items-center">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">${moduleInfo.title}</span>
                <h2 class="text-xl font-bold text-white">Ejercicio ${currentIdx + 1} de ${exercises.length}</h2>
              </div>
              <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300">
                +20 XP por acierto
              </span>
            </div>

            <!-- Question Card (Frosted Glass) -->
            <div class="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
              <p class="text-base md:text-lg font-semibold text-white leading-relaxed">${ex.question}</p>

              <!-- Options -->
              ${ex.options ? `
                <div class="space-y-3">
                  ${ex.options.map((opt, idx) => `
                    <button onclick="window.submitAnswer(${idx})" class="w-full text-left p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-indigo-500 hover:bg-white/10 transition-all text-sm font-medium text-slate-200 flex items-center justify-between">
                      <span>${opt}</span>
                      <span class="text-xs text-slate-400">Opción ${idx + 1}</span>
                    </button>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Explanation Feedback Box -->
              <div id="exercise-feedback" class="hidden p-4 rounded-2xl border text-sm space-y-2"></div>
            </div>

            <div class="flex justify-between items-center">
              <button onclick="Speech.speak('${ex.question.replace(/'/g, "")}')" class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all">
                🔊 Escuchar Pregunta
              </button>
              <button id="next-ex-btn" class="hidden px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all">
                Siguiente Ejercicio →
              </button>
            </div>
          </div>
        `;

        window.submitAnswer = async (selectedIdx) => {
          const feedbackEl = document.getElementById("exercise-feedback");
          const nextBtn = document.getElementById("next-ex-btn");
          const isCorrect = selectedIdx === ex.correctIndex;

          feedbackEl.classList.remove("hidden");
          if (isCorrect) {
            feedbackEl.className = "p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-1 animate-fade-in";
            feedbackEl.innerHTML = `
              <p class="font-bold flex items-center gap-2 text-white">🎉 ¡Respuesta Correcta! (+20 XP)</p>
              <p class="text-xs text-slate-200">${ex.explanation}</p>
              <p class="text-[11px] opacity-80 italic text-emerald-400">Regla: ${ex.rule}</p>
            `;
            await Progress.recordSession({ module: moduleId, score: 100, xpEarned: 20, durationMinutes: 3 });
            fireStreakConfetti();
            Notifications.show("¡Respuesta Correcta! +20 XP", "success");
          } else {
            feedbackEl.className = "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-1 animate-fade-in";
            feedbackEl.innerHTML = `
              <p class="font-bold flex items-center gap-2 text-white">❌ Respuesta Incorrecta</p>
              <p class="text-xs text-slate-200">${ex.explanation}</p>
              <p class="text-[11px] opacity-80 italic text-rose-400">Regla: ${ex.rule}</p>
            `;
            Notifications.show("Sigue intentándolo", "warning");
          }

          nextBtn.classList.remove("hidden");
          nextBtn.onclick = () => {
            currentIdx = (currentIdx + 1) % exercises.length;
            if (currentIdx === 0) {
              Router.setTestActive(false);
              fireCelebrationConfetti();
              Notifications.show("🎓 ¡Has completado todos los ejercicios de este módulo!", "success");
            }
            renderQuestion();
          };
        };
      };

      renderQuestion();
    });

    // 4. EDITOR INTELIGENTE VIEW
    Router.registerRoute("editor", (container) => {
      this.setActiveNav("editor");
      Router.setEditorActive(true);

      container.innerHTML = `
        <div class="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-white">Editor Inteligente de Redacción</h1>
              <p class="text-xs text-slate-300">Redacta ensayos, cartas y correos con dictado por voz, análisis de legibilidad e Inteligencia Artificial.</p>
            </div>
            <div class="flex flex-wrap gap-2.5">
              <button id="dictate-btn" class="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all">
                <span id="dictate-icon">🎙️</span> <span id="dictate-text">Dictar por Voz</span>
              </button>
              <button id="save-draft-btn" class="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all">
                💾 Guardar Borrador
              </button>
              <button id="copy-text-btn" class="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all">
                📋 Copiar Texto
              </button>
              <button id="analyze-ai-btn" class="px-4 py-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-1.5">
                ✨ Evaluador IA
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left 2 Cols: Textarea Editor -->
            <div class="lg:col-span-2 space-y-4">
              <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden flex flex-col relative">
                <!-- Listening pulse bar overlay when recording -->
                <div id="recording-status-bar" class="hidden p-2 bg-rose-500/20 border-b border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 px-4 animate-pulse">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Micrófono Activo: Escuchando dictado por voz en tiempo real...</span>
                </div>

                <!-- Toolbar -->
                <div class="p-3 bg-white/5 border-b border-white/10 flex flex-wrap gap-2 text-xs font-semibold items-center">
                  <button onclick="document.execCommand('bold')" class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10"><b>B</b></button>
                  <button onclick="document.execCommand('italic')" class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10"><i>I</i></button>
                  <button onclick="document.execCommand('underline')" class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10"><u>U</u></button>
                  <button onclick="document.execCommand('removeFormat')" class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10" title="Limpiar Formato">🧹 Formato</button>
                  <span class="border-r border-white/10 h-4 my-1"></span>
                  <button onclick="Speech.speak(document.getElementById('editor-textarea').innerText)" class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10">🔊 Leer Texto</button>
                  <button id="clear-editor-btn" class="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 ml-auto">🗑️ Limpiar</button>
                </div>

                <!-- Editable Content Area -->
                <div id="editor-textarea" contenteditable="true" class="p-6 min-h-[350px] outline-none text-slate-100 text-base leading-relaxed" placeholder="Escribe o dicta tu texto aquí...">
                  La educación en la era digital no solo transforma las herramientas que utilizamos, sino la forma en que estructuramos nuestro pensamiento crítico y comunicamos nuestras ideas con claridad.
                </div>
              </div>

              <!-- Metrics Footer Bar -->
              <div class="grid grid-cols-4 gap-3 text-center bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
                <div>
                  <p class="text-[10px] text-slate-400 font-bold uppercase">Palabras</p>
                  <p id="m-words" class="text-lg font-bold text-white">0</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-400 font-bold uppercase">Caracteres</p>
                  <p id="m-chars" class="text-lg font-bold text-white">0</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-400 font-bold uppercase">Oraciones</p>
                  <p id="m-sentences" class="text-lg font-bold text-white">0</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-400 font-bold uppercase">Tiempo Lectura</p>
                  <p id="m-time" class="text-lg font-bold text-white">0 min</p>
                </div>
              </div>
            </div>

            <!-- Right Col: AI Feedback Results -->
            <div id="editor-ai-results" class="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h3 class="font-bold text-white flex items-center gap-2">
                📊 Evaluación de Legibilidad
              </h3>
              <div>
                <p class="text-xs text-slate-400">Índice Flesch-Szigriszt:</p>
                <p id="flesch-score-badge" class="text-xl font-extrabold text-indigo-400">85 (Muy Fácil)</p>
              </div>
              <div id="ai-feedback-container" class="space-y-3 text-xs text-slate-300">
                <p>Haz clic en <strong>✨ Evaluador IA</strong> para recibir una retroalimentación detallada y corrección profunda de ortografía y gramática.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      const editorEl = document.getElementById("editor-textarea");
      const updateLiveMetrics = () => {
        const txt = editorEl.innerText || "";
        const m = SmartEditor.getMetrics(txt);
        document.getElementById("m-words").textContent = m.words;
        document.getElementById("m-chars").textContent = m.characters;
        document.getElementById("m-sentences").textContent = m.sentences;
        document.getElementById("m-time").textContent = `${m.readingTimeMinutes} min`;
        document.getElementById("flesch-score-badge").textContent = `${m.fleschScore} (${m.readabilityLabel})`;
      };

      editorEl.addEventListener("input", updateLiveMetrics);
      updateLiveMetrics();

      // Voice Dictation Button Handler
      const dictateBtn = document.getElementById("dictate-btn");
      const dictateIcon = document.getElementById("dictate-icon");
      const dictateText = document.getElementById("dictate-text");
      const statusBar = document.getElementById("recording-status-bar");

      dictateBtn.onclick = () => {
        if (Speech.isListening) {
          Speech.stopListening();
          statusBar.classList.add("hidden");
          dictateBtn.className = "px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all";
          dictateIcon.textContent = "🎙️";
          dictateText.textContent = "Dictar por Voz";
          Notifications.show("Dictado por voz finalizado.", "info");
        } else {
          statusBar.classList.remove("hidden");
          dictateBtn.className = "px-3.5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 border border-rose-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all animate-pulse";
          dictateIcon.textContent = "🔴";
          dictateText.textContent = "Detener Dictado";

          Notifications.show("🎙️ Escuchando... Habla libremente por tu micrófono.", "info");

          Speech.startListening((finalText) => {
            if (finalText) {
              editorEl.innerText += (editorEl.innerText.trim() ? " " : "") + finalText;
              updateLiveMetrics();
            }
          }, (err) => {
            statusBar.classList.add("hidden");
            dictateBtn.className = "px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all";
            dictateIcon.textContent = "🎙️";
            dictateText.textContent = "Dictar por Voz";
            Notifications.show("Error de micrófono: " + err, "error");
          }, () => {
            statusBar.classList.add("hidden");
            dictateBtn.className = "px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all";
            dictateIcon.textContent = "🎙️";
            dictateText.textContent = "Dictar por Voz";
          });
        }
      };

      // Save Draft Button
      document.getElementById("save-draft-btn").onclick = async () => {
        const txt = editorEl.innerText;
        if (!txt.trim()) {
          Notifications.show("No hay texto para guardar.", "warning");
          return;
        }
        const m = SmartEditor.getMetrics(txt);
        await Storage.saveRecord("drafts", {
          id: `draft_${Date.now()}`,
          content: txt,
          savedAt: new Date().toISOString()
        });
        await Progress.recordSession({
          module: "redaccion",
          wordsWritten: m.words,
          durationMinutes: 10,
          xpEarned: 25
        });
        fireStreakConfetti();
        Notifications.show("💾 Borrador guardado correctamente y registrado en tu avance diario.", "success");
      };

      // Copy Text Button
      document.getElementById("copy-text-btn").onclick = () => {
        const txt = editorEl.innerText;
        navigator.clipboard.writeText(txt).then(() => {
          Notifications.show("📋 Texto copiado al portapapeles.", "success");
        }).catch(() => {
          Notifications.show("No se pudo copiar el texto.", "error");
        });
      };

      // Clear Editor Button
      document.getElementById("clear-editor-btn").onclick = () => {
        if (confirm("¿Deseas borrar todo el texto del editor?")) {
          editorEl.innerText = "";
          updateLiveMetrics();
          Router.setEditorActive(false);
          Notifications.show("Editor limpiado.", "info");
        }
      };

      // AI Analyze Button
      document.getElementById("analyze-ai-btn").onclick = async () => {
        const text = editorEl.innerText;
        if (!text.trim()) {
          Notifications.show("Escribe algún texto antes de analizar.", "warning");
          return;
        }

        Notifications.show("Analizando texto con IA...", "info");
        const res = await AIEngine.evaluateText(text, "redaccion");
        const m = SmartEditor.getMetrics(text);

        const aiContainer = document.getElementById("ai-feedback-container");
        aiContainer.innerHTML = `
          <div class="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 space-y-2">
            <div class="flex justify-between items-center font-bold text-sm text-indigo-300">
              <span>Calificación IA:</span>
              <span class="text-base">${res.score}/100</span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed">${res.summary}</p>
          </div>

          <div class="space-y-2 pt-2">
            <p class="font-bold text-xs uppercase tracking-wider text-slate-400">Sugerencias y Correcciones:</p>
            ${res.corrections.map(c => `
              <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                <p class="font-semibold text-rose-400">Original: "${c.original}"</p>
                <p class="font-semibold text-emerald-400">Sugerencia: "${c.suggestion}"</p>
                <p class="text-[11px] text-slate-400">${c.explanation}</p>
              </div>
            `).join('')}
          </div>
        `;

        await Progress.recordSession({ module: "redaccion", wordsWritten: m.words, score: res.score, xpEarned: 30, durationMinutes: 10 });
      };
    });

    // 5. TUTOR VIRTUAL VIEW
    Router.registerRoute("tutor", (container) => {
      this.setActiveNav("tutor");
      let chatHistory = [];

      container.innerHTML = `
        <div class="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in flex flex-col h-[calc(100vh-120px)]">
          <div class="flex items-center gap-4">
            <span class="text-4xl">🧙‍♂️</span>
            <div>
              <h1 class="text-2xl font-extrabold text-white">Profesor Gramaticus</h1>
              <p class="text-xs text-slate-300">Tutor Virtual especializado en lingüística, ortografía y redacción.</p>
            </div>
          </div>

          <!-- Chat Box -->
          <div id="tutor-chat-box" class="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 overflow-y-auto space-y-4 shadow-xl">
            <div class="flex gap-3 items-start">
              <span class="text-2xl">🧙‍♂️</span>
              <div class="bg-indigo-500/10 border border-indigo-500/20 text-slate-100 p-4 rounded-2xl rounded-tl-none text-sm max-w-lg shadow-sm">
                ¡Hola! Soy el Profesor Gramaticus. ¿Tienes dudas sobre alguna regla ortográfica, conjugación verbal o estilo de redacción? Haz clic en uno de los temas rápidos abajo o escribe tu consulta.
              </div>
            </div>
          </div>

          <!-- Quick Prompts Pills -->
          <div class="flex flex-wrap gap-2 pt-1">
            <button onclick="window.askTutorPill('¿Cuáles son las reglas de acentuación de las palabras esdrújulas?')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-indigo-300">
              📌 Reglas de Acentuación
            </button>
            <button onclick="window.askTutorPill('Explicame la diferencia entre sino junto y si no separado con ejemplos.')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-indigo-300">
              📌 Sino vs Si no
            </button>
            <button onclick="window.askTutorPill('¿Cuándo se usa B y cuándo se usa V en español?')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-indigo-300">
              📌 Uso de B y V
            </button>
            <button onclick="window.askTutorPill('Dame 3 consejos prácticos para mejorar la coherencia de un ensayo.')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-indigo-300">
              📌 Redacción de Ensayos
            </button>
          </div>

          <!-- Input Bar -->
          <form id="tutor-form" class="flex gap-3">
            <input id="tutor-input" type="text" placeholder="Ej: ¿Cuándo se escribe 'sino' junto y 'si no' separado?" class="flex-1 px-5 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-slate-400 outline-none text-sm shadow-lg focus:border-indigo-500 focus:bg-white/10 transition-all">
            <button type="submit" class="px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all">
              Enviar
            </button>
          </form>
        </div>
      `;

      const chatBox = document.getElementById("tutor-chat-box");
      const form = document.getElementById("tutor-form");
      const input = document.getElementById("tutor-input");

      const processQuery = async (query) => {
        if (!query) return;

        // Append User Msg
        chatBox.innerHTML += `
          <div class="flex justify-end gap-3 items-start">
            <div class="bg-indigo-500 text-white p-4 rounded-2xl rounded-tr-none text-sm max-w-lg shadow-md">
              ${query}
            </div>
          </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;

        // Bot Typing State
        const loadingId = `load_${Date.now()}`;
        chatBox.innerHTML += `
          <div id="${loadingId}" class="flex gap-3 items-start">
            <span class="text-2xl">🧙‍♂️</span>
            <div class="bg-white/5 border border-white/10 p-3 rounded-2xl text-xs text-slate-400 italic">
              Pensando respuesta...
            </div>
          </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;

        const reply = await AIEngine.tutorChat(query, chatHistory);
        document.getElementById(loadingId)?.remove();

        chatHistory.push({ role: "user", content: query });
        chatHistory.push({ role: "model", content: reply });

        chatBox.innerHTML += `
          <div class="flex gap-3 items-start">
            <span class="text-2xl">🧙‍♂️</span>
            <div class="bg-indigo-500/10 border border-indigo-500/20 text-slate-100 p-4 rounded-2xl rounded-tl-none text-sm max-w-lg shadow-sm space-y-2">
              ${reply.replace(/\n/g, '<br>')}
              <button onclick="Speech.speak('${reply.replace(/'/g, "").replace(/\n/g, " ")}')" class="block text-[11px] font-bold text-indigo-400 hover:text-indigo-300 mt-2">
                🔊 Escuchar Explicación
              </button>
            </div>
          </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
      };

      form.onsubmit = async (e) => {
        e.preventDefault();
        const query = input.value.trim();
        input.value = "";
        await processQuery(query);
      };

      window.askTutorPill = (promptText) => {
        input.value = promptText;
        form.dispatchEvent(new Event("submit"));
      };
    });

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
