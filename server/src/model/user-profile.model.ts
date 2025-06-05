import mongoose, { Types } from "mongoose";
import { AddressSchema, IAddress } from "./address.model";
import { Gender } from "@shared/enum";


export interface IUserProfile {
    user: Types.ObjectId
    fullName: string
    imageUrl: string
    phone: string
    address: IAddress[]
    dob: Date
    gender: Gender
    bio?: string
    info?: string
}

export interface IUserProfileDocument extends IUserProfile, mongoose.Document { }


const UserProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: [AddressSchema], default: [] },
    dob: { type: Date, default: null },
    gender: { type: String, enum: Object.values(Gender), default: Gender.MALE },
    bio: { type: String, default: "" },
    info: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model<IUserProfileDocument>("UserProfile", UserProfileSchema);