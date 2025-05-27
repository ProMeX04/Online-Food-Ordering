import { Document, Schema, model, Types } from "mongoose"

export enum PaymentStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed",
}

export enum PaymentMethod {
    COD = "cod",
    MOMO = "momo"
}


export interface IPayment {
    userId: Types.ObjectId
    orderId: Types.ObjectId
    amount: number
    paymentMethod: PaymentMethod
    paymentDate: string
    paymentStatus: PaymentStatus
}


export interface IPaymentDocument extends IPayment, Document { }

const paymentSchema = new Schema<IPaymentDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
             
        },
        paymentDate: {
            type: String,
            required: true,
        },
        paymentStatus: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
)

export default model<IPaymentDocument>("Payment", paymentSchema)
