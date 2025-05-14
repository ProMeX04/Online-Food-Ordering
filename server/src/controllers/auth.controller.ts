import { Request, Response } from "express"
import AuthService from "@services/auth.service"
import { ILoginRequest, IRegisterRequest } from "@shared/types/auth"
import UserProfileService from "@services/user-profile.service"
import { sendSuccess, sendError } from "@utils/responseUtils"
import { getFullImageUrl } from "@utils/imageUtils"



export default class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const loginRequest: ILoginRequest = req.body
            const { accessToken, refreshToken, user } = await AuthService.login(loginRequest)
            sendSuccess(res, { accessToken, refreshToken, user }, "Login successful")
        } catch (err) {
            sendError(res, "Login failed", 401)
        }
    }
    static async register(req: Request, res: Response) {
        try {
            const registerRequest: IRegisterRequest = req.body
            await AuthService.register(registerRequest)
            sendSuccess(res, { success: true }, "Registration successful! Please check your email to verify your account.", 201)
        } catch (err) {
            sendError(res, "Registration failed", 400)
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            await AuthService.logout(req.user?.id)
            sendSuccess(res, { success: true }, "Logged out successfully")
        } catch (err) {
            sendError(res, "Logout failed", 400)
        }
    }

    static async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body
            if (!refreshToken) {
                throw new Error("Refresh token not provided")
            }

            const tokens = await AuthService.refreshToken(refreshToken)
            sendSuccess(res, tokens, "Token refreshed successfully")
        } catch (err) {
            sendError(res, "Token refresh failed", 401)
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body
            await AuthService.forgotPassword(email)
            sendSuccess(res, { success: true }, "Password reset instructions sent to your email")
        } catch (err) {
            sendError(res, "Forgot password failed", 400)
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const { token, newPassword } = req.body
            await AuthService.resetPassword(token, newPassword)
            sendSuccess(res, { success: true }, "Password reset successfully")
        } catch (err) {
            sendError(res, "Reset password failed", 400)
        }
    }

    static async changePassword(req: Request, res: Response) {
        try {
            const { currentPassword, newPassword } = req.body
            await AuthService.changePassword(req.user?.id, currentPassword, newPassword)
            sendSuccess(res, { success: true }, "Password changed successfully")
        } catch (err) {
            sendError(res, "Change password failed", 400)
        }
    }

    static async verifyEmail(req: Request, res: Response) {
        try {
            const { code } = req.body
            if (!code || typeof code !== 'string' || code.length !== 6) {
                throw new Error('Invalid verification code')
            }

            await AuthService.verifyEmailCode(code)
            sendSuccess(res, { success: true }, "Email verification successful")
        } catch (err) {
            sendError(res, "Verify email failed", 400)
        }
    }

    static async resendVerificationEmail(req: Request, res: Response) {
        try {
            const { email } = req.body
            if (!email) {
                throw new Error('Email cannot be empty')
            }

            await AuthService.resendVerificationEmail(email)
            sendSuccess(res, { success: true }, "Verification email sent")
        } catch (err) {
            sendError(res, "Resend verification email failed", 400)
        }
    }

    static async getCurrentUser(req: Request, res: Response) {
        try {
            if (!req.user) {
                throw new Error("User not found")
            }

            const userData: any = {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
                isActive: req.user.isActive
            }

            try {
                const userProfile = await UserProfileService.findProfile(req.user.id)
                if (userProfile) {
                    userData.fullName = userProfile.fullName

                    if (userProfile.imageUrl) {
                        userData.imageUrl = getFullImageUrl(userProfile.imageUrl)
                    }
                }
            } catch (error) {
                console.error("Error fetching profile information:", error)
            }

            sendSuccess(res, userData, "User information retrieved successfully")
        } catch (err) {
            sendError(res, "Get current user failed", 401)
        }
    }
}
