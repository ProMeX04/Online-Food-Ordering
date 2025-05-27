import { createContext, useContext, ReactNode, useMemo, useEffect, useState, useCallback } from 'react'
import { RegisterInput, LoginInput } from '@/types/schema'
import { useToast } from '@/hooks/use-toast'
import { useLocation } from 'wouter'
import { getAccessToken, clearTokens, storeTokens } from '@/lib'
import { get, post } from '@/lib/axiosClient'
interface AuthUser {
    _id: string
    username: string
    email: string
    role: string
    isActive: boolean
    fullName?: string
    imageUrl?: string
}

interface LoginResponse {
    accessToken?: string
    token?: string
    refreshToken?: string
    user?: AuthUser
    data?: {
        accessToken?: string
        token?: string
        refreshToken?: string
        user?: AuthUser
    }
    success?: boolean
    message?: string
}

interface RegisterResponse {
    success: boolean
    message: string
    data?: {
        user?: AuthUser
    }
}

interface VerificationResponse {
    success: boolean
    message: string
    verified?: boolean
}

interface AuthErrorResponse {
    message: string
    statusCode?: number
}

interface AuthContextType {
    user: AuthUser | null
    isLoading: boolean
    error: Error | null
    login: (credentials: LoginInput) => Promise<LoginResponse>
    logout: () => Promise<void>
    register: (userData: RegisterInput) => Promise<RegisterResponse>
    verifyEmail: (code: string) => Promise<VerificationResponse>
    resendVerification: (email: string) => Promise<VerificationResponse>
    checkAuth: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast()
    const [, navigate] = useLocation()

    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchUserProfile = useCallback(async () => {
        try {
            const tokenData = getAccessToken()
            if (!tokenData) {
                setUser(null)
                return null
            }
            setIsLoading(true)

            const response: any = await get('/auth/me')

            let userData = null
            if (response && typeof response === 'object') {
                if (response._id || response.id) {
                    userData = response as AuthUser
                } else if (response.data) {
                    userData = response.data as AuthUser
                } else if (response.user) {
                    userData = response.user as AuthUser
                }
            }

            if (userData) {
                setUser(userData)
                return userData
            }

            console.warn('Không tìm thấy dữ liệu người dùng trong phản hồi')
            setUser(null)
            return null
        } catch (error) {
            const authError = error as Error & AuthErrorResponse
            console.error('Lỗi khi lấy thông tin người dùng:', authError)

            if (authError.message === 'UNAUTHORIZED' || authError.statusCode === 401) {
                clearTokens()
                setUser(null)
            }
            setError(authError)
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    const checkAuth = useCallback(async (): Promise<AuthUser | null> => {
        try {
            const token = getAccessToken()
            if (!token) {
                return null
            }

            const userData = await fetchUserProfile()
            return userData
        } catch (error) {
            return null
        }
    }, [fetchUserProfile])

    useEffect(() => {
        if (getAccessToken()) {
            fetchUserProfile().catch((err) => {
                console.error('Không thể lấy thông tin người dùng ban đầu:', err)
            })
        } else {
            setIsLoading(false)
        }
    }, [fetchUserProfile])

    const login = async (credentials: LoginInput): Promise<LoginResponse> => {
        try {
            setIsLoading(true)

            const response = (await post('/auth/login', credentials)) as any

            const accessToken = response?.accessToken || response?.token || response?.data?.accessToken || response?.data?.token
            const refreshToken = response?.refreshToken || response?.data?.refreshToken

            let userData: AuthUser | undefined
            if (response?._id && response?.username) {
                userData = response as AuthUser
            } else if (response?.user) {
                userData = response.user as AuthUser
            } else if (response?.data?.user) {
                userData = response.data.user as AuthUser
            }

            if (!accessToken) {
                throw new Error('Không nhận được access token từ server')
            }

            storeTokens(accessToken, refreshToken || accessToken)

            if (userData) {
                setUser(userData)

                toast({
                    title: 'Đăng nhập thành công',
                    description: `Chào mừng ${userData.fullName || userData.username || 'bạn'}`,
                })
                navigate('/')
            } else {
                await fetchUserProfile()

                toast({
                    title: 'Đăng nhập thành công',
                    description: 'Chào mừng bạn đã quay trở lại!',
                })

                navigate('/')
            }

            return response
        } catch (error: any) {
            clearTokens()
            setUser(null)
            setError(error)

            toast({
                title: 'Đăng nhập thất bại',
                description: error.message === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : error.message,
                variant: 'destructive',
            })

            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (userData: RegisterInput): Promise<RegisterResponse> => {
        try {
            setIsLoading(true)
            const response: RegisterResponse = await post('/auth/register', userData)

            toast({
                title: 'Đăng ký thành công',
                description: 'Vui lòng kiểm tra email để xác thực tài khoản',
            })

            return response
        } catch (error: any) {
            setError(error)
            toast({
                title: 'Đăng ký thất bại',
                description: error.message === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : error.message,
                variant: 'destructive',
            })
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const verifyEmail = async (code: string): Promise<VerificationResponse> => {
        try {
            setIsLoading(true)
            const response: VerificationResponse = await post('/auth/verify-email', { code })

            toast({
                title: 'Xác thực thành công',
                description: 'Tài khoản của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.',
            })
            navigate('/login')
            return response
        } catch (error: any) {
            setError(error)
            toast({
                title: 'Xác thực thất bại',
                description: error.message === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : error.message,
                variant: 'destructive',
            })
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const resendVerification = async (email: string): Promise<VerificationResponse> => {
        try {
            setIsLoading(true)
            const response: VerificationResponse = await post('/auth/resend-verification', { email })

            toast({
                title: 'Gửi email xác thực thành công',
                description: 'Vui lòng kiểm tra email của bạn để nhận mã xác thực mới.',
            })

            return response
        } catch (error: any) {
            setError(error)
            toast({
                title: 'Gửi email xác thực thất bại',
                description: error.message === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : error.message,
                variant: 'destructive',
            })
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async (): Promise<void> => {
        try {
            setIsLoading(true)
            await post('/auth/logout')
            clearTokens()
            setUser(null)

            toast({
                title: 'Đăng xuất thành công',
                description: 'Bạn đã đăng xuất khỏi hệ thống.',
            })

            navigate('/')
        } catch (error: any) {
            console.error('Lỗi đăng xuất:', error)
            clearTokens()
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const value = useMemo(
        () => ({
            user,
            isLoading,
            error,
            login,
            logout,
            register,
            verifyEmail,
            resendVerification,
            checkAuth,
        }),
        [user, isLoading, error, fetchUserProfile, checkAuth],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
