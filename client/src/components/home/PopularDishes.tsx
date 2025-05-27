import React, { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { Button } from '@/components/ui/button'
import { FoodCard } from '@/components/ui/FoodCard'
import { Dish } from '@/types/schema'
import { get } from '@/lib/axiosClient'

const PopularDishes: React.FC = () => {
    const [filter, setFilter] = useState<'popular' | 'new'>('popular')
    const [dishes, setDishes] = useState<Dish[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDishes = async () => {
            setIsLoading(true)
            setError(null)

            try {
                let response: any
                if (filter === 'popular') {
                    response = await get('/dishes/popular')
                } else {
                    response = await get('/dishes/new')
                }

                const dishesData = response.items || []

                setDishes(dishesData)
            } catch (err) {
                console.error('Error fetching dishes:', err)
                setError('Không thể tải dữ liệu món ăn. Vui lòng thử lại sau.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchDishes()
    }, [filter])

    return (
        <section className="py-16 container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Món Ăn Của Chúng Tôi</h2>
                <div className="space-x-2">
                    <Button variant={filter === 'popular' ? 'default' : 'outline'} onClick={() => setFilter('popular')} className="rounded-full">
                        Phổ Biến
                    </Button>
                    <Button variant={filter === 'new' ? 'default' : 'outline'} onClick={() => setFilter('new')} className="rounded-full">
                        Mới
                    </Button>
                    <Link href="/menu">
                        <Button variant="link" className="text-primary">
                            Xem Tất Cả
                        </Button>
                    </Link>
                </div>
            </div>

            {isLoading && (
                <div className="text-center py-8">
                    <i className="fas fa-spinner fa-spin text-xl text-primary"></i>
                    <p className="mt-2">Đang tải...</p>
                </div>
            )}

            {error && (
                <div className="text-center py-8">
                    <i className="fas fa-exclamation-triangle text-xl text-red-500"></i>
                    <p className="mt-2">{error}</p>
                </div>
            )}

            {!isLoading && !error && dishes.length === 0 && (
                <div className="text-center py-8">
                    <p>Không có món ăn nào.</p>
                </div>
            )}

            {!isLoading && !error && dishes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dishes.map((dish) => (
                        <FoodCard key={dish._id} dish={dish} />
                    ))}
                </div>
            )}
        </section>
    )
}

export default PopularDishes
