// calendar.js - Monthly Study Habits Calendar & Activity Heatmap

export class CalendarWidget {
  static render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

    let daysHtml = "";

    // Padding for previous month days
    for (let i = 0; i < (firstDayIndex === 0 ? 6 : firstDayIndex - 1); i++) {
      daysHtml += `<div class="p-2 opacity-30 text-center text-xs"></div>`;
    }

    const todayDay = date.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === todayDay;
      const isStudied = [todayDay, todayDay - 1, todayDay - 2].includes(day); // Simulated recent studied days

      daysHtml += `
        <div class="flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all ${
          isToday
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105"
            : isStudied
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            : "hover:bg-white/10 text-slate-300"
        }">
          <span>${day}</span>
          ${isStudied && !isToday ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1"></span>` : ""}
          ${isToday ? `<span class="w-1.5 h-1.5 rounded-full bg-white mt-1"></span>` : ""}
        </div>
      `;
    }

    el.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-bold text-white">${monthNames[month]} ${year}</h4>
        <span class="text-xs px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold">
          🔥 Racha activa
        </span>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 mb-2">
        <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
      </div>
      <div class="grid grid-cols-7 gap-1">
        ${daysHtml}
      </div>
    `;
  }
}
