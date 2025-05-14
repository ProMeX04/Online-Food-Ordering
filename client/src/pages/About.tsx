import { useEffect } from 'react'
import { Link } from 'wouter'
import { CartoonButton } from '@/components/ui/CartoonButton'
import { CartoonBorder } from '@/components/ui/CartoonBorder'
import { CartoonIcon } from '@/components/ui/CartoonIcon'

const About = () => {
    useEffect(() => {
        document.title = 'Giới thiệu | ViệtFood'
    }, [])

    const stats = [
        { icon: 'utensils', number: '50+', label: 'Món Ăn', color: 'primary' as const },
        { icon: 'users', number: '10,000+', label: 'Khách Hàng', color: 'secondary' as const },
        { icon: 'medal', number: '15+', label: 'Giải Thưởng', color: 'accent' as const },
        { icon: 'store', number: '5', label: 'Chi Nhánh', color: 'primary' as const },
    ]

    const milestones = [
        {
            year: '2010',
            title: 'Thành Lập ViệtFood',
            description: 'Cửa hàng đầu tiên được mở tại Quận 1, TP.HCM với 5 nhân viên và 15 món ăn truyền thống.',
        },
        {
            year: '2015',
            title: 'Mở Rộng Chi Nhánh',
            description: 'Mở thêm 2 chi nhánh tại Quận 3 và Quận 7, đánh dấu sự phát triển mạnh mẽ.',
        },
        {
            year: '2018',
            title: 'Giải Thưởng Ẩm Thực',
            description: "Nhận giải 'Nhà hàng Việt Nam xuất sắc' do Hiệp hội Ẩm thực Việt Nam trao tặng.",
        },
        {
            year: '2023',
            title: 'Ra Mắt Nền Tảng Trực Tuyến',
            description: 'Phát triển website và ứng dụng di động để khách hàng có thể đặt món mọi lúc, mọi nơi.',
        },
    ]

    // Hard coded core values
    const values = [
        {
            icon: 'leaf',
            title: 'Nguyên Liệu Tươi Sạch',
            description: 'Chúng tôi cam kết sử dụng các nguyên liệu tươi ngon, nguồn gốc rõ ràng trong từng món ăn.',
        },
        {
            icon: 'handshake',
            title: 'Phục Vụ Tận Tâm',
            description: 'Mỗi khách hàng đều là thượng đế và xứng đáng nhận được sự phục vụ tốt nhất từ đội ngũ của chúng tôi.',
        },
        {
            icon: 'mortar-pestle',
            title: 'Giữ Gìn Hương Vị',
            description: 'Bảo tồn và phát huy tinh hoa ẩm thực Việt Nam trong từng công thức nấu ăn truyền thống.',
        },
        {
            icon: 'seedling',
            title: 'Trách Nhiệm Môi Trường',
            description: 'Sử dụng bao bì thân thiện với môi trường và thực hành kinh doanh bền vững.',
        },
    ]

    const team = [
        {
            name: 'Nguyễn Văn An',
            role: 'Bếp Trưởng',
            description: 'Hơn 20 năm kinh nghiệm trong ẩm thực Việt Nam truyền thống.',
            imageUrl: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        },
        {
            name: 'Trần Thị Bình',
            role: 'Quản Lý',
            description: 'Chuyên gia quản lý nhà hàng với tâm huyết phát triển ẩm thực Việt.',
            imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        },
        {
            name: 'Lê Hoàng Cương',
            role: 'Đầu Bếp Sáng Tạo',
            description: 'Người đứng sau những món ăn fusion độc đáo kết hợp Việt-Á-Âu.',
            imageUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        },
        {
            name: 'Phạm Minh Dương',
            role: 'Chuyên Gia Nguyên Liệu',
            description: 'Người kết nối với các nhà cung cấp nông sản sạch trên khắp Việt Nam.',
            imageUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        },
    ]

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-primary/10 to-accent/10 py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="md:w-1/2">
                            <h1 className="font-baloo font-bold text-4xl md:text-5xl text-neutral mb-6">
                                Câu Chuyện <span className="text-primary">Của Chúng Tôi</span>
                            </h1>
                            <p className="text-lg mb-8">
                                ViệtFood được thành lập vào năm 2010 với mong muốn mang hương vị truyền thống Việt Nam đến với mọi người. Chúng tôi tự hào về hành trình hơn một thập kỷ phục vụ những
                                món ăn ngon, chất lượng và đậm đà bản sắc Việt.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/menu">
                                    <CartoonButton variant="primary" size="lg">
                                        <i className="fas fa-utensils mr-2"></i> Xem thực đơn
                                    </CartoonButton>
                                </Link>
                                <Link href="/contact">
                                    <CartoonButton variant="light" size="lg">
                                        <i className="fas fa-phone-alt mr-2"></i> Liên hệ ngay
                                    </CartoonButton>
                                </Link>
                            </div>
                        </div>
                        <div className="md:w-1/2 relative">
                            <CartoonBorder className="p-6 bg-white relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1526069631228-723c945bea6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                    alt="Nhà hàng ViệtFood"
                                    className="w-full h-auto rounded-2xl"
                                />
                                <div className="absolute -top-8 -left-8 bg-secondary cartoon-border p-3 rounded-full animate-bounce">
                                    <span className="font-baloo font-bold text-neutral">Từ 2010</span>
                                </div>
                            </CartoonBorder>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block absolute top-20 right-10">
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-accent opacity-30"></div>
                </div>
                <div className="hidden lg:block absolute bottom-10 left-20">
                    <div className="w-16 h-16 rounded-full border-4 border-dotted border-primary opacity-30"></div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <CartoonBorder key={index} className="p-6 text-center">
                                <CartoonIcon iconName={stat.icon} size="lg" bgColor={stat.color} className="mx-auto mb-4" />
                                <h2 className="font-baloo font-bold text-3xl text-primary mb-2">{stat.number}</h2>
                                <p className="text-neutral">{stat.label}</p>
                            </CartoonBorder>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-light">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-baloo font-bold text-3xl md:text-4xl text-neutral mb-4">
                            Hành Trình <span className="text-primary">Phát Triển</span>
                        </h2>
                        <p className="max-w-3xl mx-auto text-neutral/80">Những cột mốc quan trọng đánh dấu sự phát triển của ViệtFood trong hơn một thập kỷ qua.</p>
                    </div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20 z-0 hidden md:block"></div>

                        <div className="space-y-12 relative z-10">
                            {milestones.map((milestone, index) => (
                                <div key={index} className={`flex flex-col md:flex-row items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="md:w-1/2 mb-6 md:mb-0 flex justify-center">
                                        <CartoonBorder className="bg-primary text-white p-6 max-w-md">
                                            <div className="text-4xl font-baloo font-bold mb-2">{milestone.year}</div>
                                            <h3 className="text-xl font-baloo font-medium mb-2">{milestone.title}</h3>
                                            <p>{milestone.description}</p>
                                        </CartoonBorder>
                                    </div>
                                    <div className="md:w-1/2 hidden md:flex justify-center">
                                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold cartoon-border border-white">{index + 1}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-baloo font-bold text-3xl md:text-4xl text-neutral mb-4">
                            Giá Trị <span className="text-primary">Cốt Lõi</span>
                        </h2>
                        <p className="max-w-3xl mx-auto text-neutral/80">Những giá trị định hướng mọi hoạt động và quyết định của chúng tôi.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <CartoonBorder key={index} className="p-6 text-center hover:bg-accent/5 transition-colors">
                                <CartoonIcon iconName={value.icon} size="lg" bgColor="accent" className="mx-auto mb-4" />
                                <h3 className="font-baloo font-bold text-xl mb-3">{value.title}</h3>
                                <p className="text-neutral/80">{value.description}</p>
                            </CartoonBorder>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-light">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-baloo font-bold text-3xl md:text-4xl text-neutral mb-4">
                            Đội Ngũ <span className="text-primary">Của Chúng Tôi</span>
                        </h2>
                        <p className="max-w-3xl mx-auto text-neutral/80">Những con người tài năng và đam mê tạo nên những món ăn tuyệt vời tại ViệtFood.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <CartoonBorder key={index} className="p-4 text-center">
                                <div className="rounded-full overflow-hidden mb-4 cartoon-border w-40 h-40 mx-auto">
                                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-baloo font-bold text-xl mb-1">{member.name}</h3>
                                <p className="text-primary font-medium mb-3">{member.role}</p>
                                <p className="text-sm text-neutral/80 mb-4">{member.description}</p>
                            </CartoonBorder>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-baloo font-bold text-3xl md:text-4xl text-white mb-6">Sẵn Sàng Khám Phá Hương Vị Việt?</h2>
                    <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">Đặt món ngay hôm nay và cảm nhận hương vị truyền thống Việt Nam với sự phục vụ chuyên nghiệp từ ViệtFood.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/menu">
                            <CartoonButton variant="secondary" size="lg">
                                <i className="fas fa-utensils mr-2"></i> Xem Thực Đơn
                            </CartoonButton>
                        </Link>
                        <Link href="/contact">
                            <CartoonButton variant="light" size="lg">
                                <i className="fas fa-phone-alt mr-2"></i> Liên Hệ Ngay
                            </CartoonButton>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}

export default About
