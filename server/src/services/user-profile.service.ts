import userProfileModel from "@model/user-profile.model"
import { Types } from "mongoose"
import { IUserProfile } from "@model/user-profile.model"


export default class UserProfileService {
    static async findProfile(userId: string) {
        const userProfile = await userProfileModel.findOne({ user: userId }).populate("user")
        if (!userProfile) throw new Error("Không tìm thấy thông tin người dùng")
        return userProfile
    }

    static async update(userId: string, profileInfo: Partial<IUserProfile>) {
        if (profileInfo.gender && !['Male', 'Female', 'Other'].includes(profileInfo.gender)) {
            throw new Error("Giới tính không hợp lệ. Chọn một trong: Nam, Nữ, Khác")
        }

        const updatedProfile = await userProfileModel.findOneAndUpdate(
            { user: userId },
            { $set: profileInfo },
            { new: true }
        )

        if (!updatedProfile) throw new Error("Không tìm thấy thông tin người dùng")
        return updatedProfile
    }

    static async delete(userId: string) {
        const deletedProfile = await userProfileModel.findOneAndDelete({ user: userId })
        if (!deletedProfile) throw new Error("Không tìm thấy thông tin người dùng")
        return deletedProfile
    }

    static async create(userId: string, profileData: Partial<IUserProfile>) {
        const existingProfile = await userProfileModel.findOne({ user: userId })
        if (existingProfile) {
            throw new Error("Thông tin người dùng đã tồn tại")
        }

        if (profileData.gender && !['Male', 'Female', 'Other'].includes(profileData.gender)) {
            throw new Error("Giới tính không hợp lệ. Chọn một trong: Nam, Nữ, Khác")
        }

        const userProfile = new userProfileModel({
            user: new Types.ObjectId(userId),
            ...profileData
        })

        return await userProfile.save()
    }

    static async addAddress(userId: string, addressData: any) {
        const userProfile = await userProfileModel.findOne({ user: userId })
        if (!userProfile) {
            throw new Error('Không tìm thấy thông tin người dùng')
        }

        if (userProfile.address.length === 0 || addressData.isDefault) {
            addressData.isDefault = true

            userProfile.address.forEach(address => {
                address.isDefault = false
            })
        }

        userProfile.address.push(addressData)
        return await userProfile.save()
    }

    static async updateAddress(userId: string, addressIndex: number, addressData: any) {
        const userProfile = await userProfileModel.findOne({ user: userId })
        if (!userProfile) throw new Error("Không tìm thấy thông tin người dùng")

        if (addressIndex < 0 || addressIndex >= userProfile.address.length) {
            throw new Error("Không tìm thấy địa chỉ")
        }

        const currentAddress = userProfile.address[addressIndex]
        const wasDefault = currentAddress.isDefault

        if (addressData.isDefault) {
            userProfile.address.forEach(addr => {
                addr.isDefault = false
            })
        }

        else if (wasDefault && addressData.isDefault === false && userProfile.address.length === 1) {
            addressData.isDefault = true
        }
        else if (wasDefault && addressData.isDefault === false) {
            const firstOtherAddressIndex = userProfile.address.findIndex(
                (_, idx) => idx !== addressIndex
            )
            if (firstOtherAddressIndex !== -1) {
                userProfile.address[firstOtherAddressIndex].isDefault = true
            }
        }

        userProfile.address[addressIndex] = {
            ...currentAddress,
            ...addressData
        }

        return await userProfile.save()
    }

    static async deleteAddress(userId: string, addressIndex: number) {
        const userProfile = await userProfileModel.findOne({ user: userId })
        if (!userProfile) throw new Error("Không tìm thấy thông tin người dùng")

        if (addressIndex < 0 || addressIndex >= userProfile.address.length) {
            throw new Error("Không tìm thấy địa chỉ")
        }

        const isRemovingDefault = userProfile.address[addressIndex].isDefault

        userProfile.address.splice(addressIndex, 1)

        if (isRemovingDefault && userProfile.address.length > 0) {
            userProfile.address[0].isDefault = true
        }

        return await userProfile.save()
    }

    static async setDefaultAddress(userId: string, addressIndex: number) {
        const userProfile = await userProfileModel.findOne({ user: userId })
        if (!userProfile) throw new Error("Không tìm thấy thông tin người dùng")

        userProfile.address.forEach(addr => {
            addr.isDefault = false
        })

        if (addressIndex < 0 || addressIndex >= userProfile.address.length) {
            throw new Error("Không tìm thấy địa chỉ")
        }

        userProfile.address[addressIndex].isDefault = true
        return await userProfile.save()
    }

    static async updateImage(userId: string, imageUrl: string) {
        if (!imageUrl) {
            throw new Error("URL hình ảnh không hợp lệ")
        }

        const updatedProfile = await userProfileModel.findOneAndUpdate(
            { user: userId },
            { $set: { imageUrl } },
            { new: true }
        )

        if (!updatedProfile) throw new Error("Không tìm thấy thông tin người dùng")
        return updatedProfile
    }
}
