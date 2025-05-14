import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config"
import User from "@model/user.model"
import { sendError } from "@/utils/responseUtils"

interface TokenPayload {
	id: string
	role: string
	iat: number
	exp: number
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers.authorization?.split(" ")[1]

		if (!token) {
			return sendError(res, "Unauthorized", 401)
		}

		const jwtSecret = JWT_SECRET || "default_secret"
		const decoded = jwt.verify(token, jwtSecret) as TokenPayload

		const user = await User.findById(decoded.id).select("-password")

		if (!user) {
			return sendError(res, "Unauthorized", 401)
		}

		if (!user.isActive) {
			return sendError(res, "Unauthorized", 401)
		}

		req.user = user
		next()
	} catch (error) {
		return sendError(res, "Unauthorized", 401)
	}
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
	if (req.user?.role !== "admin") {
		return sendError(res, "Forbidden", 403)
	}
	next()
}
