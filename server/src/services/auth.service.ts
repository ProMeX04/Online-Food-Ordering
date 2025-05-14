import jwt from 'jsonwebtoken'
import User from '@model/user.model'
import { JWT_SECRET, JWT_EXPIRE, JWT_REFRESH_EXPIRE, EMAIL_USERNAME, EMAIL_PASSWORD, VERIFICATION_TOKEN_EXPIRE, RESET_PASSWORD_EXPIRE, BACKEND_URL, FRONTEND_URL } from '../config'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import redis from '@config/redis'
import UserProfileService from '@services/user-profile.service'
import mongoose from 'mongoose'
import { Gender } from '@shared/enum'
import { IRegisterRequest, ILoginRequest } from '@shared/types/auth'


export default class AuthService {
    static isExistUsername = async (username: string): Promise<{ _id: any } | null> => {
        return await User.exists({ username })
    }

    static register = async (user: IRegisterRequest): Promise<void> => {
        const existingUser = await User.findOne({ username: user.username })
        if (existingUser) {
            throw new Error('Username already exists')
        }

        const existingEmail = await User.findOne({ email: user.email })
        if (existingEmail) {
            throw new Error('Email already exists')
        }

        const pendingEmail = await redis.get(`email:${user.email}`)
        if (pendingEmail) {
            throw new Error('This email has already been registered and is pending verification')
        }

        const verificationToken = crypto.randomBytes(20).toString('hex')

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

        const userData = {
            ...user,
            verificationToken,
            verificationCode,
            createdAt: new Date().toISOString(),
        }

        await redis.set(`pending:${verificationToken}`, JSON.stringify(userData), 'EX', VERIFICATION_TOKEN_EXPIRE)

        await redis.set(`email:${user.email}`, verificationToken, 'EX', VERIFICATION_TOKEN_EXPIRE)

        await redis.set(`code:${verificationCode}`, verificationToken, 'EX', VERIFICATION_TOKEN_EXPIRE)

        await AuthService.sendVerificationEmail(user.email, verificationCode)
    }

    static sendVerificationEmail = async (email: string, code: string): Promise<void> => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USERNAME,
                pass: EMAIL_PASSWORD,
            },
        })
        console.log(EMAIL_PASSWORD, EMAIL_USERNAME)

        await transporter.sendMail({
            from: `"Food Shopping" <${EMAIL_USERNAME}>`,
            to: email,
            subject: 'Xác thực email của bạn',
            html: `<!DOCTYPE html>
				<html lang="en">
				<head>
				<meta charset="UTF-8">
				<style>
					body {
					font-family: Arial, sans-serif;
					background-color: #f4f4f4;
					color: #333;
					padding: 20px;
					}
					.container {
					background-color: #fff;
					padding: 30px;
					border-radius: 8px;
					max-width: 600px;
					margin: auto;
					box-shadow: 0 0 10px rgba(0,0,0,0.1);
					}
					h2 {
					color: #2c3e50;
					}
					p {
					font-size: 16px;
					}
					.code {
					font-size: 32px;
					font-weight: bold;
					letter-spacing: 5px;
					color: #28a745;
					margin: 30px 0;
					text-align: center;
					padding: 10px;
					background-color: #f8f9fa;
					border-radius: 5px;
					}
					.footer {
					margin-top: 30px;
					font-size: 12px;
					color: #999;
					text-align: center;
					}
				</style>
				</head>
				<body>
				<div class="container">
					<h2>Xác thực email của bạn</h2>
					<p>Xin chào,</p>
					<p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Food Shopping</strong>.</p>
					<p>Vui lòng sử dụng mã xác thực 6 chữ số sau để hoàn tất đăng ký:</p>
					<div class="code">${code}</div>
					<p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
					<div class="footer">
					© 2025 Food Shopping. All rights reserved.
					</div>
				</div>
				</body>
				</html>
				`,
        })
    }

    static verifyEmailCode = async (code: string): Promise<void> => {
        const token = await redis.get(`code:${code}`)

        if (!token) {
            throw new Error('Mã xác thực không hợp lệ hoặc đã hết hạn')
        }

        await AuthService.verifyEmail(token)

        await redis.del(`code:${code}`)
    }

    static verifyEmail = async (token: string): Promise<void> => {
        const pendingUserData = await redis.get(`pending:${token}`)

        if (!pendingUserData) {
            throw new Error('Token không hợp lệ hoặc đã hết hạn')
        }

        const userData = JSON.parse(pendingUserData)

        const newUser = new User({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'user',
        })

        await newUser.save()

        try {
            await UserProfileService.create(newUser.id, {
                fullName: userData.fullName || userData.username,
                phone: '',
                address: [],
                gender: Gender.OTHER,
                imageUrl: '',
            })
        } catch (error) {
            console.error('Error creating user profile:', error)
        }

        await redis.del(`pending:${token}`)
        await redis.del(`email:${userData.email}`)
    }

    static async login(account: ILoginRequest): Promise<{ accessToken: string; refreshToken: string; user: any }> {
        const { username, password } = account
        const user = await User.findOne({ username })

        if (!user) {
            throw new Error('Username does not exist!')
        }
        if (!(await user.comparePassword(password))) {
            throw new Error('Password is incorrect!')
        }

        const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: Number(JWT_EXPIRE),
        })

        const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: Number(JWT_REFRESH_EXPIRE),
        })

        await redis.set(`refresh_token:${user._id}`, refreshToken, 'EX', Number(JWT_REFRESH_EXPIRE))

        const userData: any = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        }

        try {
            const UserProfile = mongoose.model('UserProfile')
            const profile = await UserProfile.findOne({ user: user._id })
            if (profile) {
                userData.fullName = profile.fullName

                if (profile.imageUrl) {
                    const relativePath = profile.imageUrl
                    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
                        userData.imageUrl = relativePath
                    } else {
                        const path = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath
                        const backendBaseUrl = BACKEND_URL.replace(/\/api$/, '')
                        userData.imageUrl = `${backendBaseUrl}/${path}`
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
        }

        return { accessToken, refreshToken, user: userData }
    }

    static resendVerificationEmail = async (email: string): Promise<void> => {

        const user = await User.findOne({ email })
        if (user) {
            throw new Error('This account has already been verified')
        }
        const existingToken = await redis.get(`email:${email}`)
        if (!existingToken) {
            throw new Error('No user found with this email')
        }
        const pendingUserData = await redis.get(`pending:${existingToken}`)
        if (!pendingUserData) {
            await redis.del(`email:${email}`)
            throw new Error('Registration information is invalid or has expired')
        }
        const userData = JSON.parse(pendingUserData)
        const newVerificationToken = crypto.randomBytes(20).toString('hex')
        const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        userData.verificationToken = newVerificationToken
        userData.verificationCode = newVerificationCode
        if (userData.verificationCode) {
            await redis.del(`code:${userData.verificationCode}`)
        }
        await redis.set(`pending:${newVerificationToken}`, JSON.stringify(userData), 'EX', VERIFICATION_TOKEN_EXPIRE)
        await redis.set(`email:${email}`, newVerificationToken, 'EX', VERIFICATION_TOKEN_EXPIRE)
        await redis.set(`code:${newVerificationCode}`, newVerificationToken, 'EX', VERIFICATION_TOKEN_EXPIRE)
        await redis.del(`pending:${existingToken}`)
        await AuthService.sendVerificationEmail(email, newVerificationCode)
    }

    static logout = async (userId: string): Promise<boolean> => {
        await redis.del(`refresh_token:${userId}`)
        return true
    }

    static refreshToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
        try {
            const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: string }
            const userId = decoded.id
            const storedRefreshToken = await redis.get(`refresh_token:${userId}`)
            if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
                throw new Error('Invalid refresh token')
            }
            const user = await User.findById(userId)
            if (!user) {
                throw new Error('User not found')
            }
            const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
                expiresIn: Number(JWT_EXPIRE),
            })
            const newRefreshToken = jwt.sign({ id: user._id }, JWT_SECRET, {
                expiresIn: Number(JWT_REFRESH_EXPIRE),
            })
            await redis.set(`refresh_token:${user._id}`, newRefreshToken, 'EX', Number(JWT_REFRESH_EXPIRE))

            return { accessToken, refreshToken: newRefreshToken }
        } catch (error) {
            throw new Error('Invalid or expired refresh token')
        }
    }

    static forgotPassword = async (email: string): Promise<void> => {
        const user = await User.findOne({ email })
        if (!user) {
            throw new Error('No user with that email')
        }

        const resetToken = crypto.randomBytes(20).toString('hex')

        await redis.set(`reset:${resetToken}`, (user.id).toString(), 'EX', RESET_PASSWORD_EXPIRE)

        console.log(`Reset password token for ${email}: ${resetToken}`)

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USERNAME,
                pass: EMAIL_PASSWORD,
            },
        })

        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`

        await transporter.sendMail({
            from: `"Food Shopping" <${EMAIL_USERNAME}>`,
            to: email,
            subject: 'Reset Your Password',
            html: `<!DOCTYPE html>
				<html lang="en">
				<head>
				<meta charset="UTF-8">
				<style>
					body {
					font-family: Arial, sans-serif;
					background-color: #f4f4f4;
					color: #333;
					padding: 20px;
					}
					.container {
					background-color: #fff;
					padding: 30px;
					border-radius: 8px;
					max-width: 600px;
					margin: auto;
					box-shadow: 0 0 10px rgba(0,0,0,0.1);
					}
					h2 {
					color: #2c3e50;
					}
					p {
					font-size: 16px;
					}
					.btn {
					display: inline-block;
					padding: 12px 24px;
					margin-top: 20px;
					background-color: #dc3545;
					color: #fff;
					text-decoration: none;
					border-radius: 5px;
					font-weight: bold;
					}
					.footer {
					margin-top: 30px;
					font-size: 12px;
					color: #999;
					text-align: center;
					}
				</style>
				</head>
				<body>
				<div class="container">
					<h2>Reset Your Password</h2>
					<p>Hello,</p>
					<p>You requested a password reset for your account at <strong>Food Shopping</strong>.</p>
					<p>Please click the button below to reset your password:</p>
					<a class="btn" href="${resetUrl}">Reset Password</a>
					<p>This link will expire in 10 minutes.</p>
					<p>If you did not request a password reset, please ignore this email.</p>
					<div class="footer">
					© 2025 Food Shopping. All rights reserved.
					</div>
				</div>
				</body>
				</html>`,
        })
    }

    static resetPassword = async (token: string, newPassword: string): Promise<void> => {
        const userId = await redis.get(`reset:${token}`)

        if (!userId) {
            throw new Error('Invalid or expired token')
        }

        const user = await User.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        user.password = newPassword
        await user.save()

        await redis.del(`reset:${token}`)
    }

    static changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
        const user = await User.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        if (!(await user.comparePassword(currentPassword))) {
            throw new Error('Current password is incorrect')
        }

        user.password = newPassword
        await user.save()
    }

    
}
