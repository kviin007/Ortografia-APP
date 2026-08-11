// charts.js - Chart.js Wrapper for Interactive Educational Analytics

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export class AnalyticsCharts {
  static renderWeeklyStudyTimeChart(canvasId, data = [30, 45, 60, 20, 50, 40, 65]) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (ctx._chartInstance) ctx._chartInstance.destroy();

    ctx._chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
        datasets: [
          {
            label: "Minutos Estudiados",
            data,
            backgroundColor: "rgba(37, 99, 235, 0.75)",
            borderColor: "#2563eb",
            borderWidth: 2,
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(148, 163, 184, 0.1)" } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  static renderSkillsRadarChart(canvasId, skills = {
    caligrafia: 85,
    ortografia: 90,
    gramatica: 75,
    redaccion: 80,
    comprension: 92,
    velocidad: 70
  }) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (ctx._chartInstance) ctx._chartInstance.destroy();

    ctx._chartInstance = new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Caligrafía", "Ortografía", "Gramática", "Redacción", "Comprensión", "Velocidad"],
        datasets: [
          {
            label: "Dominio %",
            data: Object.values(skills),
            backgroundColor: "rgba(5, 150, 105, 0.25)",
            borderColor: "#059669",
            borderWidth: 2,
            pointBackgroundColor: "#059669"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: "rgba(148, 163, 184, 0.2)" },
            grid: { color: "rgba(148, 163, 184, 0.2)" },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }
}
