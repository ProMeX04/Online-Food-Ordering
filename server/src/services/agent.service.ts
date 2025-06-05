
import { Chat, FunctionCall, FunctionCallingConfigMode, GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, MODEL } from "@/config";
import { IUserDocument } from "@/model/user.model";
import tools from "../tools/declarations";
import listFunction from "../tools/list-function";
import { MESSAGE_STREAM_KEY } from "@/services/message.service";
import { MessageRole } from "@/model/message.model";
import MessageService from "@/services/message.service";
import User from "@/model/user.model";
import UserProfile from "@/model/user-profile.model";
import Category from "@/model/category.model";
import Dish from "@/model/dish.model";

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
    static SESSION_MAX_INACTIVE_TIME_MS = 1000 * 60 * 60
    static SESSIONS_CLEANUP_INTERVAL_MS = 1000 * 60 * 10

    static agentSessionMap = new Map<string, AgentSessionEntry>()

    static cleanupInactiveSessions = () => {
        const now = Date.now()
        this.agentSessionMap.forEach((sessionEntry, userId) => {
            if (now - sessionEntry.lastAccessed > this.SESSION_MAX_INACTIVE_TIME_MS) {
                this.updateUserInfo(userId, sessionEntry.chat)
                this.agentSessionMap.delete(userId)
            }
        })
    }

    static updateUserInfo = async (userId: string, agentSession: Chat) => {
        const user = await User.findById(userId)
        const response = await agentSession.sendMessage({ message: `Tôi cần bạn tóm tắt thông tin cá nhân và sở thích của tôi trong đoạn chat này và trả lời ngắn gọn nhất có thể nhưng không được bỏ xót thông tin nào (Trả lời dạng: Tên: <Tên>, Tuổi: <Tuổi>, Giới tính: <Giới tính>, Địa chỉ: <Địa chỉ>, Sở thích: <Sở thích>, ... ) nếu không có thông tin nào thì không trả lời` })
        await UserProfile.updateOne({ user: user?._id }, { $set: { info: response.text } })
    }

    static initializeCleanUpInterval = () => {
        setInterval(() => {
            this.cleanupInactiveSessions()
        }, this.SESSIONS_CLEANUP_INTERVAL_MS)
    }

    static gemini = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
    })

    static getOrCreateAgentSession = async (user: IUserDocument): Promise<Chat> => {
        const userId = user?.id
        const sessionEntry = this.agentSessionMap.get(userId)

        if (sessionEntry) {
            return sessionEntry.chat
        }

        const systemInstruction = await this.systemInstruction(user)

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
                systemInstruction: systemInstruction,
                maxOutputTokens: 1000,
                topP: 0.5,
                toolConfig: {
                    functionCallingConfig: {
                        mode: FunctionCallingConfigMode.AUTO,
                    },
                },
            },
        })

        this.agentSessionMap.set(userId, {
            chat: newAgentSession,
            lastAccessed: Date.now(),
        })

        return newAgentSession
    }

    private static systemInstruction = async (user: IUserDocument) => {
        const categories = await Category.find({}).select(["_id", "name"])
        const dishes = await Dish.find({}).select(["_id", "√name", "description", "price"])   
        const profile = await UserProfile.findOne({ user: user.id })
        return `Bạn là nhân viên bán món ăn của cửa hàng Việt Food đang trò chuyện với ${profile?.fullName} có thông tin cá nhân như sau: ${profile?.info}.Của Hàng mình có các danh mục sau: ${categories}. Và các món: ${dishes}Hãy trả lời vui vẻ, thân thiện, kèm theo các emoji. hãy nói chuyện sao cho khách hàng dễ mua món ăn. Với mọi yêu cầu tìm kiếm bắt buộc phải dùng công cụ mới hiển thị giao diện cho người dùng thấy được, nếu bạn ko dùng công cụ khách hàng sẽ không thấy món ăn`
    }

    static listenUserMessage = async (user: IUserDocument, message: string) => {
        const agentSession = await this.getOrCreateAgentSession(user)

        await MessageService.addMessageToStream(MESSAGE_STREAM_KEY, {
            userId: user._id,
            content: message,
            role: MessageRole.USER,
        })
        let lastFunctionResponse = null

        let response = await agentSession.sendMessage({
            message: message,
        })
        let functionResponses: FunctionResponse[] = []
        while (response.functionCalls) {
            functionResponses = await this.getAllFunctionResponse(user, response.functionCalls)
            lastFunctionResponse = functionResponses
            response = await agentSession.sendMessage({
                message: functionResponses.map((fr) => ({
                    role: 'user',
                    functionResponse: {
                        name: fr.name,
                        response: {
                            output: fr,
                        },
                    },
                    toolConfig: {
                        functionCallingConfig: {
                            mode: fr.responseType === 'dishes' && fr.response.length > 0 ? FunctionCallingConfigMode.AUTO : FunctionCallingConfigMode.ANY,
                        },
                    },
                })),
                
            })
            console.log(response.functionCalls, response.text)
        }
        await MessageService.addMessageToStream(MESSAGE_STREAM_KEY, {
            userId: user._id,
            content: response.text || '',
            role: MessageRole.ASSISTANT,
        })

        return {
            text: response.text || '',
            functionResponses: lastFunctionResponse || [],
        }
    }

    static getAllFunctionResponse = async (user: IUserDocument, functionCalls: FunctionCall[]) => {
        return await Promise.all(
            functionCalls.map(async (functionCall) => {
                const functionResponse = await listFunction[functionCall.name as keyof typeof listFunction]({ userId: user.id, ...functionCall.args })
                return {
                    message: functionResponse.message,
                    name: functionCall.name || 'unknown',
                    response: functionResponse.response,
                    responseType: functionResponse.responseType,
                }
            }),
        )
    }
}

Agent.initializeCleanUpInterval()