import redis from "@/config/redis";
import Message, { MessageRole } from "@/model/message.model";
import { Types } from "mongoose";


export const MESSAGE_STREAM_KEY = "message_stream";
export const MESSAGE_GROUP_NAME = "message_group";
export default class MessageService {
    static async createMessage(userId: Types.ObjectId, content: string, role: MessageRole) {
        const newMessage = await Message.create({ userId, content, role });
        return newMessage;
    }

    static async getMessagesByUserId(userId: Types.ObjectId) {
        const messages = await Message.find({ userId }).sort({ createdAt: -1 }).lean();
        return messages;
    }

    static addMessageToStream = async (streamKey: string, message: Record<string, any>): Promise<string | null> => {
        const result = await redis.xadd(streamKey, "*", ...Object.entries(message).flat());
        return result;
    }
}