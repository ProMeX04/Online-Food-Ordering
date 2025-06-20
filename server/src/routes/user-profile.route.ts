import UserController from "@controllers/user.controller"
import UserProfileController from "@controllers/user-profile.controller"
import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { authenticate } from "@/middlewares/auth.middleware"
import { processImage } from '@/middlewares/image-processor.middleware'

const uploadDir = "uploads/profiles/"
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)

        const userId = req.user?.id || 'unknown-user'
        cb(null, `${userId}-${uniqueSuffix}${ext}`)
    }
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error("Chỉ chấp nhận file hình ảnh"))
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

const router = express.Router()

router.get("/profile", authenticate, UserProfileController.getProfile)
router.put("/profile", authenticate, UserProfileController.updateProfile)
router.delete("/profile", authenticate, UserProfileController.deleteProfile)

router.post("/profile/image", authenticate, upload.single('image'), processImage, UserProfileController.updateProfileImage)

router.post("/addresses", authenticate, UserProfileController.addAddress)
router.put("/addresses/:addressIndex", authenticate, UserProfileController.updateAddress)
router.delete("/addresses/:addressIndex", authenticate, UserProfileController.deleteAddress)
router.put("/addresses/:addressIndex/default", authenticate, UserProfileController.setDefaultAddress)



export default router
