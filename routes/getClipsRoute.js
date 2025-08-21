import db from "../db.js";
import fs from "fs-extra";
import path from "path";
import express from "express";
import { getClipsController } from "../controllers/getClipsController.js";

const router = express.Router();
const CLIPS_DIR = path.resolve("./data/clips");

router.get("/clips", getClipsController);

router.delete("/clips/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const clip = await db.get("SELECT * FROM clips WHERE id = ?", [id]);

        if (!clip) return res.status(404).json({ error: "Clip não encontrado" });

        const filePaths = JSON.parse(clip.file_path);
        for (const fileObj of filePaths) {
            const absolutePath = path.join(CLIPS_DIR, path.basename(fileObj.path));
            await fs.remove(absolutePath);
            console.log(`🗑️ Arquivo deletado: ${absolutePath}`);
        }

        await db.run("DELETE FROM clips WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao deletar clip:", err);
        res.status(500).json({ error: "Erro ao deletar clip" });
    }
});

// Limpeza automática de expirados
setInterval(async () => {
    try {
        const expiredClips = await db.all(
            "SELECT * FROM clips WHERE expires_at <= datetime('now')"
        );

        for (const clip of expiredClips) {
            const filePaths = JSON.parse(clip.file_path);
            for (const fileObj of filePaths) {
                const absolutePath = path.join(CLIPS_DIR, path.basename(fileObj.path));
                await fs.remove(absolutePath);
                console.log(`🗑️ Arquivo deletado: ${absolutePath}`);
            }
            await db.run("DELETE FROM clips WHERE id = ?", [clip.id]);
            console.log(`🗑️ Registro removido: ${clip.id}`);
        }
    } catch (err) {
        console.error("Erro ao limpar clipes expirados:", err);
    }
}, 60 * 60 * 1000);

export default router;
