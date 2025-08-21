import db from "./db.js";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  const CLIPS_DIR = path.resolve("./data/clips");

  // pega todos os arquivos de clipes
  const files = await fs.readdir(CLIPS_DIR);

  // monta objetos no formato esperado
  const generatedClips = files.map(f => ({
    file: f,
    path: `/clips/${f}`, // caminho que o Express serve
    start: 0,
    end: 0,
    duration: 0,
    text: "clip manual"
  }));

  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  await db.run(
    "INSERT INTO clips (id, original_url, file_path, transcript, expires_at) VALUES (?, ?, ?, ?, ?)",
    [
      uuidv4(),                // id
      "manual-test",           // original_url (pode por dummy)
      JSON.stringify(generatedClips), // clipes salvos
      "transcrição não gerada", // transcript fake
      expiresAt
    ]
  );

  console.log("✅ Clipes inseridos manualmente no banco!");
}

seed().then(() => process.exit());
