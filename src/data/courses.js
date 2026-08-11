// courses.js - Educational Modules & Curricula Database

export const MODULES_DATA = [
  {
    id: "caligrafia",
    title: "Caligrafía y Trazo",
    description: "Perfecciona la legibilidad, soltura, trazos de letras, cursiva, cuadrículas y guías de escritura.",
    icon: "pen-tool",
    color: "from-blue-500 to-indigo-600",
    badge: "Escritura",
    levelsUnlocked: ["Principiante", "Básico", "Intermedio", "Avanzado", "Experto", "Maestro"],
    lessons: [
      { id: "cal_1", title: "Trazos Básicos y Guías de Control", type: "theory_practice", duration: "10 min" },
      { id: "cal_2", title: "Letras Minúsculas Curvas (a, c, d, g, o, q)", type: "interactive_canvas", duration: "15 min" },
      { id: "cal_3", title: "Letras Ascendentes y Descendentes (b, f, h, k, l, p, z)", type: "interactive_canvas", duration: "15 min" },
      { id: "cal_4", title: "Palabras en Cursiva y Fluidez", type: "interactive_canvas", duration: "20 min" },
      { id: "cal_5", title: "Generador de Hojas de Práctica Imprimibles", type: "generator", duration: "Libre" }
    ]
  },
  {
    id: "ortografia",
    title: "Ortografía Impecable",
    description: "Domina las reglas de B/V, C/S/Z, G/J, LL/Y, H, tildes agudas/graves/esdrújulas, diéresis y mayúsculas.",
    icon: "check-check",
    color: "from-emerald-500 to-teal-600",
    badge: "Normativa",
    levelsUnlocked: ["Principiante", "Básico", "Intermedio", "Avanzado", "Experto", "Maestro"],
    lessons: [
      { id: "ort_1", title: "Diferencia Práctica B vs V", type: "theory_practice", duration: "12 min" },
      { id: "ort_2", title: "Uso Correcto de C, S y Z", type: "quiz", duration: "15 min" },
      { id: "ort_3", title: "Reglas de Acentuación: Agudas, Graves, Esdrújulas y Sobresdrújulas", type: "quiz", duration: "15 min" },
      { id: "ort_4", title: "Tilde Diacrítica y Enfática (él/el, tú/tu, mí/mi, té/te)", type: "quiz", duration: "15 min" },
      { id: "ort_5", title: "Uso Correcto de la H y Homófonos Frecuentes", type: "drag_drop", duration: "15 min" }
    ]
  },
  {
    id: "gramatica",
    title: "Gramática y Sintaxis",
    description: "Aprende categorías gramaticales, conjugaciones verbales, concordancia y estructura de la oración.",
    icon: "book-open",
    color: "from-purple-500 to-violet-600",
    badge: "Estructura",
    levelsUnlocked: ["Principiante", "Básico", "Intermedio", "Avanzado", "Experto", "Maestro"],
    lessons: [
      { id: "gram_1", title: "Sustantivos, Adjetivos y Determinantes", type: "match", duration: "12 min" },
      { id: "gram_2", title: "Tiempos Verbales y Conjugaciones Complejas", type: "quiz", duration: "18 min" },
      { id: "gram_3", title: "Concordancia de Género, Número y Persona", type: "quiz", duration: "15 min" },
      { id: "gram_4", title: "Sujeto, Predicado y Complementos Verbales", type: "order_sentence", duration: "20 min" }
    ]
  },
  {
    id: "redaccion",
    title: "Redacción y Expresión Escrita",
    description: "Crea párrafos coherentes, ensayos, cartas, correos formales, resúmenes y textos argumentativos.",
    icon: "file-text",
    color: "from-amber-500 to-orange-600",
    badge: "Creación",
    levelsUnlocked: ["Principiante", "Básico", "Intermedio", "Avanzado", "Experto", "Maestro"],
    lessons: [
      { id: "red_1", title: "Estructura del Párrafo e Idea Principal", type: "smart_editor", duration: "15 min" },
      { id: "red_2", title: "Conectores Lógicos Discursivos", type: "drag_drop", duration: "15 min" },
      { id: "red_3", title: "Redacción Formal: Correos y Cartas", type: "smart_editor", duration: "20 min" },
      { id: "red_4", title: "Ensayo Argumentativo con Corrección por IA", type: "smart_editor", duration: "25 min" }
    ]
  },
  {
    id: "comprension",
    title: "Comprensión Lectora",
    description: "Incrementa la velocidad de lectura, identificación de ideas principales, inferencias y análisis crítico.",
    icon: "brain-circuit",
    color: "from-rose-500 to-pink-600",
    badge: "Análisis",
    levelsUnlocked: ["Principiante", "Básico", "Intermedio", "Avanzado", "Experto", "Maestro"],
    lessons: [
      { id: "comp_1", title: "Lectura Analítica e Idea Principal", type: "reading_quiz", duration: "15 min" },
      { id: "comp_2", title: "Inferencias y Significado Implícito", type: "reading_quiz", duration: "18 min" },
      { id: "comp_3", title: "Textos Científicos y Filosóficos", type: "reading_quiz", duration: "20 min" }
    ]
  },
  {
    id: "velocidad",
    title: "Escritura Rápida (Mecanografía)",
    description: "Test de WPM (palabras por minuto), precisión %, mapa de teclado en pantalla y ejercicios de agilidad digital.",
    icon: "keyboard",
    color: "from-cyan-500 to-blue-600",
    badge: "Agilidad",
    levelsUnlocked: ["Principiante", "Básico", "Intermedio", "Avanzado", "Experto", "Maestro"],
    lessons: [
      { id: "vel_1", title: "Posición Base de los Dedos (ASDF - JKLÑ)", type: "typing_test", duration: "10 min" },
      { id: "vel_2", title: "Símbolos y Tildes a Gran Velocidad", type: "typing_test", duration: "15 min" },
      { id: "vel_3", title: "Desafío Contrarreloj de 1 Minuto (WPM Test)", type: "typing_test", duration: "5 min" }
    ]
  },
  {
    id: "vocabulario",
    title: "Vocabulario y Léxico",
    description: "Amplía tu repertorio verbal con sinónimos, antónimos, etimologías, palabras cultas y flashcards.",
    icon: "sparkles",
    color: "from-fuchsia-500 to-purple-600",
    badge: "Léxico",
    levelsUnlocked: ["Principiante", "Básico", "Intermedio", "Avanzado", "Experto", "Maestro"],
    lessons: [
      { id: "voc_1", title: "Flashcards de Palabras Elegantes y Académicas", type: "flashcards", duration: "10 min" },
      { id: "voc_2", title: "Relación de Sinónimos y Antónimos", type: "match", duration: "12 min" },
      { id: "voc_3", title: "Crucigrama de Términos Literarios", type: "crossword", duration: "15 min" }
    ]
  },
  {
    id: "memoria",
    title: "Memoria Verbal y Concentración",
    description: "Ejercita la retención de palabras, memoria secuencial, concentración y sopa de letras.",
    icon: "lightbulb",
    color: "from-yellow-500 to-amber-600",
    badge: "Cognición",
    levelsUnlocked: ["Principiante", "Básico", "Intermedio", "Avanzado", "Experto", "Maestro"],
    lessons: [
      { id: "mem_1", title: "Memorama de Conceptos Gramaticales", type: "memory_game", duration: "10 min" },
      { id: "mem_2", title: "Sopa de Letras Ortográfica", type: "wordsearch", duration: "12 min" },
      { id: "mem_3", title: "Entrenamiento de Retención Secuencial", type: "sequence_memory", duration: "15 min" }
    ]
  }
];
