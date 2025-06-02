import { useState, useEffect } from 'react'
import { useParams } from 'wouter'
import { DishList } from '@/components/shop/DishList'
import { Category } from '@/types/schema'
import { get } from '@/lib/axiosClient'

export default function NormalShoppingPage() {
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
                    setCategory(null)
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


    return (
        <div className="bg-light min-h-screen">
            <div className="container mx-auto px-4 py-12">
                {!isLoading && (
                    <DishList
                        _id={category?._id}
                        initialFilters={{
                            minPrice: 0,
                            maxPrice: 500000,
                        }}
                        categories={categories}
                    />
                )}
            </div>
        </div>
    )
}
