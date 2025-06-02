import redis, { MESSAGE_STREAM_KEY } from '@/config/redis';
import MessageService from './message.service';
import { IMessage, MessageRole } from '@/model/message.model';
import { Types } from 'mongoose';

const GROUP_NAME = 'message_group';
const CONSUMER_NAME = 'message_consumer';

type StreamMessage = [string, string[]];
type StreamEntry = [string, StreamMessage[]];
type XReadGroupResult = StreamEntry[] | null;

export default class MessageWorkerService {
    static async createConsumerGroup() {
        try {
            const streamExists = await redis.exists(MESSAGE_STREAM_KEY);
            if (!streamExists) {
                await redis.xgroup('CREATE', MESSAGE_STREAM_KEY, GROUP_NAME, '0', 'MKSTREAM');
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    private static convertStreamMessageToObject(message: string[] | undefined): IMessage | null {
        if (!message) return null;
        return { 
            userId: new Types.ObjectId(message[1]),
            content: message[3],
            role: message[5] as MessageRole,
        }

    }

    static async processStreamMessages() {
        while (true) {
            try {
                const result = await redis.xreadgroup(
                    'GROUP', GROUP_NAME,
                    CONSUMER_NAME,
                    'COUNT', 1,
                    'BLOCK', 0,
                    'STREAMS', MESSAGE_STREAM_KEY,
                    '>'
                ) as XReadGroupResult;

                const message = this.convertStreamMessageToObject(result?.[0]?.[1]?.[0]?.[1]);
                if (message) {
                    console.log('message', message);
                    await MessageService.createMessage(message.userId, message.content, message.role);
                }
            } catch (error) {
                console.error(error);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    static async start() {
        await this.createConsumerGroup();
        this.processStreamMessages();
    }
} 