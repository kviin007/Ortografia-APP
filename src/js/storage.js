// storage.js - IndexedDB and LocalStorage Abstraction Engine for 100% Offline Persistence

const DB_NAME = "AutoestudioEscrituraDB";
const DB_VERSION = 1;

class StorageEngine {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB no disponible, usando localStorage.");
        return resolve(false);
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("users")) db.createObjectStore("users", { keyPath: "id" });
        if (!db.objectStoreNames.contains("progress")) db.createObjectStore("progress", { keyPath: "id" });
        if (!db.objectStoreNames.contains("history")) db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
        if (!db.objectStoreNames.contains("custom_exercises")) db.createObjectStore("custom_exercises", { keyPath: "id" });
        if (!db.objectStoreNames.contains("backups")) db.createObjectStore("backups", { keyPath: "timestamp" });
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(true);
      };

      request.onerror = () => {
        console.warn("Error al abrir IndexedDB, usando fallback.");
        resolve(false);
      };
    });
  }

  // LocalStorage Fallback Helpers
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error guardando en localStorage", e);
    }
  }

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  // IndexedDB Methods
  async saveRecord(storeName, record) {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } else {
      const records = this.getItem(storeName, []);
      const idx = records.findIndex(r => r.id === record.id);
      if (idx >= 0) records[idx] = record;
      else records.push(record);
      this.setItem(storeName, records);
      return true;
    }
  }

  async getAllRecords(storeName) {
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } else {
      return this.getItem(storeName, []);
    }
  }

  // Export Complete Backup JSON
  async exportFullBackup() {
    const data = {
      version: 1,
      timestamp: new Date().toISOString(),
      activeUser: this.getItem("active_user_id"),
      users: await this.getAllRecords("users"),
      progress: await this.getAllRecords("progress"),
      history: await this.getAllRecords("history"),
      customExercises: await this.getAllRecords("custom_exercises"),
      settings: this.getItem("app_settings", {})
    };
    return JSON.stringify(data, null, 2);
  }

  // Import Complete Backup JSON
  async importFullBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.users || !Array.isArray(data.users)) throw new Error("Formato de respaldo inválido");

      for (const u of data.users) await this.saveRecord("users", u);
      if (data.progress) for (const p of data.progress) await this.saveRecord("progress", p);
      if (data.history) for (const h of data.history) await this.saveRecord("history", h);
      if (data.settings) this.setItem("app_settings", data.settings);
      if (data.activeUser) this.setItem("active_user_id", data.activeUser);

      return true;
    } catch (e) {
      console.error("Error importando respaldo:", e);
      return false;
    }
  }
}

export const Storage = new StorageEngine();
