import { Link } from 'wouter'
import { Button } from '@/components/ui/button'

interface Feature {
    icon: string
    title: string
    subtitle: string
}

const HeroSection = () => {
    const features: Feature[] = [
        {
            icon: 'clock',
            title: 'Giao hàng nhanh',
            subtitle: 'Trong vòng 30 phút',
        },
        {
            icon: 'utensils',
            title: 'Ẩm thực đa dạng',
            subtitle: 'Đặc sản 3 miền',
        },
        {
            icon: 'tags',
            title: 'Giá cả hợp lý',
            subtitle: 'Ưu đãi hàng ngày',
        },
        {
            icon: 'medal',
            title: 'Chất lượng cao cấp',
            subtitle: 'Nguyên liệu tươi ngon',
        },
    ]

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white">
            <div className="container mx-auto px-4 py-12 md:py-24">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Hero Text */}
                    <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
                        <h1 className="font-medium text-4xl md:text-5xl lg:text-6xl text-neutral mb-6">
                            Khám Phá <span className="text-primary">Hương Vị</span> Việt Nam
                        </h1>
                        <p className="text-lg md:text-xl mb-8 text-neutral/80">
                            Đặt món ăn Việt Nam yêu thích của bạn và nhận giao hàng tận nơi trong 30 phút. Thưởng thức hương vị Việt Nam chính thống ngay tại nhà.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link href="/menu">
                                <Button variant="default" size="lg" className="font-medium px-8">
                                    Đặt Ngay
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="outline" size="lg" className="font-medium px-8">
                                    Tìm Hiểu Thêm
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="md:w-1/2 relative">
                        <div className="relative overflow-hidden rounded-lg shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1526069631228-723c945bea6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Món ăn Việt Nam"
                                className="w-full h-auto object-cover transition-transform hover:scale-105 duration-700"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <span className="text-white font-medium">Ẩm thực Việt Nam tinh tế và đầy hương vị</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats/Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow border border-neutral/10">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary mx-auto mb-4 flex items-center justify-center">
                                <i className={`fas fa-${feature.icon} text-xl`}></i>
                            </div>
                            <h3 className="font-medium text-lg mb-1">{feature.title}</h3>
                            <p className="text-sm text-neutral/70">{feature.subtitle}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroSection
