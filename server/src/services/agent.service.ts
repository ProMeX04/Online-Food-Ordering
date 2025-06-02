
import { Chat, FunctionCall, FunctionCallingConfigMode, GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, MODEL } from "@/config";
import { IUserDocument } from "@/model/user.model";
import tools from "../tools/declarations";
import listFunction from "../tools/list-function";
import { MESSAGE_STREAM_KEY } from "@/services/message.service";
import { MessageRole } from "@/model/message.model";
import MessageService from "@/services/message.service";

interface AgentSessionEntry {
    chat: Chat;
    lastAccessed: number;
}

export type FunctionResponse = {
    message: string;
    name: string;
    response: any;
    responseType: string;
}

export class Agent {
    static SESSION_MAX_INACTIVE_TIME_MS = 1000 * 60 * 60;
    static SESSIONS_CLEANUP_INTERVAL_MS = 1000 * 60 * 10;

    static agentSessionMap = new Map<string, AgentSessionEntry>();

    static cleanupInactiveSessions = () => {
        const now = Date.now();
        this.agentSessionMap.forEach((sessionEntry, userId) => {
            if (now - sessionEntry.lastAccessed > this.SESSION_MAX_INACTIVE_TIME_MS) {
                this.agentSessionMap.delete(userId)
                console.log(`[Agent] Cleaned up inactive session for user: ${userId}`);
            }
        })
    }

    static initializeCleanUpInterval = () => {
        setInterval(() => {
            this.cleanupInactiveSessions()
        }, this.SESSIONS_CLEANUP_INTERVAL_MS)
    }

    static gemini = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
    })


    private static systemInstruction = (user: IUserDocument) => `Bạn là nhân viên bán món ăn của cửa hàng Việt Food đang trò chuyện với ${user?.username}. Hãy trả lời vui vẻ, thân thiện, kèm theo các emoji. hãy nói chuyện sao cho khách hàng dễ mua món ăn. Nên nhớ bạn chắc chắn làm được mọi yêu cầu liên quan đến tìm kiếm món ăn, hãy dùng các công cụ để lấy thông tin món ăn sau đó trả lời cho khách hàng Phía dưới bạn đã hiển thị món ăn nên bạn chỉ cần tóm tắt, nếu không có công cụ nào thì suy nghĩ xem có thể kết hợp các công cụ hiện có để hoàn thành nhiệm vụ được không `

    static getOrCreateAgentSession = (user: IUserDocument): Chat => {
        const userId = user?.id;
        const sessionEntry = this.agentSessionMap.get(userId);

        if (sessionEntry) {
            return sessionEntry.chat;
        }

        const newAgentSession: Chat = this.gemini.chats.create({
            model: MODEL,
            config: {
                thinkingConfig: {
                    includeThoughts: true,
                    thinkingBudget: 300,
                },
                httpOptions: {
                    timeout: 50000,
                },
                tools,
                responseMimeType: 'text/plain',
                systemInstruction: this.systemInstruction(user),
                maxOutputTokens: 1000,
                topP: 0.5,
                toolConfig: {
                    functionCallingConfig: {
                        mode: FunctionCallingConfigMode.AUTO,
                    }
                },

            },
        });

        this.agentSessionMap.set(userId, {
            chat: newAgentSession,
            lastAccessed: Date.now()
        });

        return newAgentSession;
    }




    static listenUserMessage = async (user: IUserDocument, message: string) => {
        const agentSession = this.getOrCreateAgentSession(user);

        await MessageService.addMessageToStream(MESSAGE_STREAM_KEY, {
            userId: user._id,
            content: message,
            role: MessageRole.USER,
        });
        let lastFunctionResponse = null;

        let response = await agentSession.sendMessage({
            message: message,
        });
        console.log(response.functionCalls, response.text)

        let functionResponses: FunctionResponse[] = [];
        while (response.functionCalls) {
            functionResponses = await this.getAllFunctionResponse(user, response.functionCalls);
            lastFunctionResponse = functionResponses
            response = await agentSession.sendMessage({
                message: functionResponses.map(fr => ({
                    role: 'user',
                    functionResponse: {
                        name: fr.name,
                        response: {
                            output: fr,
                        }
                    }
                })),
            })
        }

        await MessageService.addMessageToStream(MESSAGE_STREAM_KEY, {
            userId: user._id,
            content: response.text || "",
            role: MessageRole.ASSISTANT,
        });


        return {
            text: response.text || "",
            functionResponses: lastFunctionResponse || []
        };
    }

    static getAllFunctionResponse = async (user: IUserDocument, functionCalls: FunctionCall[]) => {
        return await Promise.all(functionCalls.map(async (functionCall) => {
            const functionResponse = await listFunction[functionCall.name as keyof typeof listFunction]({ userId: user.id, ...functionCall.args });
            return {
                message: functionResponse.message,
                name: functionCall.name || 'unknown',
                response: functionResponse.response,
                responseType: functionResponse.responseType
            };
        }));
    }
}

Agent.initializeCleanUpInterval()