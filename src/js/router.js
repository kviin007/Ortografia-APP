// router.js - Single Page Application View Navigation Router with Unsaved Progress Guard

class RouterEngine {
  constructor() {
    this.routes = {};
    this.currentView = null;
    this.isTestInProgress = false;
    this.isEditorInProgress = false;

    // Attach window beforeunload listener
    window.addEventListener("beforeunload", (e) => {
      if (this.hasUnsavedProgress()) {
        e.preventDefault();
        e.returnValue = "Tienes una sesión o prueba en curso. ¿Seguro que deseas salir?";
        return e.returnValue;
      }
    });
  }

  setTestActive(active) {
    this.isTestInProgress = active;
  }

  setEditorActive(active) {
    this.isEditorInProgress = active;
  }

  hasUnsavedProgress() {
    if (this.currentView === "ejercicio" && this.isTestInProgress) {
      return true;
    }
    if (this.currentView === "editor") {
      const textarea = document.getElementById("editor-textarea");
      if (textarea && (textarea.innerText || textarea.value || "").trim().length > 15) {
        return true;
      }
      if (this.isEditorInProgress) return true;
    }
    return false;
  }

  registerRoute(name, renderCallback) {
    this.routes[name] = renderCallback;
  }

  navigateTo(viewName, params = {}, force = false) {
    if (this.currentView === viewName && !force) return;

    if (!force && this.hasUnsavedProgress()) {
      this.showExitConfirmationDialog(() => {
        // User confirmed exit
        this.isTestInProgress = false;
        this.isEditorInProgress = false;
        this.executeNavigation(viewName, params);
      });
      return;
    }

    this.executeNavigation(viewName, params);
  }

  executeNavigation(viewName, params) {
    const route = this.routes[viewName] || this.routes["dashboard"];
    if (route) {
      this.currentView = viewName;

      // Update active sidebar nav styling
      document.querySelectorAll("[data-nav]").forEach(btn => {
        if (btn.getAttribute("data-nav") === viewName) {
          btn.classList.add("bg-indigo-500/20", "text-indigo-300", "font-bold", "border", "border-indigo-500/30");
          btn.classList.remove("text-slate-400", "hover:bg-white/5");
        } else {
          btn.classList.remove("bg-indigo-500/20", "text-indigo-300", "font-bold", "border", "border-indigo-500/30");
          btn.classList.add("text-slate-400", "hover:bg-white/5");
        }
      });

      const container = document.getElementById("main-view-container");
      if (container) {
        container.innerHTML = "";
        route(container, params);
        container.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  showExitConfirmationDialog(onConfirm) {
    let dialog = document.getElementById("exit-confirm-modal");
    if (dialog) dialog.remove();

    const isTest = this.currentView === "ejercicio";
    const sessionType = isTest ? "un test en curso" : "una sesión de escritura en curso";

    dialog = document.createElement("div");
    dialog.id = "exit-confirm-modal";
    dialog.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in";
    dialog.innerHTML = `
      <div class="bg-slate-900 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">¿Abandonar ${sessionType}?</h3>
            <p class="text-xs text-amber-300 font-medium">Hay progreso no guardado que podría perderse</p>
          </div>
        </div>

        <p class="text-sm text-slate-300 leading-relaxed">
          Si abandonas la pantalla actual sin completar o guardar tu progreso, la prueba o borrador en curso no quedará registrado en tus estadísticas.
        </p>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button id="cancel-exit-btn" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all">
            Continuar Práctica
          </button>
          <button id="confirm-exit-btn" class="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/30 transition-all">
            Salir sin Guardar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    document.getElementById("cancel-exit-btn").addEventListener("click", () => {
      dialog.remove();
    });

    document.getElementById("confirm-exit-btn").addEventListener("click", () => {
      dialog.remove();
      if (onConfirm) onConfirm();
    });
  }
}

export const Router = new RouterEngine();
