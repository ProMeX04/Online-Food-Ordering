import { useState, useEffect } from 'react'
import { useParams } from 'wouter'
import { DishList } from '@/components/shop/DishList'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Link } from 'wouter'
import { Category } from '@/types/schema'
import { get } from '@/lib/http-client'

export default function ShoppingPage() {
    const { slug } = useParams()
    const [category, setCategory] = useState<Category | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchCategories() {
            try {
                setIsLoading(true)
                const categoriesData: Category[] = await get('/categories')
                setCategories(categoriesData)

                if (!slug) {
                    setIsLoading(false)
                    return
                }

                const foundCategory = categoriesData.find((cat: Category) => cat.slug === slug) || null
                setCategory(foundCategory)
                setIsLoading(false)
            } catch (err) {
                console.error('Error fetching categories:', err)
                setIsLoading(false)
            }
        }

        fetchCategories()
    }, [slug])

    useEffect(() => {
        if (slug && category) {
            document.title = `${category.name} | ViệtFood Shopping`
        } else {
            document.title = 'Thực đơn | ViệtFood Shopping'
        }
    }, [category, slug])

    const pageTitle = category ? category.name : 'Thực Đơn ViệtFood'
    const pageDescription = category
        ? `Khám phá các món ${category.name.toLowerCase()} truyền thống và hiện đại của chúng tôi`
        : 'Khám phá thực đơn đa dạng với các món ăn Việt Nam truyền thống và hiện đại'

    return (
        <div className="bg-light min-h-screen">
            <div className="relative bg-gradient-to-r from-primary to-primary/80 text-white">
                <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] opacity-10"></div>
                <div className="container mx-auto px-4 py-12 relative z-10">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">
                                        <span className="text-white/80 hover:text-white">Trang chủ</span>
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-white/60" />
                            {slug ? (
                                <>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link href="/menu">
                                                <span className="text-white/80 hover:text-white">Thực đơn</span>
                                            </Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="text-white/60" />
                                    <BreadcrumbItem>
                                        <span className="text-white">{isLoading ? 'Đang tải...' : category?.name}</span>
                                    </BreadcrumbItem>
                                </>
                            ) : (
                                <BreadcrumbItem>
                                    <span className="text-white">Thực đơn</span>
                                </BreadcrumbItem>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>

                    <h1 className="text-3xl md:text-4xl font-bold mb-3">{pageTitle}</h1>
                    <p className="text-white/90 max-w-2xl">{pageDescription}</p>

                    {category && (
                        <div className="flex items-center mt-4">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                                <i className={`fas fa-${category.imageUrl || 'utensils'} text-white`}></i>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <DishList
                    _id={category?._id}
                    initialFilters={{
                        minPrice: 0,
                        maxPrice: 500000,
                    }}
                    categories={categories}
                />
            </div>
        </div>
    )
}
