import { Router } from "express";
import ChatController from "@/controllers/agent.controller";
import { authenticate} from "@/middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, ChatController.chatWithAI);

export default router;