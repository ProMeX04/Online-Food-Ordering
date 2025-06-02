import { Request, Response } from "express";
import { sendAIResponse, sendError } from "@/utils/responseUtils";
import { Agent } from "@/services/agent.service";

export default class ChatController {
    static async chatWithAI(req: Request, res: Response): Promise<void> {
        try {
            const aiQuery = req.query.aiQuery as string
            const { text, functionResponses } = await Agent.listenUserMessage(req.user, aiQuery)
            sendAIResponse(res, text, functionResponses)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }
}