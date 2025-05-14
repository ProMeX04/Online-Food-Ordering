import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'wouter'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema as baseRegisterSchema, loginSchema as baseLoginSchema } from '@/types/schema'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

const loginSchema = baseLoginSchema

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

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

interface VerifyEmailFormProps {
    email: string
    onVerificationSuccess: () => void
}

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<string>('login')
    const [showVerification, setShowVerification] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState('')
    const { user, login, register } = useAuth()
    const [, navigate] = useLocation()
    const [isPending, setIsPending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    useEffect(() => {
        if (isSuccess) {
            setShowVerification(true)
        }
    }, [isSuccess])

    const handleLogin = async (data: LoginFormValues) => {
        setIsPending(true)
        try {
            await login(data)
        } catch (error) {
        } finally {
            setIsPending(false)
        }
    }

    const handleRegister = async (data: RegisterFormValues) => {
        setIsPending(true)
        try {
            const { confirmPassword, ...userData } = data
            await register(userData)
            setIsSuccess(true)
            setRegisteredEmail(userData.email)
        } catch (error) {
        } finally {
            setIsPending(false)
        }
    }

    if (user) {
        return null
    }

    return (
        <div className="flex min-h-screen">
            <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Chào mừng đến với Vietnamese Food</h1>
                        <p className="text-muted-foreground mt-2">
                            {activeTab === 'login' ? 'Đăng nhập để tiếp tục trải nghiệm ẩm thực Việt Nam' : 'Tạo tài khoản để bắt đầu trải nghiệm ẩm thực Việt Nam'}
                        </p>
                    </div>

                    {showVerification ? (
                        <VerifyEmailForm email={registeredEmail} onVerificationSuccess={() => {}} />
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                                <TabsTrigger value="register">Đăng ký</TabsTrigger>
                            </TabsList>
                            <TabsContent value="login">
                                <LoginForm isPending={isPending} showRegisterSuccess={isSuccess} onSubmit={handleLogin} />
                            </TabsContent>
                            <TabsContent value="register">
                                <RegisterForm isPending={isPending} isSuccess={isSuccess} onSubmit={handleRegister} />
                            </TabsContent>
                        </Tabs>
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

function LoginForm({ onSubmit, isPending, showRegisterSuccess = false }: { onSubmit: (data: LoginFormValues) => void; isPending: boolean; showRegisterSuccess?: boolean }) {
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    })

    return (
        <Form {...form}>
            {showRegisterSuccess && (
                <div className="bg-green-50 p-4 rounded-md mb-4 border border-green-200">
                    <p className="text-green-700 text-sm font-medium">Xác thực email thành công! Vui lòng đăng nhập bằng tài khoản của bạn.</p>
                </div>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên đăng nhập</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập tên đăng nhập" {...field} />
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
                            <FormLabel>Mật khẩu</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Nhập mật khẩu" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-2">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
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

    // Reset form khi đăng ký thành công
    useEffect(() => {
        if (isSuccess) {
            form.reset()
        }
    }, [isSuccess, form])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
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
                                <Input type="email" placeholder="Nhập email" {...field} />
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
                    <Button type="submit" className="w-full" disabled={isPending}>
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

function VerifyEmailForm({ email, onVerificationSuccess }: VerifyEmailFormProps) {
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
            onVerificationSuccess()
        } catch (error) {
            console.error('Verification error:', error)
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResendCode = async () => {
        if (countdown > 0) return

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
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Xác thực Email</h2>
                <p className="text-muted-foreground mt-2">Vui lòng nhập mã xác thực 6 chữ số đã được gửi đến email của bạn</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã xác thực</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nhập mã 6 chữ số" maxLength={6} className="text-center text-2xl tracking-widest" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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

                    <div className="text-center">
                        <Button type="button" variant="link" onClick={handleResendCode} disabled={countdown > 0 || isResending} className="text-sm">
                            {isResending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang gửi lại...
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
        </div>
    )
}
