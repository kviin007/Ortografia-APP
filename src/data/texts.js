// texts.js - Reading Comprehension Library & Speed Typing Texts

export const TEXTS_DATABASE = [
  {
    id: "text_1",
    title: "El Poder de la Lectura Profunda en la Era Digital",
    level: "Intermedio",
    author: "Dra. María Elena Ramos",
    words: 185,
    category: "Ensayo Lingüístico",
    content: `En un mundo dominado por el consumo acelerado de fragmentos de información, la práctica de la lectura profunda se ha convertido en un auténtico superpoder cognitivo. Leer de manera atenta y pausada no solo nos permite comprender las palabras impresas, sino que activa redes neuronales complejas responsables del pensamiento crítico, la empatía y la memoria a largo plazo.

Cuando nos sumergimos en un texto extenso y bien estructurado, el cerebro ejercita la capacidad de sostener la atención de manera prolongada. Este hábito fortalece la estructura de nuestras oraciones al escribir y enriquece significativamente nuestro vocabulario. Por el contrario, la sobreexposición a textos breves e inconexos tiende a fragmentar nuestro foco y empobrecer la precisión del lenguaje. Por ello, reservar 20 minutos diarios para leer obras de calidad es una inversión invaluable para nuestra mente.`,
    questions: [
      {
        question: "¿Cuál es la idea principal del texto?",
        options: [
          "La lectura acelerada es la mejor forma de informarse hoy en día.",
          "La lectura profunda fortalece el pensamiento crítico, la atención y el lenguaje.",
          "Los textos breves son más efectivos para enriquecer el vocabulario.",
          "El cerebro no necesita ejercitarse mediante la lectura."
        ],
        correctIndex: 1,
        explanation: "El texto enfatiza que la lectura profunda activa redes neuronales clave y mejora el pensamiento crítico y la atención."
      },
      {
        question: "Según el texto, ¿qué consecuencia tiene el consumo excesivo de textos breves?",
        options: [
          "Mejora la velocidad de lectura en un 50%.",
          "Aumenta la capacidad de empatía.",
          "Tiende a fragmentar el foco y empobrecer la precisión lingüística.",
          "Garantiza un vocabulario más amplio."
        ],
        correctIndex: 2,
        explanation: "En el segundo párrafo se indica que textos breves e inconexos pueden fragmentar la atención y reducir la precisión verbal."
      }
    ]
  },
  {
    id: "text_2",
    title: "La Evolución Histórica de la Ortografía Española",
    level: "Avanzado",
    author: "Prof. Alejandro Valdés",
    words: 210,
    category: "Historia del Lenguaje",
    content: `La ortografía de la lengua española no es un conjunto estático de reglas caprichosas, sino el resultado de un largo proceso de evolución histórica y simplificación racional. Durante la Edad Media, la escritura en castellano reflejaba la pronunciación de los copistas y abundaba en vacilaciones entre letras como la B y V, o la C, Ç, Z y X.

Fue con la fundación de la Real Academia Española en 1713 y la publicación de su primer Tratado de Orthographia en 1741 cuando se fijaron los criterios fonológicos y etimológicos que rigen nuestro idioma. A diferencia de lenguas como el inglés o el francés, donde la grafía dista notablemente de la pronunciación, el español se caracteriza por una notable transparencia fonémica, lo que significa que a casi cada sonido le corresponde una letra determinada. Entender este principio facilita enormemente el aprendizaje y disfrute de la escritura correcta.`,
    questions: [
      {
        question: "¿Qué hito histórico fijó los criterios ortográficos del español en el siglo XVIII?",
        options: [
          "La invención de la imprenta.",
          "La publicación del primer Tratado de Orthographia por la RAE en 1741.",
          "Las primeras obras copistas medievales.",
          "La reforma ortográfica de 1999."
        ],
        correctIndex: 1,
        explanation: "El texto señala expresamente la RAE y su tratado de 1741 como momento clave de unificación ortográfica."
      }
    ]
  }
];
