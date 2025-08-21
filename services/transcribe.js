import "dotenv/config";
import { AssemblyAI } from 'assemblyai';

const API_KEY = process.env.ASSEMBLYAI_API_KEY;

const client = new AssemblyAI({
  apiKey: API_KEY,
});

export async function transcriptionClip(filePath) {
  try {
    const params = {
      audio: filePath,
      speech_model: "universal",
      language_code: "pt",
      auto_chapters: false,
      punctuate: true,
      format_text: true,
    }

    const transcript = await client.transcripts.transcribe(params);
    
    console.log("Transcrição iniciada. ID da transcrição:", transcript.id);
    console.log("Texto transcrito:", transcript.text);

    return transcript;
  } catch (error) {
    console.error("Erro na transcrição:", error);
    throw error;
  }
}
