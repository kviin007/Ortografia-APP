// admin.js - Administrative Dashboard, User Management & Exercise Creator

import { Storage } from "./storage.js";
import { Auth } from "./auth.js";
import { Notifications } from "./notifications.js";

export class AdminPanel {
  static async renderUserList(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const users = await Storage.getAllRecords("users");

    let rowsHtml = users.map(u => `
      <tr class="border-b border-white/10 hover:bg-white/10 transition-all">
        <td class="p-3 font-semibold text-white flex items-center gap-2">
          <span class="text-xl">${u.avatar}</span> ${u.name}
        </td>
        <td class="p-3 text-slate-300">${u.role}</td>
        <td class="p-3"><span class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Nivel ${u.level}</span></td>
        <td class="p-3 font-bold text-amber-300">${u.xp} XP</td>
        <td class="p-3">
          <button class="px-3 py-1.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-indigo-500 text-white border border-white/10 transition-all" onclick="window.switchUserAdmin('${u.id}')">
            Cambiar a Perfil
          </button>
        </td>
      </tr>
    `).join("");

    el.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-white/5 border-b border-white/10 text-slate-300 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th class="p-3">Usuario</th>
              <th class="p-3">Rol</th>
              <th class="p-3">Nivel</th>
              <th class="p-3">XP</th>
              <th class="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    window.switchUserAdmin = async (id) => {
      await Auth.switchUser(id);
      Notifications.show("Perfil activo cambiado.", "success");
      location.reload();
    };
  }
}
