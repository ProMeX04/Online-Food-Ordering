import { Link } from 'wouter'
import { CartoonButton } from '@/components/ui/CartoonButton'

const Footer = () => {
    return (
        <footer className="bg-neutral text-white pt-12 pb-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-2">
                                <span className="font-baloo font-bold text-primary text-xl">VF</span>
                            </div>
                            <h2 className="font-baloo font-bold text-2xl">
                                Việt<span className="text-accent">Food</span>
                            </h2>
                        </div>

                        <p className="mb-6 text-white/80">Món ăn Việt Nam truyền thống với hương vị thuần Việt giao tận nơi cho bạn.</p>

                        <div className="flex space-x-3">
                            <CartoonButton className="bg-white/10 h-10 w-10 flex items-center justify-center hover:bg-secondary">
                                <i className="fab fa-facebook-f"></i>
                            </CartoonButton>
                            <CartoonButton className="bg-white/10 h-10 w-10 flex items-center justify-center hover:bg-secondary">
                                <i className="fab fa-instagram"></i>
                            </CartoonButton>
                            <CartoonButton className="bg-white/10 h-10 w-10 flex items-center justify-center hover:bg-secondary">
                                <i className="fab fa-tiktok"></i>
                            </CartoonButton>
                            <CartoonButton className="bg-white/10 h-10 w-10 flex items-center justify-center hover:bg-secondary">
                                <i className="fab fa-youtube"></i>
                            </CartoonButton>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-baloo font-bold text-xl mb-4">Liên kết nhanh</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-white/80 hover:text-secondary">
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link href="/menu" className="text-white/80 hover:text-secondary">
                                    Thực đơn
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-white/80 hover:text-secondary">
                                    Về chúng tôi
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-white/80 hover:text-secondary">
                                    Liên hệ
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-white/80 hover:text-secondary">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-white/80 hover:text-secondary">
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-baloo font-bold text-xl mb-4">Thông tin liên hệ</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <i className="fas fa-map-marker-alt mt-1 mr-3 text-accent"></i>
                                <span className="text-white/80">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-start">
                                <i className="fas fa-phone-alt mt-1 mr-3 text-accent"></i>
                                <span className="text-white/80">0912 345 678</span>
                            </li>
                            <li className="flex items-start">
                                <i className="fas fa-envelope mt-1 mr-3 text-accent"></i>
                                <span className="text-white/80">info@vietfood.com</span>
                            </li>
                            <li className="flex items-start">
                                <i className="fas fa-clock mt-1 mr-3 text-accent"></i>
                                <span className="text-white/80">Hàng ngày: 9:00 - 22:00</span>
                            </li>
                        </ul>

                        <div className="flex items-center mt-6">
                            <div className="flex space-x-2 mr-3">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1000px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1000px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6" />
                            </div>
                            <span className="text-white/60 text-xs">Thanh toán an toàn</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-white/60 text-sm mb-4 md:mb-0">© 2023 ViệtFood. Tất cả các quyền được bảo lưu.</p>
                        <div className="flex space-x-4 text-white/60 text-sm">
                            <Link href="#" className="hover:text-white">
                                Chính sách bảo mật
                            </Link>
                            <Link href="#" className="hover:text-white">
                                Điều khoản sử dụng
                            </Link>
                            <Link href="#" className="hover:text-white">
                                Sitemap
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
