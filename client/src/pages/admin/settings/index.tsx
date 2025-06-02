import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { put } from '@/lib'
import AdminLayout from '@/pages/admin/AdminLayout'

const profileFormSchema = z.object({
    fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
    email: z.string().email('Email không hợp lệ'),
    pho: z.string().min(10, 'Số điện thoại không hợp lệ'),
})

const passwordFormSchema = z
    .object({
        currentPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
        newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
        confirmPassword: z.string().min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    })

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function SettingsPage() {
    const { user, checkAuth } = useAuth()
    const [isUpdating, setIsUpdating] = useState(false)

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: user?.fullName || '',
            email: user?.email || '',
        },
    })

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const onProfileSubmit = async (data: ProfileFormValues) => {
        try {
            setIsUpdating(true)
            await put('/users/profile', data)
            await checkAuth()
            toast({
                title: 'Thành công',
                description: 'Cập nhật thông tin thành công',
            })
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: 'Không thể cập nhật thông tin',
                variant: 'destructive',
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        try {
            setIsUpdating(true)
            await put('/users/password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            })
            toast({
                title: 'Thành công',
                description: 'Đổi mật khẩu thành công',
            })
            passwordForm.reset()
        } catch (error: unknown) {
            toast({
                title: 'Lỗi',
                description: (error as Error).message || 'Không thể đổi mật khẩu',
                variant: 'destructive',
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Thiết lập</h2>
                    <p className="text-muted-foreground">Quản lý tài khoản và thiết lập hệ thống</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
                        <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
                        <TabsTrigger value="notifications">Thông báo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cá nhân</CardTitle>
                                <CardDescription>Cập nhật thông tin cá nhân của bạn. Đảm bảo sử dụng một địa chỉ email mà bạn thường xuyên truy cập.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...profileForm}>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Họ tên</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nhập họ tên của bạn" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={profileForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="example@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        

                                        <Button type="submit" disabled={isUpdating}>
                                            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="password" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đổi mật khẩu</CardTitle>
                                <CardDescription>Đổi mật khẩu tài khoản của bạn. Sau khi đổi mật khẩu thành công, bạn sẽ cần đăng nhập lại.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...passwordForm}>
                                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                        <FormField
                                            control={passwordForm.control}
                                            name="currentPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Nhập mật khẩu hiện tại" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mật khẩu mới</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Nhập mật khẩu mới" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={passwordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Nhập lại mật khẩu mới" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" disabled={isUpdating}>
                                            {isUpdating ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông báo</CardTitle>
                                <CardDescription>Cấu hình cách bạn nhận thông báo từ hệ thống.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-muted-foreground">Tính năng đang được phát triển...</div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    )
}
