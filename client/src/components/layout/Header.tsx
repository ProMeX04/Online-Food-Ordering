import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/hooks/use-auth'
import { CartoonButton } from '@/components/ui/CartoonButton'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User as UserIcon, LogOut, UserPlus, LogIn, History } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [location, setLocation] = useLocation()
    const { toggleCartOpen, cartItems } = useCart()
    const { user, logout } = useAuth()

    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0)

    const navLinks = [
        { name: 'Trang chủ', path: '/' },
        { name: 'Món ăn', path: '/menu/normal-mode' },
        { name: 'Trò chuyện', path: '/menu/ai-mode' },
        { name: 'Giới thiệu', path: '/about' },
        { name: 'Liên hệ', path: '/contact' },
    ]

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const getUserInitials = (): string => {
        if (!user) return 'U'

        const name = user.username || 'User'
        return name.charAt(0).toUpperCase()
    }

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <div className="w-12 h-12 rounded-full border-2 border-neutral flex items-center justify-center bg-primary text-white font-baloo font-bold text-xl">VF</div>
                        <h1 className="ml-2 font-baloo font-bold text-2xl text-primary">
                            Việt<span className="text-accent">Food</span>
                        </h1>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link: { name: string; path: string }) => (
                            <Link key={link.path} href={link.path} className={`font-baloo font-medium ${location === link.path ? 'text-primary' : 'text-neutral hover:text-primary'} transition`}>
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <CartoonButton className="bg-secondary p-2 relative" onClick={toggleCartOpen} aria-label="Cart">
                            <i className="fas fa-shopping-cart text-neutral"></i>
                            {totalCartItems > 0 && (
                                <span className="cart-count absolute -top-2 -right-2 bg-primary text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">{totalCartItems}</span>
                            )}
                        </CartoonButton>

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full p-0 h-9 w-9 overflow-hidden">
                                        <Avatar className="h-9 w-9 border border-primary/10">
                                            {user.imageUrl ? <AvatarImage src={user.imageUrl} alt={user.username} /> : null}
                                            <AvatarFallback className="bg-primary-50 text-primary">{getUserInitials()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <div className="px-2 py-1.5">
                                        <div className="text-sm font-semibold text-primary">Xin chào,</div>
                                        <div className="text-sm font-medium">{user.username}</div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation('/profile')}>
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        Cập nhật thông tin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation('/orders')}>
                                        <History className="h-4 w-4 mr-2" />
                                        Lịch sử mua sắm
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <UserIcon className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation('/login')}>
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Đăng nhập
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation('/register')}>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Đăng ký
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <button className={`cartoon-button p-2 md:hidden ${isMenuOpen ? 'menu-open' : ''}`} onClick={toggleMenu} aria-label="Menu">
                            <div className="hamburger-top w-6 h-0.5 bg-neutral mb-1.5 transition-all"></div>
                            <div className="hamburger-middle w-6 h-0.5 bg-neutral mb-1.5 transition-all"></div>
                            <div className="hamburger-bottom w-6 h-0.5 bg-neutral transition-all"></div>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`mobile-menu ${isMenuOpen ? 'block' : 'hidden'} bg-white w-full absolute top-full left-0 shadow-md z-50`}>
                <div className="container mx-auto p-4">
                    <nav className="flex flex-col space-y-4">
                        {navLinks.map((link: { name: string; path: string }) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`font-baloo font-medium p-2 border-b border-gray-200 ${location === link.path ? 'text-primary' : 'text-neutral hover:text-primary'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header
