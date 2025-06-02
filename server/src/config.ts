import dotenv from "dotenv"
dotenv.config()

export const DOMAIN = process.env.DOMAIN || "localhost:3000"
export const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN || "localhost:5173"
export const API_PREFIX = process.env.API_PREFIX || "/api"
export const BACKEND_URL = `http://${DOMAIN}${API_PREFIX}`
export const FRONTEND_URL = `http://${FRONTEND_DOMAIN}`

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
export const JWT_EXPIRE = Number(process.env.JWT_EXPIRE) || 3600
export const JWT_REFRESH_EXPIRE = Number(process.env.JWT_REFRESH_EXPIRE) || 604800

export const MONGO_URI = process.env.MONGO_URI || null
export const REDIS_HOST = process.env.REDIS_HOST || "localhost"
export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379

export const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || "http://localhost:9200"
export const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME
export const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD
export const AUTO_SYNC_ELASTICSEARCH = process.env.AUTO_SYNC_ELASTICSEARCH || "false"
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME || ""
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || ""

export const VERIFICATION_TOKEN_EXPIRE = Number(process.env.VERIFICATION_TOKEN_EXPIRE) || 24 * 60 * 60
export const RESET_PASSWORD_EXPIRE = Number(process.env.RESET_PASSWORD_EXPIRE) || 10 * 60
export const BLACKLIST_TOKEN_EXPIRE = Number(process.env.BLACKLIST_TOKEN_EXPIRE) || 7 * 24 * 60 * 60

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
export const MODEL = process.env.MODEL || "gemini-2.0-flash"

export const PORT = Number(process.env.PORT) || 3000