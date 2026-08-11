// exercises.js - Rich Collection of Exercises and Mini-games

export const EXERCISES_DATABASE = {
  ortografia: [
    {
      id: "ort_ex_1",
      module: "ortografia",
      level: "Principiante",
      topic: "Uso de B y V",
      type: "opcion_multiple",
      question: "Selecciona la palabra correctamente escrita:",
      options: ["Absolver", "Apsolver", "Avsolver", "Absolverr"],
      correctIndex: 0,
      explanation: "Se escribe con 'b' las palabras que comienzan con el prefijo 'ab-' o 'abs-'.",
      rule: "Prefijos ab-, abs-, ob-, sub- siempre se escriben con B."
    },
    {
      id: "ort_ex_2",
      module: "ortografia",
      level: "Intermedio",
      topic: "Tildes Agudas, Graves y Esdrújulas",
      type: "opcion_multiple",
      question: "¿Cuál de las siguientes palabras es esdrújula y lleva tilde?",
      options: ["Camión", "Lápiz", "Sílaba", "Cantar"],
      correctIndex: 2,
      explanation: "'Sílaba' es una palabra esdrújula porque su sílaba tónica es la antepenúltima, y TODAS las esdrújulas se tildan.",
      rule: "Las palabras esdrújulas llevan tilde siempre sin excepción."
    },
    {
      id: "ort_ex_3",
      module: "ortografia",
      level: "Avanzado",
      topic: "Tilde Diacrítica",
      type: "completar",
      question: "Completa la oración: '___ no quiso venir a ___ casa porque estaba cansado.'",
      options: ["Él / mi", "El / mí", "Él / mí", "El / mi"],
      correctIndex: 0,
      explanation: "'Él' lleva tilde por ser pronombre personal. 'Mi' no lleva tilde por ser adjetivo posesivo.",
      rule: "Él (pronombre personal) vs El (artículo determinativo)."
    },
    {
      id: "ort_ex_4",
      module: "ortografia",
      level: "Básico",
      topic: "Uso de C, S y Z",
      type: "opcion_multiple",
      question: "Elige la forma correcta en plural de la palabra 'Luz':",
      options: ["Luses", "Luces", "Luzes", "Lusses"],
      correctIndex: 1,
      explanation: "Las palabras terminadas en Z cambian a C al formar el plural en -ces (luz -> luces, pez -> peces).",
      rule: "La Z final cambia a C antes de E o I."
    }
  ],
  gramatica: [
    {
      id: "gram_ex_1",
      module: "gramatica",
      level: "Intermedio",
      topic: "Concordancia Verbal",
      type: "opcion_multiple",
      question: "Elige la oración que respeta la concordancia de sujeto y verbo:",
      options: [
        "El grupo de estudiantes asistieron al seminario.",
        "El grupo de estudiantes asistió al seminario.",
        "El grupo de estudiantes asistirán al seminario.",
        "El grupo de estudiantes asistieron mañana."
      ],
      correctIndex: 1,
      explanation: "El núcleo del sujeto es 'grupo' (singular), por lo que el verbo debe ir en tercera persona del singular: 'asistió'.",
      rule: "Los sustantivos colectivos concuerdan en singular."
    },
    {
      id: "gram_ex_2",
      module: "gramatica",
      level: "Avanzado",
      topic: "Conectores Lógicos",
      type: "arrastrar",
      question: "Relaciona los conectores con su tipo de función discursiva:",
      pairs: [
        { term: "Sin embargo / No obstante", match: "Adversativo (Oposición)" },
        { term: "Por lo tanto / En consecuencia", match: "Consecutivo (Efecto)" },
        { term: "Además / Asimismo", match: "Aditivo (Suma)" },
        { term: "Es decir / En otras palabras", match: "Explicativo (Aclaración)" }
      ]
    }
  ],
  vocabulario: [
    {
      id: "voc_flash_1",
      module: "vocabulario",
      level: "Intermedio",
      topic: "Palabras Cultas",
      type: "flashcards",
      cards: [
        { word: "InEFABLE", definition: "Que no se puede explicar o describir con palabras.", example: "Sintió una alegría inefable al completar su meta." },
        { word: "EFÍMERO", definition: "Que dura muy poco tiempo o es de corta duración.", example: "El resplandor del cometa fue efímero pero deslumbrante." },
        { word: "PERS PICACIA", definition: "Agudeza y rapidez de la mente para comprender cosas complejas.", example: "Su perspicacia le permitió detectar el error al instante." },
        { word: "RESILIENCIA", definition: "Capacidad de adaptarse y superar la adversidad.", example: "Su resiliencia inspiró a todo el equipo educativo." }
      ]
    }
  ],
  memoria: [
    {
      id: "mem_card_1",
      module: "memoria",
      level: "Principiante",
      topic: "Memorama de Conceptos",
      type: "memorama",
      pairs: [
        { id: 1, concept: "Aguda", detail: "Acento en la última sílaba" },
        { id: 2, concept: "Grave", detail: "Acento en la penúltima sílaba" },
        { id: 3, concept: "Esdrújula", detail: "Acento en la antepenúltima sílaba" },
        { id: 4, concept: "Sinónimo", detail: "Palabra con significado similar" },
        { id: 5, concept: "Antónimo", detail: "Palabra con significado opuesto" },
        { id: 6, concept: "Hiato", detail: "Separación de dos vocales contiguas" }
      ]
    }
  ]
};
