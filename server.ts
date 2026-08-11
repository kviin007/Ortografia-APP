import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", offlineReady: true });
});

// AI Text Evaluation (Redacción, Ortografía, Gramática)
app.post("/api/ai/evaluate-text", async (req, res) => {
  try {
    const { text, type = "redaccion", promptContext = "" } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "El texto ingresado está vacío." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback rule-based offline evaluation if no API key is set
      const wordCount = text.trim().split(/\s+/).length;
      const charCount = text.length;
      const periodCount = (text.match(/\./g) || []).length || 1;
      const wordsPerSentence = Math.round(wordCount / periodCount);
      const score = Math.min(100, Math.max(50, 70 + Math.min(wordCount, 30) - Math.abs(wordsPerSentence - 15)));

      return res.json({
        score,
        wordCount,
        charCount,
        readability: "Adecuada",
        summary: "Evaluación offline local realizada. Para correcciones avanzadas con IA, asegúrate de tener configurada la API Key.",
        corrections: [
          {
            type: "sugerencia",
            original: "Texto analizado",
            suggestion: "Revisa la acentuación y puntuación de tus párrafos.",
            explanation: "Mantén oraciones de entre 15 y 20 palabras para mayor claridad."
          }
        ],
        strengths: ["Longitud del texto", "Estructura general"],
        improvements: ["Revisión de conectores", "Variedad léxica"]
      });
    }

    const systemInstruction = `Eres un experto evaluador lingüístico de español, especialista en ortografía, gramática, redacción, estilo y nivel de legibilidad.
Analiza el texto enviado por el estudiante y responde estrictamente en formato JSON con el esquema solicitado.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Analiza el siguiente texto de tipo "${type}". Contexto adicional: ${promptContext}.
Texto del usuario:
"""
${text}
"""`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Calificación global de 0 a 100" },
            readability: { type: Type.STRING, description: "Nivel de legibilidad (ej. Muy Fácil, Normal, Difícil)" },
            summary: { type: Type.STRING, description: "Resumen constructivo y motivador de 2 oraciones" },
            corrections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "ortografia, gramatica, estilo, o puntuacion" },
                  original: { type: Type.STRING, description: "Fragmento original con error o mejora" },
                  suggestion: { type: Type.STRING, description: "Sugerencia corregida" },
                  explanation: { type: Type.STRING, description: "Explicación clara y didáctica de la regla" }
                },
                required: ["type", "original", "suggestion", "explanation"]
              }
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "readability", "summary", "corrections", "strengths", "improvements"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error en evaluate-text:", error);
    res.status(500).json({ error: error?.message || "Error al analizar el texto con IA." });
  }
});

// AI Exercise Generator
app.post("/api/ai/generate-exercise", async (req, res) => {
  try {
    const { module = "ortografia", level = "Intermedio", topic = "Tildes y acentuación" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        id: `gen_offline_${Date.now()}`,
        module,
        level,
        topic,
        question: `¿Cuál de las siguientes palabras requiere tilde diacrítica en la oración?`,
        options: ["Él llegó temprano a la reunión", "El libro está sobre la mesa", "Me gusta el café solo", "Te daré mi cuaderno"],
        correctIndex: 0,
        explanation: "'Él' lleva tilde diacrítica cuando funciona como pronombre personal para diferenciarlo del artículo 'el'.",
        rule: "Tilde diacrítica en pronombres personales."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Genera 1 ejercicio interactivo de autoestudio en español para el módulo "${module}", nivel "${level}", tema "${topic}". Responde en JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            module: { type: Type.STRING },
            level: { type: Type.STRING },
            topic: { type: Type.STRING },
            type: { type: Type.STRING, description: "opcion_multiple, completar, o ordenar" },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            rule: { type: Type.STRING }
          },
          required: ["id", "module", "level", "topic", "type", "question", "options", "correctIndex", "explanation", "rule"]
        }
      }
    });

    const exercise = JSON.parse(response.text || "{}");
    res.json(exercise);
  } catch (error: any) {
    console.error("Error al generar ejercicio:", error);
    res.status(500).json({ error: "Error al generar ejercicio personalizado." });
  }
});

// AI Virtual Tutor Chat
app.post("/api/ai/tutor-chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Mensaje requerido" });

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        reply: "¡Hola! Soy tu tutor virtual. Como estás en modo sin conexión o sin API Key configurada, puedo responder dudas básicas. Para consultas dinámicas avanzadas, activa tu conexión e ingresa la API Key."
      });
    }

    const systemInstruction = `Eres "Profesor Gramaticus", un tutor virtual de lingüística, ortografía, redacción y gramática española amable, paciente y entusiasta.
Proporciona explicaciones muy claras, estructuradas con viñetas o negritas, ejemplos concretos y mnemotecnias útiles. Mantén un tono motivador y empático.`;

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: { systemInstruction }
    });

    for (const h of history) {
      if (h.role === "user" || h.role === "model") {
        await chat.sendMessage({ message: h.content });
      }
    }

    const response = await chat.sendMessage({ message });
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error tutor chat:", error);
    res.status(500).json({ error: "Error de comunicación con el tutor virtual." });
  }
});

// AI Text-to-Speech proxy
app.post("/api/ai/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text) return res.status(400).json({ error: "Texto requerido" });

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(501).json({ error: "TTS con IA no disponible offline. Usando voz del navegador." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Lee con pronunciación clara e intonación docente en español: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio, format: "audio/pcm" });
    } else {
      res.status(500).json({ error: "No se generó audio." });
    }
  } catch (error: any) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Error procesando TTS." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

startServer();
