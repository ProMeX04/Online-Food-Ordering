import { ReactNode, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { SidebarProvider } from '@/components/ui/sidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import AdminSidebar from '@/components/layout/AdminSidebar'

type AdminLayoutProps = {
    children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, checkAuth } = useAuth()
    const [, navigate] = useLocation()
    const { toast } = useToast()

    useEffect(() => {
        const verifyAdminAccess = async () => {
            if (!user) {
                const authUser = await checkAuth()

                if (!authUser) {
                    toast({
                        title: 'Yêu cầu đăng nhập',
                        description: 'Vui lòng đăng nhập để truy cập trang quản trị',
                        variant: 'destructive',
                    })
                    navigate('/login')
                    return
                }

                if (authUser.role !== 'admin') {
                    toast({
                        title: 'Quyền truy cập bị từ chối',
                        description: 'Bạn không có quyền truy cập vào trang quản trị',
                        variant: 'destructive',
                    })
                    navigate('/')
                    return
                }
            } else if (user.role !== 'admin') {
                toast({
                    title: 'Quyền truy cập bị từ chối',
                    description: 'Bạn không có quyền truy cập vào trang quản trị',
                    variant: 'destructive',
                })
                navigate('/login')
            }
        }

        verifyAdminAccess()
    }, [user, navigate, checkAuth, toast])

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <AdminHeader />

            <div className="flex flex-1 overflow-hidden">
                <SidebarProvider>
                    <AdminSidebar />
                    <div className="flex-1 p-4 bg-background overflow-auto">{children}</div>
                </SidebarProvider>
            </div>
        </div>
    )
}
