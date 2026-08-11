// settings.js - Theme, Mode, Font & Accessibility Controls

import { Storage } from "./storage.js";

const DEFAULT_SETTINGS = {
  theme: "light", // light, dark
  mode: "adult", // adult, kids, senior, high-contrast
  font: "sans", // sans, serif, dyslexia
  fontSize: "normal", // small, normal, large, xlarge
  soundEffects: true,
  ambientSound: false
};

class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
  }

  init() {
    const saved = Storage.getItem("app_settings", null);
    if (saved) {
      this.settings = { ...DEFAULT_SETTINGS, ...saved };
    }
    this.applySettings();
  }

  update(newPartial) {
    this.settings = { ...this.settings, ...newPartial };
    Storage.setItem("app_settings", this.settings);
    this.applySettings();
  }

  applySettings() {
    const root = document.documentElement;

    // Theme (Light/Dark)
    root.setAttribute("data-theme", this.settings.theme);

    // Mode (Adult, Kids, Senior, High Contrast)
    root.setAttribute("data-mode", this.settings.mode);

    // Font
    root.setAttribute("data-font", this.settings.font);

    // Font Size
    if (this.settings.fontSize === "small") root.style.setProperty("--font-size-base", "14px");
    else if (this.settings.fontSize === "normal") root.style.setProperty("--font-size-base", "16px");
    else if (this.settings.fontSize === "large") root.style.setProperty("--font-size-base", "18px");
    else if (this.settings.fontSize === "xlarge") root.style.setProperty("--font-size-base", "20px");
  }
}

export const Settings = new SettingsManager();
