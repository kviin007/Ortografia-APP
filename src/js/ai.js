// ai.js - AI Client Interface for Tutor Chat, Essay Evaluation, & Exercise Generator

export class AIEngine {
  static async evaluateText(text, type = "redaccion", promptContext = "") {
    try {
      const res = await fetch("/api/ai/evaluate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type, promptContext })
      });
      if (!res.ok) throw new Error("Error en servidor AI");
      return await res.json();
    } catch (e) {
      console.warn("AI Fallback local activado:", e);
      // Local fallback calculation
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      const charCount = text.length;
      const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
      const avgSentenceLen = Math.round(wordCount / sentences);
      
      const score = Math.min(100, Math.max(60, 85 - Math.abs(avgSentenceLen - 16) * 2));

      return {
        score,
        wordCount,
        charCount,
        readability: avgSentenceLen < 20 ? "Fácil de leer" : "Complejo",
        summary: "Evaluación procesada localmente. El texto presenta buena extensión. Revisa la variedad léxica y la división en párrafos.",
        corrections: [
          {
            type: "sugerencia",
            original: "Estructura general",
            suggestion: "Utiliza conectores lógicos como 'por lo tanto', 'asimismo' o 'sin embargo'.",
            explanation: "Los conectores mejoran la fluidez y cohesión entre ideas."
          }
        ],
        strengths: ["Fluidez de escritura", "Puntuación adecuada"],
        improvements: ["Variedad de vocabulario", "Uso de conectores discursivos"]
      };
    }
  }

  static async generateExercise(module, level, topic, excludeQuestions = []) {
    try {
      const res = await fetch("/api/ai/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, level, topic, excludeQuestions })
      });
      if (!res.ok) throw new Error("Error generando ejercicio");
      return await res.json();
    } catch (e) {
      const randId = Math.floor(Math.random() * 1000);
      return {
        id: `gen_local_${Date.now()}_${randId}`,
        module,
        level,
        topic,
        type: "opcion_multiple",
        question: `¿Cuál de las siguientes palabras presenta la ortografía correcta? [Variante ${randId}]`,
        options: ["Decisión", "Desición", "Decición", "Desisión"],
        correctIndex: 0,
        explanation: "'Decisión' se escribe con 'c' en la primera sílaba y 's' en la terminación -sión.",
        rule: "Terminación -sión cuando deriva de palabras que terminan en -so, -sor, -sivo, -sible."
      };
    }
  }

  static async tutorChat(message, history = []) {
    try {
      const res = await fetch("/api/ai/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history })
      });
      if (!res.ok) throw new Error("Error tutor chat");
      const data = await res.json();
      return data.reply;
    } catch (e) {
      return "¡Hola! Estoy en modo offline. Te sugiero revisar las reglas de acentuación en la lección correspondiente o practicar en los ejercicios de ortografía.";
    }
  }
}
