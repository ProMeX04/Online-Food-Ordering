import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLocation, Link } from 'wouter'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema as baseLoginSchema } from '@/types/schema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

// Form schema
const loginSchema = baseLoginSchema

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [showRegisterSuccess, setShowRegisterSuccess] = useState(false)
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const { user, login } = useAuth()
    const [, setLocation] = useLocation()

    useEffect(() => {
        const url = new URL(window.location.href)
        const verified = url.searchParams.get('verified')
        if (verified === 'true') {
            setShowRegisterSuccess(true)
        }
    }, [])

    useEffect(() => {
        if (user) {
            setLocation('/')
        }
    }, [user, setLocation])

    const handleLogin = async (data: LoginFormValues) => {
        setIsLoggingIn(true)
        await login(data)
        setIsLoggingIn(false)
    }

    if (user) {
        return null
    }

    return (
        <div className="flex min-h-screen">
            <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Đăng nhập</h1>
                        <p className="text-muted-foreground mt-2">Đăng nhập để tiếp tục trải nghiệm ẩm thực Việt Nam</p>
                    </div>

                    <LoginForm isPending={isLoggingIn} showRegisterSuccess={showRegisterSuccess} onSubmit={handleLogin} />

                    <div className="text-center mt-6">
                        <p className="text-sm text-muted-foreground">
                            Chưa có tài khoản?{' '}
                            <Link href="/register" className="text-primary hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

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
