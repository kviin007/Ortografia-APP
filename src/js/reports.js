// reports.js - Certificate & Diploma PDF Generator with jsPDF and html2canvas, Excel Exporter with XLSX

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { Auth } from "./auth.js";

export class ReportGenerator {
  // Generate Diploma PDF
  static async generateCertificate(courseTitle = "Curso Completo de Ortografía y Redacción") {
    const user = Auth.getUser();

    // Create temporary hidden certificate DOM node
    const certDom = document.createElement("div");
    certDom.className = "fixed top-0 left-0 -z-50 bg-white text-slate-900 p-12 border-8 border-amber-500 rounded-3xl w-[800px] h-[600px] flex flex-col justify-between items-center text-center font-serif shadow-2xl";
    certDom.style.fontFamily = "'Georgia', serif";

    certDom.innerHTML = `
      <div class="border-4 border-amber-200 p-8 w-full h-full flex flex-col justify-between items-center bg-amber-50/30 rounded-2xl">
        <div class="flex items-center gap-3">
          <span class="text-4xl">🎓</span>
          <h1 class="text-3xl font-bold tracking-wider text-amber-900 uppercase">Certificado de Excelencia Académica</h1>
        </div>
        <div>
          <p class="text-sm italic text-slate-600 mb-2">Se otorga con orgullo el presente diploma a:</p>
          <h2 class="text-4xl font-extrabold text-blue-900 my-2 underline decoration-amber-400 decoration-2">${user.name}</h2>
          <p class="text-base text-slate-700 max-w-lg mx-auto">
            Por haber completado satisfactoriamente el programa de autoestudio en <strong>${courseTitle}</strong>, demostrando un alto nivel de dominio lingüístico, precisión ortográfica y calidad de redacción.
          </p>
        </div>
        <div class="flex justify-between items-end w-full px-8 text-xs text-slate-600">
          <div class="text-left">
            <p><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString("es-ES")}</p>
            <p><strong>Código de Verificación:</strong> CERT-${Date.now().toString().slice(-6)}</p>
          </div>
          <div class="text-center">
            <div class="w-32 border-b-2 border-slate-800 mb-1 mx-auto"></div>
            <p class="font-bold text-slate-800">Plataforma Autoestudio</p>
            <p class="text-[10px]">Dirección Académica</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(certDom);

    try {
      const canvas = await html2canvas(certDom, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [800, 600]
      });

      pdf.addImage(imgData, "PNG", 0, 0, 800, 600);
      pdf.save(`Diploma_${user.name.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      console.error("Error al generar PDF:", e);
    } finally {
      document.body.removeChild(certDom);
    }
  }

  // Export User Progress to Excel
  static exportProgressToExcel() {
    const user = Auth.getUser();
    const data = [
      { Métrica: "Nombre de Usuario", Valor: user.name },
      { Métrica: "Nivel Alcanzado", Valor: `${user.level} (${user.levelTitle})` },
      { Métrica: "Puntos de Experiencia (XP)", Valor: user.xp },
      { Métrica: "Monedas", Valor: user.coins },
      { Métrica: "Gemas", Valor: user.gems },
      { Métrica: "Racha Activa (Días)", Valor: user.streak },
      { Métrica: "Tiempo Total Estudiado (min)", Valor: user.totalStudyTimeMinutes },
      { Métrica: "Palabras Escritas", Valor: user.totalWordsWritten },
      { Métrica: "Tasa de Precisión %", Valor: `${user.accuracyRate}%` }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Progreso");

    XLSX.writeFile(workbook, `Reporte_Progreso_${user.name.replace(/\s+/g, "_")}.xlsx`);
  }
}
