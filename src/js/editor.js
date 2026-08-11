// editor.js - Smart Word-Style Text Editor & Readability Analysis Engine

export class SmartEditor {
  static getMetrics(text) {
    if (!text || !text.trim()) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMinutes: 0,
        fleschScore: 100,
        readabilityLabel: "Excelente"
      };
    }

    const clean = text.trim();
    const wordsArr = clean.split(/\s+/).filter(Boolean);
    const words = wordsArr.length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s+/g, "").length;
    const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
    const paragraphs = clean.split(/\n+/).filter(p => p.trim().length > 0).length || 1;

    // Estimated Reading Time (~200 words/min)
    const readingTimeMinutes = Math.ceil(words / 200);

    // Flesch-Szigriszt Index for Spanish: 206.84 - (1.02 * words/sentences) - (0.60 * syllables/words)
    // Syllables estimation in Spanish (~2.1 syllables/word on average)
    const avgWordsPerSentence = words / sentences;
    const estimatedSyllables = words * 2.1;
    const avgSyllablesPerWord = estimatedSyllables / words;

    const fleschScore = Math.round(206.84 - (1.02 * avgWordsPerSentence) - (60 * avgSyllablesPerWord));

    let readabilityLabel = "Muy Fácil";
    if (fleschScore < 40) readabilityLabel = "Muy Difícil (Académico)";
    else if (fleschScore < 60) readabilityLabel = "Algo Difícil";
    else if (fleschScore < 75) readabilityLabel = "Estándar / Normal";
    else if (fleschScore < 85) readabilityLabel = "Fácil";

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      fleschScore,
      readabilityLabel
    };
  }
}
