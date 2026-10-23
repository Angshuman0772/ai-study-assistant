import { Router } from "express";
import { authenticateUser } from "../middleware/authenticateUser.js";
import { processDocumentHandler } from "../controllers/documentController.js";

const router = Router();

router.post("/:id/process", authenticateUser, processDocumentHandler);

export default router;
