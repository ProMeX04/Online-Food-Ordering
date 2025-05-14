import { Link } from 'wouter'
import { Button } from '@/components/ui/button'

const AboutSection = () => {
    const benefits = [
        'Món ăn đa dạng từ khắp các vùng miền Việt Nam',
        'Nguyên liệu tươi ngon được tuyển chọn mỗi ngày',
        'Đội ngũ đầu bếp chuyên nghiệp với nhiều năm kinh nghiệm',
        'Giao hàng nhanh chóng trong vòng 30 phút',
    ]

    return (
        <section id="about" className="py-12 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-10">
                    <div className="lg:w-1/2 relative">
                        <div className="rounded-lg shadow-md bg-white p-4 relative z-10 border border-neutral/10">
                            <img
                                src="https://images.unsplash.com/photo-1545659531-9a66f06c079f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Nhà hàng Việt Food"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>

                        <div className="absolute -bottom-6 -left-6 bg-secondary p-4 rounded-full z-20 shadow-md animate-bounce hidden md:block">
                            <span className="font-medium text-neutral">Từ 2010</span>
                        </div>

                        <div className="absolute -top-6 -right-6 z-0 w-32 h-32 bg-accent/20 rounded-full hidden md:block"></div>
                    </div>

                    <div className="lg:w-1/2">
                        <h2 className="font-medium text-3xl md:text-4xl text-neutral mb-4">
                            Về <span className="text-primary">Việt</span>
                            <span className="text-accent">Food</span>
                        </h2>

                        <p className="mb-6 text-lg">ViệtFood - Nhà hàng Việt Nam chất lượng hàng đầu.</p>

                        <div className="mb-8 space-y-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start">
                                    <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-white mt-1 mr-3">
                                        <i className="fas fa-check text-sm"></i>
                                    </div>
                                    <p>{benefit}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/menu">
                                <Button size="lg" className="px-6">
                                    <i className="fas fa-utensils mr-2"></i> Xem Thực Đơn
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" size="lg" className="px-6">
                                    <i className="fas fa-envelope mr-2"></i> Liên Hệ Ngay
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
