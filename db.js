import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Criar/abrir o banco
const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
});

// Criar tabela se não existir
await db.exec(`
    CREATE TABLE IF NOT EXISTS clips (
        id TEXT PRIMARY KEY,
        original_url TEXT NOT NULL,
        file_path TEXT NOT NULL,
        transcript TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT
    )
`);

export default db;
