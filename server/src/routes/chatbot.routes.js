import { Router } from "express";
import { handleChatMessage } from "../controllers/chatbot.controller.js";

const router = Router();

// POST /api/v1/chatbot/chat - Handle chat messages
router.route("/chat").post(handleChatMessage);

export default router;
