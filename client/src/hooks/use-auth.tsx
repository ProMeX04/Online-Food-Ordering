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
    imageUrl?: string
    fullName?: string
}

interface LoginResponse {
    accessToken: string
    refreshToken: string
    user: AuthUser 
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
    const [, setLocation] = useLocation()

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

            const userData: AuthUser = await get('/auth/me')

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

            const response :LoginResponse= await post('/auth/login', credentials)
            const accessToken = response.accessToken
            const refreshToken = response.refreshToken
            const user: AuthUser = response.user 

            if (!accessToken) {
                throw new Error('Không nhận được access token từ server')
            }

            storeTokens(accessToken, refreshToken)
            setUser(user)
            toast({
                title: 'Đăng nhập thành công',
                description: `Chào mừng ${user.username || 'bạn'}`,
            })
            setLocation('/')
            await fetchUserProfile()

            return response
        } catch (error) {
            clearTokens()
            setUser(null)
            setError(error as Error)

            toast({
                title: 'Đăng nhập thất bại',
                description: (error as Error).message === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : (error as Error).message,
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
        } catch (error) {
            setError(error as Error)
            toast({
                title: 'Đăng ký thất bại',
                description: (error as Error).message === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : (error as Error).message,
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
            setLocation('/login')
            return response
        } catch (error) {
            setError(error as Error)
            toast({
                title: 'Xác thực thất bại',
                description: (error as Error).message === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : (error as Error).message,
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
        } catch (error) {
            setError(error as Error)
            toast({
                title: 'Gửi email xác thực thất bại',
                description: (error as Error).message === 'Network Error' ? 'Không thể kết nối đến máy chủ.' : (error as Error).message,
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

            setLocation('/')
        } catch (error) {
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
