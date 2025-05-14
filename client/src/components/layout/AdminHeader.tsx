import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'wouter'

export default function AdminHeader() {
    const { logout } = useAuth()
    const [, navigate] = useLocation()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <header className="h-14 bg-primary text-white flex items-center px-4 justify-between sticky top-0 z-50">
            <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">Quản lý Vietnamese Food</h1>
            </div>
            <div>
                <Button variant="ghost" className="text-white" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                </Button>
            </div>
        </header>
    )
}
