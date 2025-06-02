import Redis from "ioredis"
import { REDIS_PORT, REDIS_HOST } from "../config"

const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
})

redis.on("connect", () => {
    console.log(`✅ Redis connected: ${redis.options.host}:${redis.options.port}`)
})

redis.on("error", (err) => {
    console.error(err)
})

export const MESSAGE_STREAM_KEY = "message_stream";



export default redis
