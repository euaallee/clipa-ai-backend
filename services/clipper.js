import fs from "fs-extra";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";

const CLIPS_PATH = path.resolve("./data/clips");
fs.ensureDirSync(CLIPS_PATH);

/**
 * Corta os clipes de acordo com os timestamps
 * @param {string} videoPath caminho do vídeo original
 * @param {Array} clips lista de objetos { start, end, type, text }
 * @returns lista de clipes com caminho do arquivo
 */
export async function generateClips(videoPath, clips) {
  const outputs = [];

  for (const clip of clips) {
    const clipId = uuidv4();
    const clipPath = path.join(CLIPS_PATH, `${clipId}.mp4`);

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(clip.start) // segundos (string ou number)
        .setDuration(clip.end - clip.start)
        .output(clipPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    outputs.push({
      ...clip
    });
  }

  return outputs;
}
