import mongoose from "mongoose"
import { MONGO_URI } from "../config"

export const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = MONGO_URI

        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in the environment variables")
        }

        const conn = await mongoose.connect(mongoUri)

        console.log(`✅ MongoDB connected: ${conn.connection.host}:${conn.connection.port}`)
    } catch (error: any) {
        console.error(error)
        process.exit(1)
    }
}
