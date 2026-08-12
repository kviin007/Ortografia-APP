// mecanografia.js - Mecanografía, Tildación y Corrección Ortográfica

import { Auth } from "./auth.js";
import { Progress } from "./progress.js";
import { AIEngine } from "./ai.js";
import { Notifications } from "./notifications.js";
import { fireStreakConfetti } from "./confetti.js";

const TYPING_PRACTICES = {
  basico: [
    {
      title: "Tildes Agudas Básicas",
      text: "El café en la mañana me dio una gran lección sobre la atención y la dedicación."
    },
    {
      title: "Acentuación Grave",
      text: "Ángel llevaba un lápiz ágil en su túnel de ideas antes de tomar el autobús."
    },
    {
      title: "Esdrújulas y Mayúsculas",
      text: "La lámpara del médico iluminó la gráfica matemática sobre la rápida pirámide."
    }
  ],
  intermedio: [
    {
      title: "Tilde Diacrítica",
      text: "Él me dijo que sí vendría, pero aún no sé si a mí me dará tiempo de tomar el té."
    },
    {
      title: "Acentuación y Puntuación",
      text: "Asimismo, la comunicación fluida y la ortografía impecable son indispensables en el ámbito profesional."
    },
    {
      title: "Diptongos e Hiatos",
      text: "María creía que la geografía y la biología requerían más energía de la que tenía."
    }
  ],
  avanzado: [
    {
      title: "Texto Complejo con Tildes y Ortografía",
      text: "La perseverancia es la clave del éxito; aquél que practica con constancia logrará dominar cada tilde, acento y estructura gramatical con absoluta precisión y fluidez."
    },
    {
      title: "Dictado Lingüístico Profesional",
      text: "En síntesis, la agudeza mental, la perspicacia y la resiliencia convierten la escritura en una herramienta poderosa de expresión e influencia."
    }
  ]
};

export class MecanografiaEngine {
  static render(container) {
    const user = Auth.getUser();
    user.spellingErrorsList = user.spellingErrorsList || [
      { word: "cancion", correction: "canción", rule: "Palabra aguda terminada en 'n', requiere tilde en la 'o'.", count: 2 },
      { word: "tambien", correction: "también", rule: "Palabra aguda terminada en 'n', requiere tilde.", count: 1 },
      { word: "agil", correction: "ágil", rule: "Palabra grave terminada en consonante distinta de n, s o vocal.", count: 1 }
    ];

    let activeTab = "mecanografia"; // mecanografia | corrector | errores
    let selectedDifficulty = "basico";
    let selectedPracticeIdx = 0;

    // Typing test state variables
    let targetText = TYPING_PRACTICES[selectedDifficulty][selectedPracticeIdx].text;
    let userInput = "";
    let startTime = null;
    let timerInterval = null;
    let isCompleted = false;

    const renderMainUI = () => {
      container.innerHTML = `
        <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
          <!-- Header Banner -->
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/90 via-purple-900/70 to-slate-900 backdrop-blur-xl border border-white/10 text-white p-6 md:p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs">
                  ⌨️ Práctica & Corrección Ortográfica
                </span>
              </div>
              <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">Mecanografía, Tildes y Ortografía</h1>
              <p class="text-slate-300 text-sm mt-1 max-w-xl">
                Mejora tu velocidad de tecleo, perfecciona tu acentuación y aprende a escribir correctamente todas las palabras corregidas.
              </p>
            </div>

            <!-- Tab Buttons -->
            <div class="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button id="tab-mecanografia-btn" class="px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${activeTab === 'mecanografia' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:text-white hover:bg-white/10'}">
                ⌨️ Práctica de Mecanografía
              </button>
              <button id="tab-corrector-btn" class="px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${activeTab === 'corrector' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:text-white hover:bg-white/10'}">
                🔍 Corrector Ortográfico (IA)
              </button>
              <button id="tab-errores-btn" class="px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${activeTab === 'errores' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:text-white hover:bg-white/10'}">
                📚 Mis Correcciones (${user.spellingErrorsList.length})
              </button>
            </div>
          </div>

          <!-- Tab Content Area -->
          <div id="mecanografia-tab-content"></div>
        </div>
      `;

      // Bind Tab Listeners
      document.getElementById("tab-mecanografia-btn")?.addEventListener("click", () => {
        activeTab = "mecanografia";
        renderMainUI();
      });
      document.getElementById("tab-corrector-btn")?.addEventListener("click", () => {
        activeTab = "corrector";
        renderMainUI();
      });
      document.getElementById("tab-errores-btn")?.addEventListener("click", () => {
        activeTab = "errores";
        renderMainUI();
      });

      const contentEl = document.getElementById("mecanografia-tab-content");
      if (activeTab === "mecanografia") {
        renderTypingPracticeTab(contentEl);
      } else if (activeTab === "corrector") {
        renderOrthographyCorrectorTab(contentEl);
      } else if (activeTab === "errores") {
        renderErrorGlossaryTab(contentEl);
      }
    };

    // 1. TYPING PRACTICE TAB
    const renderTypingPracticeTab = (parent) => {
      parent.innerHTML = `
        <div class="space-y-6 animate-fade-in">
          <!-- Selection & Controls Bar -->
          <div class="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-xs font-bold text-slate-400">Nivel de Dificultad:</span>
              <div class="flex flex-wrap gap-1.5 bg-slate-900/60 p-1 rounded-2xl border border-white/10">
                <button id="diff-basico" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedDifficulty === 'basico' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}">
                  Básico (Tildes simples)
                </button>
                <button id="diff-intermedio" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedDifficulty === 'intermedio' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}">
                  Intermedio (Diacríticas)
                </button>
                <button id="diff-avanzado" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedDifficulty === 'avanzado' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}">
                  Avanzado (Textos largos)
                </button>
                ${user.spellingErrorsList.length > 0 ? `
                  <button id="diff-refuerzo" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedDifficulty === 'refuerzo' ? 'bg-amber-500 text-slate-950 shadow' : 'text-amber-400 hover:text-amber-300'}">
                    🎯 Refuerzo de Mis Errores
                  </button>
                ` : ''}
              </div>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button id="change-text-btn" class="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10">
                🔀 Cambiar Texto
              </button>
              <button id="restart-test-btn" class="px-4 py-2 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all">
                🔄 Reiniciar
              </button>
            </div>
          </div>

          <!-- Live Typing Arena -->
          <div class="bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <!-- Practice Title -->
            <div class="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-white/10 pb-3">
              <span id="typing-title-text" class="text-indigo-400 uppercase tracking-wider">
                ${selectedDifficulty === 'refuerzo' ? '🎯 Refuerzo de Palabras que Has Fallado' : TYPING_PRACTICES[selectedDifficulty][selectedPracticeIdx].title}
              </span>
              <span class="text-slate-400">Escribe exactamente respetando tildes, mayúsculas y espacios</span>
            </div>

            <!-- Display Text Visualizer -->
            <div id="typing-display-box" class="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 font-mono text-lg md:text-xl leading-relaxed tracking-wide text-slate-400 select-none min-h-[120px] flex flex-wrap content-start items-center gap-y-2">
              <!-- Rendered character by character dynamically -->
            </div>

            <!-- Text Input Area -->
            <div class="relative">
              <textarea id="typing-textarea" rows="3" placeholder="Haz clic aquí y comienza a teclear..." class="w-full p-4 rounded-2xl bg-slate-950 border-2 border-indigo-500/40 focus:border-indigo-400 text-white font-mono text-base outline-none resize-none shadow-inner transition-all"></textarea>
              <div id="typing-focus-hint" class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex items-center justify-center cursor-pointer text-indigo-300 font-bold text-sm border border-indigo-500/30 hover:bg-slate-950/80 transition-all">
                ⌨️ Haz clic aquí para comenzar a escribir
              </div>
            </div>

            <!-- Live Metrics Board -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span class="block text-[10px] uppercase font-bold text-slate-400">Velocidad</span>
                <span id="metric-wpm" class="text-2xl font-extrabold text-indigo-400">0</span>
                <span class="text-[10px] text-slate-500 font-bold block">PPM (Palabras/min)</span>
              </div>

              <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span class="block text-[10px] uppercase font-bold text-slate-400">Precisión</span>
                <span id="metric-accuracy" class="text-2xl font-extrabold text-emerald-400">100%</span>
                <span class="text-[10px] text-slate-500 font-bold block">Acierto de Teclas</span>
              </div>

              <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span class="block text-[10px] uppercase font-bold text-slate-400">Errores / Tildes</span>
                <span id="metric-errors" class="text-2xl font-extrabold text-rose-400">0</span>
                <span class="text-[10px] text-slate-500 font-bold block">Erratas Detectadas</span>
              </div>

              <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span class="block text-[10px] uppercase font-bold text-slate-400">Tiempo</span>
                <span id="metric-time" class="text-2xl font-extrabold text-amber-400">0s</span>
                <span class="text-[10px] text-slate-500 font-bold block">Transcurrido</span>
              </div>
            </div>
          </div>

          <!-- Finger Placement & Keyboard Guide -->
          <div class="bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
              <div class="flex items-center gap-3">
                <span class="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 text-2xl border border-indigo-500/30">🖐️</span>
                <div>
                  <h3 class="font-bold text-white text-base">Guía Visual de Posición de Dedos en el Teclado</h3>
                  <p class="text-xs text-slate-300">Coloca tus manos en la fila guía (ASDF - JKLÑ) y usa los dedos asignados a cada color.</p>
                </div>
              </div>
              <button id="toggle-finger-guide-btn" class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10">
                👀 Mostrar / Ocultar Guía
              </button>
            </div>

            <!-- Dynamic Active Finger Guidance Prompt -->
            <div id="active-finger-card"></div>

            <div id="finger-guide-container" class="space-y-6">
              <!-- Visual Keyboard Diagram with Color-Coded Fingers -->
              <div class="overflow-x-auto pb-2">
                <div class="min-w-[680px] bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2 select-none text-xs font-mono font-bold">
                  <!-- Row 1: Numbers -->
                  <div class="flex gap-1 justify-center">
                    <span class="w-10 h-10 rounded-lg bg-rose-500/30 border border-rose-500/50 text-rose-200 flex items-center justify-center">1</span>
                    <span class="w-10 h-10 rounded-lg bg-amber-500/30 border border-amber-500/50 text-amber-200 flex items-center justify-center">2</span>
                    <span class="w-10 h-10 rounded-lg bg-yellow-500/30 border border-yellow-500/50 text-yellow-200 flex items-center justify-center">3</span>
                    <span class="w-10 h-10 rounded-lg bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 flex items-center justify-center">4</span>
                    <span class="w-10 h-10 rounded-lg bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 flex items-center justify-center">5</span>
                    <span class="w-10 h-10 rounded-lg bg-teal-500/30 border border-teal-500/50 text-teal-200 flex items-center justify-center">6</span>
                    <span class="w-10 h-10 rounded-lg bg-teal-500/30 border border-teal-500/50 text-teal-200 flex items-center justify-center">7</span>
                    <span class="w-10 h-10 rounded-lg bg-sky-500/30 border border-sky-500/50 text-sky-200 flex items-center justify-center">8</span>
                    <span class="w-10 h-10 rounded-lg bg-purple-500/30 border border-purple-500/50 text-purple-200 flex items-center justify-center">9</span>
                    <span class="w-10 h-10 rounded-lg bg-fuchsia-500/30 border border-fuchsia-500/50 text-fuchsia-200 flex items-center justify-center">0</span>
                  </div>

                  <!-- Row 2: QWERTY -->
                  <div class="flex gap-1 justify-center">
                    <span class="w-10 h-10 rounded-lg bg-rose-500/30 border border-rose-500/50 text-rose-200 flex items-center justify-center">Q</span>
                    <span class="w-10 h-10 rounded-lg bg-amber-500/30 border border-amber-500/50 text-amber-200 flex items-center justify-center">W</span>
                    <span class="w-10 h-10 rounded-lg bg-yellow-500/30 border border-yellow-500/50 text-yellow-200 flex items-center justify-center">E</span>
                    <span class="w-10 h-10 rounded-lg bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 flex items-center justify-center">R</span>
                    <span class="w-10 h-10 rounded-lg bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 flex items-center justify-center">T</span>
                    <span class="w-10 h-10 rounded-lg bg-teal-500/30 border border-teal-500/50 text-teal-200 flex items-center justify-center">Y</span>
                    <span class="w-10 h-10 rounded-lg bg-teal-500/30 border border-teal-500/50 text-teal-200 flex items-center justify-center">U</span>
                    <span class="w-10 h-10 rounded-lg bg-sky-500/30 border border-sky-500/50 text-sky-200 flex items-center justify-center">I</span>
                    <span class="w-10 h-10 rounded-lg bg-purple-500/30 border border-purple-500/50 text-purple-200 flex items-center justify-center">O</span>
                    <span class="w-10 h-10 rounded-lg bg-fuchsia-500/30 border border-fuchsia-500/50 text-fuchsia-200 flex items-center justify-center">P</span>
                  </div>

                  <!-- Row 3: ASDFGHJKLÑ (Fila Guía) -->
                  <div class="flex gap-1 justify-center">
                    <span class="w-10 h-10 rounded-lg bg-rose-500/40 border-2 border-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">A</span>
                    <span class="w-10 h-10 rounded-lg bg-amber-500/40 border-2 border-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">S</span>
                    <span class="w-10 h-10 rounded-lg bg-yellow-500/40 border-2 border-yellow-400 text-white flex items-center justify-center shadow-lg shadow-yellow-500/20">D</span>
                    <span class="w-10 h-10 rounded-lg bg-emerald-500/50 border-2 border-emerald-300 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-500/30 relative">F<span class="w-1.5 h-1.5 rounded-full bg-white absolute bottom-1"></span></span>
                    <span class="w-10 h-10 rounded-lg bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 flex items-center justify-center">G</span>
                    <span class="w-10 h-10 rounded-lg bg-teal-500/30 border border-teal-500/50 text-teal-200 flex items-center justify-center">H</span>
                    <span class="w-10 h-10 rounded-lg bg-teal-500/50 border-2 border-teal-300 text-white flex flex-col items-center justify-center shadow-lg shadow-teal-500/30 relative">J<span class="w-1.5 h-1.5 rounded-full bg-white absolute bottom-1"></span></span>
                    <span class="w-10 h-10 rounded-lg bg-sky-500/40 border-2 border-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">K</span>
                    <span class="w-10 h-10 rounded-lg bg-purple-500/40 border-2 border-purple-400 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">L</span>
                    <span class="w-10 h-10 rounded-lg bg-fuchsia-500/40 border-2 border-fuchsia-400 text-white flex items-center justify-center shadow-lg shadow-fuchsia-500/20">Ñ</span>
                  </div>

                  <!-- Row 4: ZXCVBNM -->
                  <div class="flex gap-1 justify-center">
                    <span class="w-10 h-10 rounded-lg bg-rose-500/30 border border-rose-500/50 text-rose-200 flex items-center justify-center">Z</span>
                    <span class="w-10 h-10 rounded-lg bg-amber-500/30 border border-amber-500/50 text-amber-200 flex items-center justify-center">X</span>
                    <span class="w-10 h-10 rounded-lg bg-yellow-500/30 border border-yellow-500/50 text-yellow-200 flex items-center justify-center">C</span>
                    <span class="w-10 h-10 rounded-lg bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 flex items-center justify-center">V</span>
                    <span class="w-10 h-10 rounded-lg bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 flex items-center justify-center">B</span>
                    <span class="w-10 h-10 rounded-lg bg-teal-500/30 border border-teal-500/50 text-teal-200 flex items-center justify-center">N</span>
                    <span class="w-10 h-10 rounded-lg bg-teal-500/30 border border-teal-500/50 text-teal-200 flex items-center justify-center">M</span>
                    <span class="w-10 h-10 rounded-lg bg-sky-500/30 border border-sky-500/50 text-sky-200 flex items-center justify-center">,</span>
                    <span class="w-10 h-10 rounded-lg bg-purple-500/30 border border-purple-500/50 text-purple-200 flex items-center justify-center">.</span>
                  </div>

                  <!-- Row 5: Space Bar -->
                  <div class="flex gap-1 justify-center pt-1">
                    <span class="w-72 h-8 rounded-lg bg-indigo-500/40 border-2 border-indigo-400 text-indigo-200 flex items-center justify-center font-sans text-[11px] shadow-lg shadow-indigo-500/20">BARRA ESPACIADORA (PULGARES)</span>
                  </div>
                </div>
              </div>

              <!-- Hands & Fingers Legend Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Left Hand -->
                <div class="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                  <h4 class="font-bold text-xs uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    🖐️ MANO IZQUIERDA (Fila Guía: A - S - D - F)
                  </h4>
                  <div class="space-y-1.5 text-xs">
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Meñique:</span>
                      <span class="text-slate-400">A, Q, Z, 1, Shift Izquierdo, Tab</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Anular:</span>
                      <span class="text-slate-400">S, W, X, 2</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-yellow-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Medio:</span>
                      <span class="text-slate-400">D, E, C, 3</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Índice (Punto F):</span>
                      <span class="text-slate-400">F, G, R, T, V, B, 4, 5</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Pulgar:</span>
                      <span class="text-slate-400">Barra Espaciadora</span>
                    </div>
                  </div>
                </div>

                <!-- Right Hand -->
                <div class="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                  <h4 class="font-bold text-xs uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    🤚 MANO DERECHA (Fila Guía: J - K - L - Ñ)
                  </h4>
                  <div class="space-y-1.5 text-xs">
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-teal-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Índice (Punto J):</span>
                      <span class="text-slate-400">J, H, Y, U, N, M, 6, 7</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Medio:</span>
                      <span class="text-slate-400">K, I, coma (,), 8</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Anular:</span>
                      <span class="text-slate-400">L, O, punto (.), 9</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-fuchsia-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Meñique:</span>
                      <span class="text-slate-400">Ñ, P, guion (-), Enter, Shift Der</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-sm"></span>
                      <span class="text-slate-200 font-semibold">Pulgar:</span>
                      <span class="text-slate-400">Barra Espaciadora</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Set current practice text
      const updateTargetText = () => {
        if (selectedDifficulty === "refuerzo") {
          const words = user.spellingErrorsList.map(e => e.correction).join(" ");
          targetText = words || "El aprendizaje constante y la práctica diaria mejoran la ortografía y la velocidad.";
        } else {
          const list = TYPING_PRACTICES[selectedDifficulty];
          selectedPracticeIdx = selectedPracticeIdx % list.length;
          targetText = list[selectedPracticeIdx].text;
        }
        userInput = "";
        startTime = null;
        if (timerInterval) clearInterval(timerInterval);
        isCompleted = false;

        const textarea = document.getElementById("typing-textarea");
        if (textarea) textarea.value = "";
        renderDisplayCharacters();
      };

      const getFingerForChar = (c) => {
        if (!c) return { name: "Pulgar", hand: "Ambas Manos", color: "bg-indigo-500", textColor: "text-indigo-300" };
        const char = c.toLowerCase();
        if (char === ' ') return { name: "Pulgar", hand: "Ambas Manos", color: "bg-indigo-500", textColor: "text-indigo-300" };
        if ("1qaz".includes(char)) return { name: "Meñique Izquierdo", hand: "Mano Izquierda", color: "bg-rose-500", textColor: "text-rose-300" };
        if ("2wsx".includes(char)) return { name: "Anular Izquierdo", hand: "Mano Izquierda", color: "bg-amber-500", textColor: "text-amber-300" };
        if ("3edc".includes(char)) return { name: "Medio Izquierdo", hand: "Mano Izquierda", color: "bg-yellow-500", textColor: "text-yellow-300" };
        if ("45rtfgvb".includes(char)) return { name: "Índice Izquierdo (Dedo para F, G, R, T, V, B)", hand: "Mano Izquierda", color: "bg-emerald-500", textColor: "text-emerald-300" };
        if ("67yuhjnm".includes(char)) return { name: "Índice Derecho (Dedo para J, H, Y, U, N, M)", hand: "Mano Derecha", color: "bg-teal-500", textColor: "text-teal-300" };
        if ("8ik,".includes(char)) return { name: "Medio Derecho", hand: "Mano Derecha", color: "bg-sky-500", textColor: "text-sky-300" };
        if ("9ol.".includes(char)) return { name: "Anular Derecho", hand: "Mano Derecha", color: "bg-purple-500", textColor: "text-purple-300" };
        if ("0pñ".includes(char)) return { name: "Meñique Derecho", hand: "Mano Derecha", color: "bg-fuchsia-500", textColor: "text-fuchsia-300" };
        return { name: "Dedo Asignado", hand: "Posición Guía", color: "bg-indigo-500", textColor: "text-indigo-300" };
      };

      const renderDisplayCharacters = () => {
        const displayBox = document.getElementById("typing-display-box");
        if (!displayBox) return;

        let html = "";
        for (let i = 0; i < targetText.length; i++) {
          const targetChar = targetText[i];
          const userChar = userInput[i];

          if (userChar === undefined) {
            const isCurrent = i === userInput.length;
            html += `<span class="${isCurrent ? 'bg-indigo-500 text-white underline animate-pulse rounded px-0.5' : 'text-slate-400'}">${targetChar === ' ' ? '&nbsp;' : targetChar}</span>`;
          } else if (userChar === targetChar) {
            html += `<span class="text-emerald-400 font-bold">${targetChar === ' ' ? '&nbsp;' : targetChar}</span>`;
          } else {
            html += `<span class="text-white bg-rose-500/80 rounded px-0.5 font-bold animate-shake" title="Debería ser: '${targetChar}'">${userChar === ' ' ? '_' : userChar}</span>`;
          }
        }
        displayBox.innerHTML = html;

        // Update dynamic active finger guidance card
        const currentChar = targetText[userInput.length];
        const activeCard = document.getElementById("active-finger-card");
        if (activeCard) {
          if (currentChar !== undefined) {
            const finger = getFingerForChar(currentChar);
            activeCard.innerHTML = `
              <div class="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                <div class="flex items-center gap-3.5">
                  <span class="w-11 h-11 rounded-2xl ${finger.color} text-white font-black text-xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                    ${currentChar === ' ' ? '␣' : currentChar.toUpperCase()}
                  </span>
                  <div>
                    <p class="text-xs font-bold text-white">Siguiente Tecla: <strong class="text-indigo-300 uppercase">${currentChar === ' ' ? 'Barra Espaciadora' : `'${currentChar}'`}</strong></p>
                    <p class="text-xs ${finger.textColor} font-semibold">👉 Usar: <strong class="text-white font-extrabold">${finger.name}</strong> (${finger.hand})</p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-[11px] font-bold">
                  📍 Guía de Mecanografía en Vivo
                </span>
              </div>
            `;
          } else {
            activeCard.innerHTML = `
              <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                🎉 ¡Texto completado! Excelente trabajo de posición de manos.
              </div>
            `;
          }
        }
      };

      const updateMetrics = () => {
        const now = new Date();
        const elapsedSec = startTime ? Math.max(1, Math.round((now - startTime) / 1000)) : 0;
        const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length;
        const wpm = elapsedSec > 0 ? Math.round((wordsTyped / elapsedSec) * 60) : 0;

        let totalTyped = userInput.length;
        let correctTyped = 0;
        let errors = 0;

        for (let i = 0; i < userInput.length; i++) {
          if (userInput[i] === targetText[i]) {
            correctTyped++;
          } else {
            errors++;
          }
        }

        const accuracy = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;

        const wpmEl = document.getElementById("metric-wpm");
        const accEl = document.getElementById("metric-accuracy");
        const errEl = document.getElementById("metric-errors");
        const timeEl = document.getElementById("metric-time");

        if (wpmEl) wpmEl.textContent = wpm;
        if (accEl) accEl.textContent = `${accuracy}%`;
        if (errEl) errEl.textContent = errors;
        if (timeEl) timeEl.textContent = `${elapsedSec}s`;

        return { wpm, accuracy, errors, elapsedSec };
      };

      const textarea = document.getElementById("typing-textarea");
      const focusHint = document.getElementById("typing-focus-hint");

      if (focusHint && textarea) {
        focusHint.onclick = () => {
          focusHint.classList.add("hidden");
          textarea.focus();
        };

        textarea.onfocus = () => focusHint.classList.add("hidden");

        textarea.oninput = () => {
          if (!startTime && textarea.value.length > 0) {
            startTime = new Date();
            timerInterval = setInterval(updateMetrics, 1000);
          }

          userInput = textarea.value;
          renderDisplayCharacters();
          const metrics = updateMetrics();

          // Check completion
          if (userInput.length >= targetText.length && !isCompleted) {
            isCompleted = true;
            if (timerInterval) clearInterval(timerInterval);

            const accuracy = metrics.accuracy;
            const xp = accuracy >= 90 ? 30 : 15;

            const targetWords = targetText.split(/\s+/);
            const userWords = userInput.split(/\s+/);

            targetWords.forEach((tw, idx) => {
              const uw = userWords[idx] || "";
              if (tw !== uw && tw.length > 2) {
                const cleanTW = tw.replace(/[.,;]/g, "");
                const cleanUW = uw.replace(/[.,;]/g, "");
                const exists = user.spellingErrorsList.find(e => e.correction.toLowerCase() === cleanTW.toLowerCase());
                if (!exists) {
                  user.spellingErrorsList.push({
                    word: cleanUW || cleanTW.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                    correction: cleanTW,
                    rule: "Cometiste una errata de acentuación u ortografía al teclear.",
                    count: 1
                  });
                } else {
                  exists.count += 1;
                }
              }
            });

            Auth.saveUser();
            Progress.recordSession({
              module: "mecanografia",
              score: accuracy,
              xpEarned: xp,
              durationMinutes: Math.max(1, Math.ceil(metrics.elapsedSec / 60)),
              wordsWritten: targetWords.length
            });

            fireStreakConfetti();
            Notifications.show(`🎉 ¡Práctica de Mecanografía completada! (${metrics.wpm} PPM, ${accuracy}% Precisión) +${xp} XP`, "success", 5000);
          }
        };
      }

      ["basico", "intermedio", "avanzado", "refuerzo"].forEach(diff => {
        const btn = document.getElementById(`diff-${diff}`);
        if (btn) {
          btn.onclick = () => {
            selectedDifficulty = diff;
            selectedPracticeIdx = 0;
            renderTypingPracticeTab(parent);
          };
        }
      });

      document.getElementById("change-text-btn")?.addEventListener("click", () => {
        if (selectedDifficulty !== "refuerzo") {
          selectedPracticeIdx++;
        }
        updateTargetText();
        Notifications.show("Texto de práctica actualizado", "info");
      });

      document.getElementById("restart-test-btn")?.addEventListener("click", () => {
        updateTargetText();
        if (focusHint) focusHint.classList.remove("hidden");
      });

      document.getElementById("toggle-finger-guide-btn")?.addEventListener("click", () => {
        const guide = document.getElementById("finger-guide-container");
        if (guide) {
          guide.classList.toggle("hidden");
        }
      });

      updateTargetText();
    };

    // 2. ORTHOGRAPHY CORRECTOR TAB
    const renderOrthographyCorrectorTab = (parent) => {
      parent.innerHTML = `
        <div class="space-y-6 animate-fade-in">
          <div class="bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div class="space-y-2">
              <h3 class="text-xl font-extrabold text-white flex items-center gap-2">
                🔍 Analizador & Corrector Ortográfico con Inteligencia Artificial
              </h3>
              <p class="text-xs text-slate-300">
                Escribe o pega cualquier fragmento. El sistema detectará automáticamente palabras mal tildadas, falta de tildes diacríticas y errores ortográficos, explicándote las reglas para aprender de cada corrección.
              </p>
            </div>

            <!-- Text Input Area -->
            <div class="space-y-3">
              <textarea id="corrector-input-text" rows="5" placeholder="Escribe aquí el texto que deseas revisar (ejemplo: 'Ayer el profesor dio una leccion sobre gramatica y acentuacion pero no entendi bien la cancion...')" class="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition-all resize-none"></textarea>
              <div class="flex justify-between items-center">
                <span id="corrector-word-counter" class="text-xs text-slate-400">0 palabras | 0 caracteres</span>
                <button id="run-analysis-btn" class="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 flex items-center gap-2">
                  ✨ Analizar Ortografía y Tildes
                </button>
              </div>
            </div>

            <!-- Analysis Output Container -->
            <div id="corrector-results-container" class="hidden space-y-6 border-t border-white/10 pt-6"></div>
          </div>
        </div>
      `;

      const inputArea = document.getElementById("corrector-input-text");
      const wordCounter = document.getElementById("corrector-word-counter");
      const analyzeBtn = document.getElementById("run-analysis-btn");
      const resultsContainer = document.getElementById("corrector-results-container");

      if (inputArea && wordCounter) {
        inputArea.oninput = () => {
          const text = inputArea.value;
          const words = text.trim().split(/\s+/).filter(Boolean).length;
          wordCounter.textContent = `${words} palabras | ${text.length} caracteres`;
        };
      }

      if (analyzeBtn) {
        analyzeBtn.onclick = async () => {
          const text = inputArea.value.trim();
          if (!text) {
            Notifications.show("Por favor, ingresa un texto para analizar.", "warning");
            return;
          }

          analyzeBtn.disabled = true;
          analyzeBtn.innerHTML = `⌛ Analizando ortografía y acentuación...`;

          try {
            const evalResult = await AIEngine.evaluateText(text, "ortografia", "Enfócate en detectar palabras con tildes faltantes, errores ortográficos y tildes diacríticas.");

            resultsContainer.classList.remove("hidden");
            resultsContainer.innerHTML = `
              <div class="space-y-6">
                <!-- Overview Header -->
                <div class="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span class="text-xs text-indigo-400 font-bold uppercase tracking-wider block">Calificación Ortográfica</span>
                    <h4 class="text-2xl font-extrabold text-white">${evalResult.score || 90} / 100</h4>
                    <p class="text-xs text-slate-300 mt-1">${evalResult.summary || ''}</p>
                  </div>
                  <div class="flex gap-2">
                    <button id="practice-these-errors-btn" class="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 flex items-center gap-2">
                      ⚡ Practicar estas correcciones en Mecanografía
                    </button>
                  </div>
                </div>

                <!-- Detailed Corrections List -->
                <div class="space-y-3">
                  <h4 class="text-sm font-bold text-white flex items-center gap-2">
                    📝 Desglose de Correcciones Detectadas
                  </h4>
                  ${(!evalResult.corrections || evalResult.corrections.length === 0) ? `
                    <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      🎉 ¡Excelente ortografía! No se detectaron errores de tildes o gramática en este fragmento.
                    </div>
                  ` : evalResult.corrections.map((c) => `
                    <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                      <div class="flex items-center justify-between flex-wrap gap-2">
                        <div class="flex items-center gap-2">
                          <span class="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold line-through">${c.original}</span>
                          <span class="text-slate-400">➔</span>
                          <span class="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold">${c.suggestion}</span>
                        </div>
                        <span class="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">${c.type || 'ortografía'}</span>
                      </div>
                      <p class="text-slate-300 leading-relaxed"><strong class="text-amber-300">Regla explicativa:</strong> ${c.explanation}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;

            if (evalResult.corrections && evalResult.corrections.length > 0) {
              evalResult.corrections.forEach(c => {
                const orig = c.original || "";
                const sug = c.suggestion || "";
                if (orig && sug && orig !== sug) {
                  const exists = user.spellingErrorsList.find(e => e.correction.toLowerCase() === sug.toLowerCase());
                  if (!exists) {
                    user.spellingErrorsList.push({
                      word: orig,
                      correction: sug,
                      rule: c.explanation || "Regla ortográfica de acentuación.",
                      count: 1
                    });
                  } else {
                    exists.count += 1;
                  }
                }
              });
              Auth.saveUser();
            }

            const practiceBtn = document.getElementById("practice-these-errors-btn");
            if (practiceBtn) {
              practiceBtn.onclick = () => {
                activeTab = "mecanografia";
                selectedDifficulty = "refuerzo";
                renderMainUI();
                Notifications.show("Práctica personalizada iniciada con las palabras corregidas.", "success");
              };
            }

          } catch (err) {
            console.error("Error en análisis:", err);
            Notifications.show("Error al analizar ortografía.", "error");
          } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `✨ Analizar Ortografía y Tildes`;
          }
        };
      }
    };

    // 3. ERROR GLOSSARY TAB
    const renderErrorGlossaryTab = (parent) => {
      parent.innerHTML = `
        <div class="space-y-6 animate-fade-in">
          <div class="bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 class="text-xl font-extrabold text-white flex items-center gap-2">
                  📚 Mi Banco de Correcciones y Palabras a Reforzar
                </h3>
                <p class="text-xs text-slate-300">
                  Aquí se guardan las palabras en las que has cometido errores de ortografía o tildes para repasarlas repetidamente hasta dominarlas.
                </p>
              </div>
              <button id="start-glossary-practice-btn" class="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 flex items-center gap-2">
                🎯 Iniciar Sesión de Refuerzo de Mecanografía
              </button>
            </div>

            ${user.spellingErrorsList.length === 0 ? `
              <div class="p-8 text-center bg-white/5 rounded-3xl border border-white/10 space-y-3">
                <span class="text-4xl block">✨</span>
                <h4 class="text-lg font-bold text-white">¡No tienes palabras pendientes de corrección!</h4>
                <p class="text-xs text-slate-300 max-w-md mx-auto">
                  A medida que realices ejercicios o teclees en el corrector, las palabras que falles se guardarán aquí automáticamente.
                </p>
              </div>
            ` : `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${user.spellingErrorsList.map((item) => `
                  <div class="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-amber-500/50 transition-all shadow-md">
                    <div class="flex justify-between items-start">
                      <div>
                        <span class="text-[10px] text-slate-400 font-bold uppercase">Forma con error ➔ Correcta</span>
                        <div class="flex items-center gap-2 mt-0.5">
                          <span class="text-rose-400 font-bold line-through text-sm">${item.word}</span>
                          <span class="text-slate-400 text-xs">➔</span>
                          <span class="text-emerald-400 font-extrabold text-base">${item.correction}</span>
                        </div>
                      </div>
                      <span class="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-bold">
                        Fallado ${item.count} vez${item.count > 1 ? 'es' : ''}
                      </span>
                    </div>

                    <p class="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                      <strong class="text-amber-300">Regla:</strong> ${item.rule}
                    </p>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      `;

      document.getElementById("start-glossary-practice-btn")?.addEventListener("click", () => {
        activeTab = "mecanografia";
        selectedDifficulty = "refuerzo";
        renderMainUI();
        Notifications.show("Sesión de refuerzo iniciada", "info");
      });
    };

    renderMainUI();
  }
}
