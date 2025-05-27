import { IUser } from "@model/user.model";
import User from "@model/user.model";

export default class UserService {
    static async createUser(user: IUser) {
        const newUser = new User(user);
        await newUser.save();
        return newUser;
    }

    static async findUserByEmail(email: string) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    static async findUserById(id: string) {
        const user = await User.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    static async updateUser(id: string, user: IUser) {
        const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
        if (!updatedUser) {
            throw new Error("User not found");
        }
        return updatedUser;
    }

    static async deleteUser(id: string) {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            throw new Error("User not found");
        }
        return deletedUser;
    }

    static async findAllUsers(query: any) {
        const { page = 1, limit = 10, sort = { createdAt: -1 } } = query
        const skip = (page - 1) * limit
        const users = await User.find().sort(sort).skip(skip).limit(limit)
        const total = await User.countDocuments()
        const totalPages = Math.ceil(total / limit)
        return { users, limit, page, total, totalPages }
    }
}

