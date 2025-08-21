import path from "path";
import db from "../db.js";
import fs from "fs-extra";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";
import youtubedl from "youtube-dl-exec";

import { suggestClips } from "../services/ai.js";
import { generateClips } from "../services/clipper.js";
import { transcriptionClip } from "../services/transcribe.js";

const DATA_DIR = path.resolve("./data");
const VIDEO_PATH = path.join(DATA_DIR, "video");
const AUDIO_PATH = path.join(DATA_DIR, "audio");

fs.ensureDirSync(VIDEO_PATH);
fs.ensureDirSync(AUDIO_PATH);

export async function postVideo(req, res) {
  const { url } = req.body;

  if (!url) return res.status(400).send({ error: "URL é obrigatória" });

  const existingClip = await db.get(
    "SELECT * FROM clips WHERE original_url = ? AND expires_at > datetime('now')",
    [url]
  );

  if (existingClip) {
    return res.json({
      clips: JSON.parse(existingClip.file_path),
      transcript: existingClip.transcript,
    });
  }

  try {
    const videoId = uuidv4();
    const videoPath = path.join(VIDEO_PATH, `${videoId}.mp4`);
    const audioPath = path.join(AUDIO_PATH, `${videoId}.mp3`);

    // 1. Baixar vídeo
    await youtubedl(url, {
      output: videoPath,
      format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4"
    });

    // 2. Extrair áudio
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec("pcm_s16le")
        .format("wav")
        .save(audioPath)
        .on("end", resolve)
        .on("error", err => {
          console.error("FFmpeg erro ao extrair áudio:", err);
          reject(err);
        });
    });

    // 3. Transcrever
    const transcription = await transcriptionClip(audioPath);

    // 4. Sugerir cortes (30, 60, 120s)
    const clips = suggestClips(transcription, [30, 60, 120]);

    // 5. Gerar os clipes em MP4
    const generatedClips = await generateClips(videoPath, clips);

    const publicClips = generatedClips.map(c => ({
      ...c,
      path: `/clips/${path.basename(c.file)}`
    }));

    // 6. Salvar no banco com expiração em 3 dias
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    await db.run(
      "INSERT INTO clips (id, original_url, file_path, transcript, expires_at) VALUES (?, ?, ?, ?, ?)",
      [
        videoId,
        url,
        JSON.stringify(publicClips),
        transcription.text ?? "",
        expiresAt,
      ]
    );

    // 7. Retornar para o usuário
    res.json({ transcription, clips: publicClips });
  } catch (err) {
    console.error("Erro ao processar vídeo:", err);
    res.status(500).send({ error: err.message });
  }
}
