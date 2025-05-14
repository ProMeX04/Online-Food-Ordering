import { NextFunction } from "express";
import { Request, Response } from "express";
import UserProfileService from "@/services/user-profile.service";
import { sendError, sendSuccess } from "@/utils/responseUtils";
import { getFullImageUrl } from "@/utils/imageUtils";

export default class UserProfileController {
    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userProfile = await UserProfileService.findProfile(req.user?._id as string)

            if (userProfile.imageUrl) {
                userProfile.imageUrl = getFullImageUrl(userProfile.imageUrl);
            }

            sendSuccess(res, userProfile)
        } catch (err: any) {
            sendError(res, "Get user profile failed", 500)
        }
    }

    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const profileData = req.body
            const updatedProfile = await UserProfileService.update(req.user?.id, profileData)

            if (updatedProfile.imageUrl) {
                updatedProfile.imageUrl = getFullImageUrl(updatedProfile.imageUrl);
            }

            sendSuccess(
                res,
                updatedProfile,
                "Cập nhật thông tin thành công"
            )
        } catch (err: any) {
            sendError(res, "Update user profile failed", 500)
        }
    }


    static async deleteProfile(req: Request, res: Response): Promise<void> {
        try {
            await UserProfileService.delete(req.user?.id)
            sendSuccess(res, {
                success: true,
                message: "Xóa thông tin thành công"
            })
        } catch (err: any) {
            sendError(res, "Delete user profile failed", 500)
        }
    }

    static async addAddress(req: Request, res: Response): Promise<void> {
        try {
            const updatedProfile = await UserProfileService.addAddress(req.user?.id, req.body)
            sendSuccess(res, updatedProfile, "Add address successfully", 200)
        } catch (err: any) {
            sendError(res, "Add address failed", 500)
        }
    }

    static async updateAddress(req: Request, res: Response): Promise<void> {
        try {
            const addressIndex = parseInt(req.params.addressId)
            if (isNaN(addressIndex)) {
                throw new Error("Index địa chỉ không hợp lệ")
            }
            const updatedProfile = await UserProfileService.updateAddress(req.user?.id, addressIndex, req.body)
            sendSuccess(res, updatedProfile, "Update address successfully", 200)
        } catch (err: any) {
            sendError(res, "Update address failed", 500)
        }
    }

    static async deleteAddress(req: Request, res: Response): Promise<void> {
        try {
            const addressIndex = parseInt(req.params.addressId)
            if (isNaN(addressIndex)) {
                throw new Error("Index địa chỉ không hợp lệ")
            }
            const updatedProfile = await UserProfileService.deleteAddress(req.user?.id, addressIndex)
            sendSuccess(res, updatedProfile, "Delete address successfully", 200)
        } catch (err: any) {
            sendError(res, "Delete address failed", 500)
        }
    }

    static async setDefaultAddress(req: Request, res: Response): Promise<void> {
        try {
            const addressIndex = parseInt(req.params.addressId)
            if (isNaN(addressIndex)) {
                throw new Error("Index địa chỉ không hợp lệ")
            }
            const updatedProfile = await UserProfileService.setDefaultAddress(req.user?.id, addressIndex)
            sendSuccess(res, updatedProfile, "Set default address successfully", 200)
        } catch (err: any) {
            sendError(res, "Set default address failed", 500)
        }
    }

    static async updateProfileImage(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                sendError(res, "No image file provided", 400)
                return
            }

            const imageUrl = req.file.path

            const updatedProfile = await UserProfileService.updateImage(req.user?.id, imageUrl)

            const fullImageUrl = getFullImageUrl(updatedProfile.imageUrl);

            sendSuccess(
                res,
                { imageUrl: fullImageUrl },
                "Cập nhật ảnh đại diện thành công"
            )
        } catch (err: any) {
            sendError(res, "Update profile image failed", 500)
        }
    }
}
