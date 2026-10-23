import { Router } from "express";
import { chatWithGemini } from "../controllers/geminiController.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

const router = Router();

router.post("/", authenticateUser, chatWithGemini);

export default router;
