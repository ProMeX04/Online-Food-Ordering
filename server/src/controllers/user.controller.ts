import { IUser } from "@model/user.model"
import UserService from "@services/user.service"
import { Request, Response } from "express"
import { sendError, sendSuccess } from "@utils/responseUtils"


export default class UserController {
    static async getListUser(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const listUser: IUser[] | null = await UserService.findAllUsers()
            sendSuccess(res, listUser)
        } catch (err) {
            sendError(res, "Get list user failed", 500)
        }
    }

    static async getProfile(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const user: IUser | null = await UserService.findUserById(
                req.user?.id
            )
            sendSuccess(res, user)
        } catch (err) {
            sendError(res, "Get user profile failed", 500)
        }
    }

    static async getUserDetail(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const user: IUser | null = await UserService.findUserById(
                req.params.id
            )
            sendSuccess(res, user)
        } catch (err) {
            sendError(res, "Get user detail failed", 500)
        }
    }

    static async updateUser(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const user: IUser = req.body    
            const updatedUser = await UserService.updateUser(req.user?.id, user)
            sendSuccess(res, updatedUser)
        } catch (err) {
            sendError(res, "Update user failed", 500)
        }
    }

    static async deleteUser(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const userId = req.params.id
            const deletedUser = await UserService.deleteUser(userId)
            if (!deletedUser) throw new Error("User Not Found")
            sendSuccess(res, deletedUser)
        } catch (err) {
            sendError(res, "Delete user failed", 500)
        }
    }
}
