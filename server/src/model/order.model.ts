import { Schema, model, Types } from "mongoose";
import { IOrderItem, orderItemSchema } from "./orderItem.model";
import { AddressSchema, IAddress } from "./address.model";

export enum OrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}   

export interface IOrder {
    userId: Types.ObjectId
    orderItems: IOrderItem[]
    totalAmount: number
    status: OrderStatus
    createdAt: Date
    updatedAt: Date
    notes?: string
    address: IAddress
}

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    orderItems: { type: [orderItemSchema], required: true },
    notes: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    address: { type: AddressSchema, required: true },
})

export default model("Order", orderSchema)