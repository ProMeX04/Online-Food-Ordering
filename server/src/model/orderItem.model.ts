import { Schema, Types } from "mongoose";

export interface IOrderItem {
    dishId: Types.ObjectId
    quantity: number
    price: number
}


export const orderItemSchema = new Schema({
    dishId: { type: Schema.Types.ObjectId, ref: "Dish", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
})