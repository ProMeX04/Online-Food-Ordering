import { Document, Schema, model, Types } from "mongoose"

export interface IDish {
    name: string
    description: string
    price: number
    imageUrl: string
    category: Types.ObjectId
    isAvailable: boolean
    rating: number
    soldCount: number
    isPopular: boolean
    isNewDish: boolean
    isSpecial: boolean
}


export interface IDishDocument extends IDish, Document { }

const dishSchema = new Schema<IDishDocument>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
        },
        soldCount: {
            type: Number,
            required: true,
            default: 0,
        },
        isPopular: {
            type: Boolean,
            default: false,
        },
        isNewDish: {
            type: Boolean,
            default: false,
        },
        isSpecial: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
)

export default model<IDishDocument>("Dish", dishSchema)
