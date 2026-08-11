// vocabulary.js - Word of the Day & Personal Vocabulary Repository Engine

import { Auth } from "./auth.js";
import { Speech } from "./speech.js";
import { Notifications } from "./notifications.js";
import { fireStreakConfetti } from "./confetti.js";

export const WORDS_DATABASE = [
  {
    id: "word_inefable",
    word: "Inefable",
    type: "adjetivo",
    phonetics: "/i-ne-fá-ble/",
    definition: "Que no se puede explicar o describir con palabras por ser extraordinario, sutil o profundo.",
    example: "Sintió una emoción inefable al ver culminada su obra literaria tras años de esfuerzo.",
    etymology: "Del latín ineffabĭlis, derivado de effari (expresar).",
    category: "Expresión & Literatura"
  },
  {
    id: "word_etimologia",
    word: "Etimología",
    type: "sustantivo femenino",
    phonetics: "/e-ti-mo-lo-gí-a/",
    definition: "Origen de las palabras, razón de su existencia, significación y evolución histórica de su forma.",
    example: "El estudio de la etimología nos permite comprender el significado raíz de términos científicos y cultos.",
    etymology: "Del griego ἐτυμολογία (etymología), formado por étymos (verdadero) y lógos (estudio).",
    category: "Lingüística"
  },
  {
    id: "word_serendipia",
    word: "Serendipia",
    type: "sustantivo femenino",
    phonetics: "/se-ren-dí-pia/",
    definition: "Hallazgo afortunado e inesperado que se produce cuando se está buscando una cosa distinta.",
    example: "El descubrimiento de la penicilina fue una célebre serendipia en la historia de la ciencia.",
    etymology: "Adaptación del inglés serendipity, acuñada por Horace Walpole en 1754.",
    category: "Léxico Culto"
  },
  {
    id: "word_resiliencia",
    word: "Resiliencia",
    type: "sustantivo femenino",
    phonetics: "/re-si-lien-cia/",
    definition: "Capacidad de un individuo o grupo para adaptarse y superar estados o circunstancias adversas.",
    example: "Demostró una notable resiliencia para perfeccionar su redacción a pesar de las dificultades iniciales.",
    etymology: "Del latín resiliens, participio de resilīre (saltar hacia atrás, rebotar).",
    category: "Psicología & Lenguaje"
  },
  {
    id: "word_sempiterno",
    word: "Sempiterno",
    type: "adjetivo",
    phonetics: "/sem-pi-tér-no/",
    definition: "Que durará siempre; que habiendo tenido principio, no tendrá fin.",
    example: "El sempiterno resplandor de las estrellas inspiró a los poetas del siglo de oro.",
    etymology: "Del latín sempiternus, derivado de semper (siempre).",
    category: "Poética"
  },
  {
    id: "word_elocuencia",
    word: "Elocuencia",
    type: "sustantivo femenino",
    phonetics: "/e-lo-cuen-cia/",
    definition: "Facultad de hablar o escribir de modo eficaz para deleitar, conmover o persuadir al receptor.",
    example: "Su elocuencia en el discurso cautivó a todo el auditorio académico.",
    etymology: "Del latín eloquentia, derivado de elŏqui (hablar con claridad).",
    category: "Retórica"
  },
  {
    id: "word_epifania",
    word: "Epifanía",
    type: "sustantivo femenino",
    phonetics: "/e-pi-fa-ní-a/",
    definition: "Revelación, manifestación o comprensión repentina e iluminadora de una verdad profunda.",
    example: "Tuvo una epifanía sobre la estructura de su ensayo mientras caminaba por el parque.",
    etymology: "Del griego ἐπιφάνεια (epipháneia), que significa aparición o manifestación.",
    category: "Filosofía & Estilo"
  }
];

export class VocabularyEngine {
  static getWordOfTheDay() {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const index = dayOfYear % WORDS_DATABASE.length;
    return WORDS_DATABASE[index];
  }

  static getSavedVocabulary() {
    const user = Auth.getUser();
    return user.savedVocabulary || [];
  }

  static isWordSaved(wordId) {
    const saved = this.getSavedVocabulary();
    return saved.some(w => w.id === wordId);
  }

  static async toggleSaveWord(word) {
    const user = Auth.getUser();
    user.savedVocabulary = user.savedVocabulary || [];

    const existingIdx = user.savedVocabulary.findIndex(w => w.id === word.id);
    if (existingIdx >= 0) {
      user.savedVocabulary.splice(existingIdx, 1);
      await Auth.saveUser();
      Notifications.show(`Eliminado de tu vocabulario.`, "info");
      return false;
    } else {
      user.savedVocabulary.push({
        ...word,
        savedAt: new Date().toISOString()
      });
      await Auth.saveUser();
      fireStreakConfetti();
      Notifications.show(`✨ "${word.word}" guardada en tu Repositorio de Vocabulario!`, "success");
      return true;
    }
  }

  static renderWordOfTheDayCard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const wordObj = this.getWordOfTheDay();
    const isSaved = this.isWordSaved(wordObj.id);
    const savedCount = this.getSavedVocabulary().length;

    container.innerHTML = `
      <div class="bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
        <!-- Background Ambient Accent -->
        <div class="absolute -right-10 -bottom-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
              🌟 Palabra del Día
            </span>
            <span class="text-xs text-slate-400 font-semibold">${wordObj.category}</span>
          </div>
          <button onclick="window.Vocabulary.openVocabularyModal()" class="text-xs font-bold text-indigo-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5">
            📚 Vocabulario Guardado (${savedCount})
          </button>
        </div>

        <div class="space-y-1">
          <div class="flex items-baseline gap-3 flex-wrap">
            <h3 class="text-2xl md:text-3xl font-black text-white tracking-tight">${wordObj.word}</h3>
            <span class="text-xs italic text-indigo-300 font-medium">${wordObj.type}</span>
            <span class="text-xs text-slate-400 font-mono">${wordObj.phonetics}</span>
          </div>
          <p class="text-sm text-slate-200 leading-relaxed pt-1 font-medium">
            "${wordObj.definition}"
          </p>
        </div>

        <div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1 text-slate-300">
          <p class="font-semibold text-indigo-300">💡 Ejemplo de Uso:</p>
          <p class="italic text-slate-200">${wordObj.example}</p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button onclick="window.Speech.speak('${wordObj.word}. ${wordObj.definition}')" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-2 transition-all">
            🔊 Escuchar Pronunciación
          </button>
          
          <button id="save-word-btn" onclick="window.Vocabulary.handleSaveWordClick()" class="px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
            isSaved
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20"
          }">
            ${isSaved ? "✓ Guardada en Vocabulario" : "📌 Guardar en mi Vocabulario"}
          </button>
        </div>
      </div>
    `;
  }

  static async handleSaveWordClick() {
    const word = this.getWordOfTheDay();
    await this.toggleSaveWord(word);
    this.renderWordOfTheDayCard("dashboard-word-day-container");
  }

  static openVocabularyModal() {
    let modal = document.getElementById("vocabulary-modal");
    if (modal) modal.remove();

    const saved = this.getSavedVocabulary();

    modal = document.createElement("div");
    modal.id = "vocabulary-modal";
    modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in";
    modal.innerHTML = `
      <div class="bg-slate-900 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        <div class="flex justify-between items-center border-b border-white/10 pb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📚</span>
            <div>
              <h3 class="text-lg font-bold text-white">Repositorio Personal de Vocabulario</h3>
              <p class="text-xs text-slate-400">Colección de palabras guardadas para enriquecer tu léxico</p>
            </div>
          </div>
          <button onclick="document.getElementById('vocabulary-modal').remove()" class="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5">✕</button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-1">
          ${
            saved.length === 0
              ? `<div class="text-center py-12 text-slate-400 text-sm space-y-2">
                   <p class="text-3xl">📖</p>
                   <p class="font-semibold text-white">Aún no has guardado palabras.</p>
                   <p class="text-xs text-slate-400">Guarda la "Palabra del día" o términos de las lecciones para revisarlos aquí.</p>
                 </div>`
              : saved.map(item => `
                  <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 relative group hover:border-indigo-500/40 transition-all">
                    <div class="flex justify-between items-start">
                      <div class="flex items-baseline gap-2">
                        <h4 class="text-lg font-bold text-white">${item.word}</h4>
                        <span class="text-xs text-indigo-300 italic">${item.type}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button onclick="window.Speech.speak('${item.word}')" class="p-1.5 rounded-lg bg-white/10 text-xs hover:bg-white/20 text-white" title="Escuchar">🔊</button>
                        <button onclick="window.Vocabulary.removeWordFromModal('${item.id}')" class="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs hover:bg-rose-500/30" title="Eliminar">🗑️</button>
                      </div>
                    </div>
                    <p class="text-xs text-slate-200">${item.definition}</p>
                    <p class="text-[11px] text-slate-400 italic">Ejemplo: "${item.example}"</p>
                  </div>
                `).join('')
          }
        </div>

        <div class="border-t border-white/10 pt-3 flex justify-between items-center text-xs text-slate-400">
          <span>Total guardadas: ${saved.length} palabras</span>
          <button onclick="document.getElementById('vocabulary-modal').remove()" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold">
            Cerrar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  static async removeWordFromModal(wordId) {
    const user = Auth.getUser();
    if (!user.savedVocabulary) return;
    user.savedVocabulary = user.savedVocabulary.filter(w => w.id !== wordId);
    await Auth.saveUser();
    Notifications.show("Palabra eliminada de tu vocabulario", "info");
    this.openVocabularyModal();
    this.renderWordOfTheDayCard("dashboard-word-day-container");
  }
}
