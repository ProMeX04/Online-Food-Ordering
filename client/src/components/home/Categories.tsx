import { Link } from 'wouter'
import { Category } from '@/types/schema'

const Categories = () => {
    // Static categories data instead of using React Query
    const categories: Category[] = [
        {
            _id: '1',
            name: 'Món Miền Bắc',
            slug: 'mon-mien-bac',
        },
        {
            _id: '2',
            name: 'Món Miền Trung',
            slug: 'mon-mien-trung',
        },
        {
            _id: '3',
            name: 'Món Miền Nam',
            slug: 'mon-mien-nam',
        },
        {
            _id: '4',
            name: 'Đồ Uống',
            slug: 'do-uong',
        },
        {
            _id: '5',
            name: 'Tráng Miệng',
            slug: 'trang-mieng',
        },
        {
            _id: '6',
            name: 'Món Chay',
            slug: 'mon-chay',
        },
        {
            _id: '7',
            name: 'Món Lẩu',
            slug: 'mon-lau',
        },
        {
            _id: '8',
            name: 'Đặc Sản',
            slug: 'dac-san',
        },
    ]

    return (
        <section id="menu" className="py-12 bg-light">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="font-medium text-3xl md:text-4xl text-neutral mb-2">
                        Danh Mục <span className="text-primary">Món Ăn</span>
                    </h2>
                    <p className="text-neutral/80">Chọn danh mục để khám phá các món ăn ngon</p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link key={category._id} href={`/menu?category=${category.slug}`}>
                            <div className="group">
                                <div className="bg-white p-6 text-center relative hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-2 rounded-lg border border-neutral/10">
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                                           
                                        </div>
                                        <h3 className="font-medium text-lg">{category.name}</h3>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Categories
