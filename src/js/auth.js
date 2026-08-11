// auth.js - Multi-User Management, Profiles, Levels, XP & Currency System

import { Storage } from "./storage.js";

const DEFAULT_USER = {
  id: "usr_default",
  name: "Estudiante",
  email: "estudiante@autoestudio.edu",
  role: "estudiante", // estudiante o admin
  avatar: "🎓",
  level: 1,
  levelTitle: "Principiante",
  xp: 120,
  xpToNextLevel: 300,
  coins: 250,
  gems: 15,
  streak: 3,
  lastStudyDate: new Date().toISOString().split("T")[0],
  totalStudyTimeMinutes: 45,
  totalWordsWritten: 320,
  accuracyRate: 88,
  unlockedAvatars: ["🎓", "✏️", "📚", "💡"],
  badges: ["pionero", "primera_leccion"],
  purchasedItems: ["avatar_sparkle"],
  createdAt: new Date().toISOString()
};

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  async init() {
    let activeId = Storage.getItem("active_user_id", "usr_default");
    let users = await Storage.getAllRecords("users");

    if (users.length === 0) {
      await Storage.saveRecord("users", DEFAULT_USER);
      this.currentUser = { ...DEFAULT_USER };
      Storage.setItem("active_user_id", DEFAULT_USER.id);
    } else {
      this.currentUser = users.find(u => u.id === activeId) || users[0];
    }
    this.notify();
  }

  getUser() {
    return this.currentUser || DEFAULT_USER;
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  async saveUser() {
    if (this.currentUser) {
      await Storage.saveRecord("users", this.currentUser);
      this.notify();
    }
  }

  async addXP(amount) {
    if (!this.currentUser) return;
    this.currentUser.xp += amount;
    this.currentUser.coins += Math.round(amount / 2);

    // Check level up
    while (this.currentUser.xp >= this.currentUser.xpToNextLevel) {
      this.currentUser.xp -= this.currentUser.xpToNextLevel;
      this.currentUser.level += 1;
      this.currentUser.gems += 5;
      this.currentUser.xpToNextLevel = Math.round(this.currentUser.xpToNextLevel * 1.3);
      this.updateLevelTitle();
    }

    await this.saveUser();
  }

  updateLevelTitle() {
    const lvl = this.currentUser.level;
    if (lvl < 3) this.currentUser.levelTitle = "Principiante";
    else if (lvl < 7) this.currentUser.levelTitle = "Básico";
    else if (lvl < 12) this.currentUser.levelTitle = "Intermedio";
    else if (lvl < 18) this.currentUser.levelTitle = "Avanzado";
    else if (lvl < 25) this.currentUser.levelTitle = "Experto";
    else this.currentUser.levelTitle = "Maestro Lingüista";
  }

  async createProfile(name, avatar = "🎓", role = "estudiante") {
    const newUser = {
      ...DEFAULT_USER,
      id: `usr_${Date.now()}`,
      name,
      avatar,
      role,
      xp: 0,
      level: 1,
      coins: 100,
      gems: 5,
      streak: 1,
      createdAt: new Date().toISOString()
    };
    await Storage.saveRecord("users", newUser);
    await this.switchUser(newUser.id);
    return newUser;
  }

  async switchUser(userId) {
    let users = await Storage.getAllRecords("users");
    const target = users.find(u => u.id === userId);
    if (target) {
      this.currentUser = target;
      Storage.setItem("active_user_id", userId);
      this.notify();
    }
  }

  async getAllUsers() {
    return await Storage.getAllRecords("users");
  }
}

export const Auth = new AuthSystem();
