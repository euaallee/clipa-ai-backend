import express from "express";
import { postVideo } from "../controllers/postVideoController.js";

const router = express.Router();

router.post("/process", postVideo)

export default router;
