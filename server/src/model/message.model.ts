import { Schema, model, Types, Document } from "mongoose";

export enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant",
}

export interface IMessage {
    userId: Types.ObjectId;
    content: string;
    role: MessageRole;
}

export interface IMessageDocument extends IMessage, Document {}

const messageSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    role: { type: String, enum: MessageRole, required: true },
}, { timestamps: true });

const Message = model("Message", messageSchema);

export default Message;