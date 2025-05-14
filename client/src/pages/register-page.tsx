import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLocation, Link } from 'wouter'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema as baseRegisterSchema } from '@/types/schema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

const registerSchema = baseRegisterSchema
    .extend({
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu không khớp',
        path: ['confirmPassword'],
    })

const verifyEmailSchema = z.object({
    code: z.string().length(6, 'Mã xác thực phải có 6 chữ số'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

interface VerifyEmailFormProps {
    email: string
    onVerificationSuccess: () => void
}

export default function RegisterPage() {
    const [showVerification, setShowVerification] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState('')
    const { user, register,  } = useAuth()
    const [, navigate] = useLocation()
    const [isRegistering, setIsRegistering] = useState(false)
    const [registerSuccess, setRegisterSuccess] = useState(false)
    const [verifySuccess, ] = useState(false)

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    useEffect(() => {
        if (registerSuccess) {
            setShowVerification(true)
        }
    }, [registerSuccess])

    useEffect(() => {
        if (verifySuccess) {
            navigate('/login?verified=true')
        }
    }, [verifySuccess, navigate])

    if (user) {
        return null
    }

    return (
        <div className="flex min-h-screen">
            {/* Register form section */}
            <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">{showVerification ? 'Xác thực tài khoản' : 'Đăng ký tài khoản'}</h1>
                        <p className="text-muted-foreground mt-2">
                            {showVerification ? `Vui lòng nhập mã xác thực được gửi đến ${registeredEmail}` : 'Tạo tài khoản để bắt đầu trải nghiệm ẩm thực Việt Nam'}
                        </p>
                    </div>

                    {showVerification ? (
                        <VerifyEmailForm
                            email={registeredEmail}
                            onVerificationSuccess={() => {
                            }}
                        />
                    ) : (
                        <RegisterForm
                            isPending={isRegistering}
                            isSuccess={registerSuccess}
                            onSubmit={async (data) => {
                                try {
                                    setIsRegistering(true)
                                    const { confirmPassword, ...userData } = data
                                    const response = await register(userData)
                                    if (response.success) {
                                        setRegisterSuccess(true)
                                        setRegisteredEmail(userData.email)
                                    }
                                } catch (error) {
                                    console.error(error)
                                } finally {
                                    setIsRegistering(false)
                                }
                            }}
                        />
                    )}

                    {!showVerification && (
                        <div className="text-center mt-6">
                            <p className="text-sm text-muted-foreground">
                                Đã có tài khoản?{' '}
                                <Link href="/login" className="text-primary hover:underline">
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hero section */}
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-r from-primary/90 to-primary">
                <div className="h-full flex flex-col justify-center p-12 text-white">
                    <h2 className="text-4xl font-bold mb-6">Khám phá hương vị Việt Nam</h2>
                    <p className="text-lg mb-8">Trang web của chúng tôi cung cấp những món ăn Việt Nam chính thống với nguyên liệu tươi ngon và công thức nấu ăn chính thống từ mọi miền đất nước.</p>
                    <div className="space-y-4">
                        <FeatureItem title="Đa dạng món ăn" description="Hơn 100 món ăn từ ba miền Bắc - Trung - Nam" />
                        <FeatureItem title="Giao hàng nhanh chóng" description="Giao hàng trong vòng 30 phút tại khu vực nội thành" />
                        <FeatureItem title="Dễ dàng thanh toán" description="Hỗ trợ nhiều phương thức thanh toán khác nhau" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-1">
                <div className="h-3 w-3 rounded-full bg-white"></div>
            </div>
            <div>
                <h3 className="font-medium text-lg">{title}</h3>
                <p className="text-white/70">{description}</p>
            </div>
        </div>
    )
}

function RegisterForm({ onSubmit, isPending, isSuccess }: { onSubmit: (data: RegisterFormValues) => void; isPending: boolean; isSuccess: boolean }) {
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập tên đăng nhập" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Email <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Nhập địa chỉ email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Mật khẩu <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Nhập mật khẩu" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Nhập lại mật khẩu" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Họ và tên</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập họ và tên" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-2">
                    <Button type="submit" className="w-full" disabled={isPending || isSuccess}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang đăng ký...
                            </>
                        ) : (
                            'Đăng ký'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

function VerifyEmailForm({ email }: VerifyEmailFormProps) {
    const { verifyEmail, resendVerification } = useAuth()
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const form = useForm<z.infer<typeof verifyEmailSchema>>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: {
            code: '',
        },
    })

    const onSubmit = async (data: z.infer<typeof verifyEmailSchema>) => {
        setIsVerifying(true)
        try {
            await verifyEmail(data.code)
        } catch (error) {
            console.error('Verification error:', error)
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResendCode = async () => {
        if (countdown > 0 || !email) return

        setIsResending(true)
        try {
            await resendVerification(email)
            setCountdown(60)
        } catch (error) {
            console.error('Resend error:', error)
        } finally {
            setIsResending(false)
        }
    }

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1)
            }, 1000)
        }
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [countdown])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mã xác thực</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập mã 6 chữ số" maxLength={6} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-2 flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={isVerifying}>
                        {isVerifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xác thực...
                            </>
                        ) : (
                            'Xác thực'
                        )}
                    </Button>

                    <Button type="button" variant="outline" className="w-full" onClick={handleResendCode} disabled={isResending || countdown > 0}>
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang gửi lại mã...
                            </>
                        ) : countdown > 0 ? (
                            `Gửi lại sau ${countdown}s`
                        ) : (
                            'Gửi lại mã xác thực'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
