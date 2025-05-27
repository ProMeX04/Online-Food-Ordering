import mongoose from "mongoose";

export interface IAddress {
    fullName: string;
    phone: string;
    city: string;
    district: string;
    ward: string;
    street?: string;
    note?: string;
    isDefault: boolean;
    latitude?: number;
    longitude?: number;
}

export interface IAddressDocument extends IAddress, mongoose.Document { }

export const AddressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    street: { type: String },
    note: { type: String },
    isDefault: { type: Boolean, default: false },
    latitude: { type: Number },
    longitude: { type: Number }
}, { _id: false })

export default AddressSchema;
