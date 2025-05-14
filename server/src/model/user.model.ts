import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { Role } from "@shared/enum";

export interface IUser {
    username: string;
    email: string;
    password: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser, mongoose.Document {
    comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique    : true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    isActive: { type: Boolean, default: true },
});


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUserDocument>("User", userSchema);
