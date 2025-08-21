import db from "../db.js";

export async function getClipsController(req, res) {
  try {
    const clips = await db.all(
      "SELECT id, original_url, file_path, transcript, created_at, expires_at FROM clips WHERE expires_at > datetime('now') ORDER BY created_at DESC"
    );

    const formattedClips = clips.map(c => ({
      id: c.id,
      url: c.original_url,
      transcript: (() => {
        try {
          return JSON.parse(c.transcript);
        } catch {
          return c.transcript;
        }
      })(),
      createdAt: c.created_at,
      expiresAt: c.expires_at,
      clips: (() => {
        try {
          return JSON.parse(c.file_path);
        } catch {
          return [];
        }
      })()
    }));

    res.json(formattedClips);
  } catch (error) {
    console.error("Erro ao buscar clipes:", error);
    res.status(500).json({ error: "Erro ao buscar clipes" });
  }
}