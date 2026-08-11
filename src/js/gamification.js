// gamification.js - Badges, Virtual Shop, Weekly Leagues, Daily Missions & Rewards

import { Auth } from "./auth.js";
import { Notifications } from "./notifications.js";
import { fireCelebrationConfetti } from "./confetti.js";

export const BADGES_LIST = [
  { id: "pionero", title: "Pionero del Lenguaje", icon: "🚀", description: "Iniciaste tu camino en la plataforma de autoestudio." },
  { id: "primera_leccion", title: "Primer Paso", icon: "🌱", description: "Completaste tu primera lección interactiva." },
  { id: "racha_3", title: "Constancia de Bronce", icon: "🔥", description: "Mantén una racha de 3 días consecutivos." },
  { id: "racha_7", title: "Llama de Oro", icon: "⚡", description: "Mantén una racha de 7 días consecutivos." },
  { id: "redactor_pro", title: "Pluma de Oro", icon: "✍️", description: "Escribe más de 1,000 palabras en el Editor Inteligente." },
  { id: "ortografia_master", title: "Ojo de Águila", icon: "👁️", description: "Obtén 100% de precisión en un examen de ortografía." },
  { id: "velocidad_50", title: "Mano Veloz", icon: "⚡", description: "Supera las 50 palabras por minuto en la prueba de velocidad." }
];

export const SHOP_ITEMS = [
  { id: "avatar_sparkle", name: "Avatar Búho Sabio", type: "avatar", icon: "🦉", costCoins: 150, costGems: 0 },
  { id: "avatar_dragon", name: "Avatar Dragón Lector", type: "avatar", icon: "🐲", costCoins: 300, costGems: 5 },
  { id: "avatar_crown", name: "Avatar Corona Real", type: "avatar", icon: "👑", costCoins: 500, costGems: 10 },
  { id: "streak_freeze", name: "Protector de Racha", type: "booster", icon: "🛡️", costCoins: 200, costGems: 2, description: "Protege tu racha si pierdes un día de estudio." },
  { id: "double_xp", name: "Poción Doble XP (24h)", type: "booster", icon: "🧪", costCoins: 250, costGems: 3, description: "Duplica los XP ganados durante 24 horas." }
];

export const DAILY_MISSIONS = [
  { id: "m_1", title: "Estudia 15 minutos hoy", xpReward: 50, coinsReward: 30, progress: 15, target: 15, completed: true },
  { id: "m_2", title: "Completa 2 ejercicios de Ortografía", xpReward: 40, coinsReward: 20, progress: 1, target: 2, completed: false },
  { id: "m_3", title: "Escribe un texto en el Editor Inteligente", xpReward: 60, coinsReward: 40, progress: 0, target: 1, completed: false }
];

export const LEAGUE_RANKING = [
  { rank: 1, name: "Dra. Sofía Morales", avatar: "👩‍🏫", xp: 1450, league: "Diamante" },
  { rank: 2, name: "Carlos Mendoza", avatar: "👨‍💻", xp: 1220, league: "Diamante" },
  { rank: 3, name: "Tú (Estudiante)", avatar: "🎓", xp: 890, league: "Oro" },
  { rank: 4, name: "Lucía Fernández", avatar: "👩‍🎨", xp: 750, league: "Oro" },
  { rank: 5, name: "Mateo Silva", avatar: "🧑‍🚀", xp: 620, league: "Plata" }
];

class GamificationEngine {
  async buyItem(itemId) {
    const user = Auth.getUser();
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return false;

    if (user.purchasedItems?.includes(itemId)) {
      Notifications.show("Ya posees este elemento.", "info");
      return false;
    }

    if (user.coins < item.costCoins || user.gems < item.costGems) {
      Notifications.show("Monedas o gemas insuficientes.", "warning");
      return false;
    }

    user.coins -= item.costCoins;
    user.gems -= item.costGems;
    user.purchasedItems = user.purchasedItems || [];
    user.purchasedItems.push(itemId);

    if (item.type === "avatar") {
      user.unlockedAvatars = user.unlockedAvatars || [];
      user.unlockedAvatars.push(item.icon);
    }

    await Auth.saveUser();
    Notifications.show(`¡Compraste ${item.name} con éxito!`, "success");
    return true;
  }

  async checkAndAwardBadges() {
    const user = Auth.getUser();
    user.badges = user.badges || ["pionero"];
    let newlyUnlocked = [];

    // Milestone logic
    const checks = [
      { id: "pionero", condition: true },
      { id: "primera_leccion", condition: (user.totalStudyTimeMinutes || 0) > 0 || (user.level || 1) > 1 },
      { id: "racha_3", condition: (user.streak || 0) >= 3 },
      { id: "racha_7", condition: (user.streak || 0) >= 7 },
      { id: "redactor_pro", condition: (user.totalWordsWritten || 0) >= 1000 },
      { id: "ortografia_master", condition: (user.accuracyRate || 0) >= 95 },
      { id: "velocidad_50", condition: (user.wpm || 0) >= 50 }
    ];

    for (const item of checks) {
      if (item.condition && !user.badges.includes(item.id)) {
        user.badges.push(item.id);
        const badgeObj = BADGES_LIST.find(b => b.id === item.id);
        if (badgeObj) newlyUnlocked.push(badgeObj);
      }
    }

    if (newlyUnlocked.length > 0) {
      await Auth.saveUser();
      fireCelebrationConfetti();
      newlyUnlocked.forEach(b => {
        Notifications.show(`🏆 ¡Insignia Desbloqueada!: ${b.icon} ${b.title}`, "success", 5000);
      });
    }
  }

  getBadgesWithStatus() {
    const user = Auth.getUser();
    const unlockedIds = user.badges || ["pionero"];

    return BADGES_LIST.map(badge => ({
      ...badge,
      unlocked: unlockedIds.includes(badge.id)
    }));
  }
}

export const Gamification = new GamificationEngine();
