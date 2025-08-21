import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import transcribeVideo from "./routes/transcribeVideoRoute.js";
import getClips from "./routes/getClipsRoute.js";

const API_HOST = process.env.API_HOST || "192.168.1.15";
const API_PORT = process.env.API_PORT || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://192.168.1.15:5000';

const app = express();
app.use(cors({origin: CORS_ORIGIN}));
app.use(express.json());
app.use(morgan("dev"));


app.use("/api/transcribe", transcribeVideo);
app.use("/api/list", getClips)

app.use("/clips", express.static(path.resolve("./data/clips")));

app.listen(API_PORT, API_HOST, () => {
  console.log(`🚀 Backend rodando em http://${API_HOST}:${API_PORT}`);
});
