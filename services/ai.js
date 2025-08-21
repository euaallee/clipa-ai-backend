/**
 * Gera cortes automáticos a partir das palavras da transcrição.
 * @param {*} transcript Transcrição AssemblyAI
 * @param {number[]} clipSizes Tamanhos de clipes em segundos (ex: [30, 60, 120])
 */

export function suggestClips(transcript, clipSizes = [30, 60, 120]) {
  if (!transcript.words || transcript.words.length === 0) {
    return [];
  }

  const clips = [];

  for (const size of clipSizes) {
    const sizeMs = size * 1000; // Convertendo para milissegundos

    let start = transcript.words[0].start;
    let last = start;

    for (const word of transcript.words) {
      last = word.end;

      if (last - start >= sizeMs) {
        const clipWords = transcript.words.filter((w) => w.start >= start && w.end <= last);

        const text = clipWords.map((w) => w.text).join(" ");

        clips.push({
          type: `${size}s`,
          start: (start / 1000).toFixed(2),
          end: (last  / 1000).toFixed(2),
          duration: ((last - start) / 1000).toFixed(2),
          text
        });

        start = word.start;
      }
    }
  }

  return clips;
}

