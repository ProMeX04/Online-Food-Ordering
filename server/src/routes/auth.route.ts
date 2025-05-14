import { Router } from "express"
import AuthController from "@controllers/auth.controller"
import { authenticate } from "@middlewares/auth.middleware"

const router = Router()

router.post("/register", AuthController.register)
router.post("/login", AuthController.login)
router.post("/logout", AuthController.logout)
router.post("/refresh-token", AuthController.refreshToken)
router.post("/forgot-password", AuthController.forgotPassword)
router.post("/reset-password", authenticate, AuthController.resetPassword)
router.post("/change-password", authenticate, AuthController.changePassword)
router.post("/verify-email", AuthController.verifyEmail)
router.post("/resend-verification", AuthController.resendVerificationEmail)
router.get("/me", authenticate, AuthController.getCurrentUser)

export default router
