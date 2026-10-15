import { Router } from "express";
import { chatWithGemini } from "../controllers/geminiController.js";

const router = Router();

router.post("/", chatWithGemini);

export default router;
