import { useParams, Link } from 'wouter'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/lib'
import { Dish } from '@/types/schema'
import { FoodCard } from '@/components/ui/FoodCard'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { get } from '@/lib'
const DishDetail = () => {
    const { _id } = useParams()
    const { addToCart } = useCart()
    const [quantity, setQuantity] = useState<number>(1)
    const [showFullDescription, setShowFullDescription] = useState(false)
    const [isDishLoading, setIsDishLoading] = useState(true)
    const [isSimilarLoading, setIsSimilarLoading] = useState(true)
    const [dish, setDish] = useState<Dish | null>(null)
    const [similarDishes, setSimilarDishes] = useState<Dish[]>([])

    useEffect(() => {
        const fetchDishDetails = async () => {
            if (!_id) return

            setIsDishLoading(true)
            try {
                const dishResponse: Dish = await get(`/dishes/${_id}`)
                setDish(dishResponse)
            } catch (error) {
                console.error('Error fetching dish details:', error)
                setDish(null)
            } finally {
                setIsDishLoading(false)
            }
        }

        fetchDishDetails()
    }, [_id])

    useEffect(() => {
        const fetchSimilarDishes = async () => {
            if (!dish) return

            setIsSimilarLoading(true)
            try {
                const dishes: Dish[] = await get(`/dishes/similar/${dish._id}?category=${dish.category}`)
                setSimilarDishes(dishes)
            } catch (error) {
                setSimilarDishes([])
            } finally {
                setIsSimilarLoading(false)
            }
        }

        fetchSimilarDishes()
    }, [dish])

    const incrementQuantity = () => {
        setQuantity((prev) => prev + 1)
    }

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1)
        }
    }

    const handleAddToCart = () => {
        if (dish) {
            addToCart({
                id: String(dish._id),
                name: dish.name,
                price: Number(dish.price),
                imageUrl: dish.imageUrl,
                quantity: quantity,
            })
        }
    }

    useEffect(() => {
        if (dish) {
            document.title = `${dish.name} | ViệtFood`
        } else {
            document.title = 'Chi tiết món ăn | ViệtFood'
        }
    }, [dish])

    if (isDishLoading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                <p>Đang tải thông tin món ăn...</p>
            </div>
        )
    }

    if (!dish) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <Card className="p-8 max-w-md mx-auto">
                    <i className="fas fa-exclamation-triangle text-4xl text-warning mb-4"></i>
                    <h2 className="font-bold text-2xl mb-4">Không tìm thấy món ăn</h2>
                    <p className="mb-6">Món ăn bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                    <Link href="/menu">
                        <Button variant="default" size="lg">
                            Quay lại Thực đơn
                        </Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="bg-light">
            <div className="container mx-auto px-4 py-12">
                <div className="mb-6">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">
                                        <span className="hover:text-primary cursor-pointer">Trang chủ</span>
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/menu">
                                        <span className="hover:text-primary cursor-pointer">Thực đơn</span>
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <span className="text-primary">{dish.name}</span>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 mb-16">
                    <div className="lg:w-1/2">
                        <Card className="overflow-hidden">
                            <img src={dish.imageUrl} alt={dish.name} className="w-full h-auto rounded-lg transform hover:scale-105 transition-transform duration-500" />
                        </Card>

                        <div className="flex flex-wrap gap-3 mt-4">
                            {dish.isPopular && <span className="bg-primary text-white px-3 py-1 text-sm rounded-md">Bán chạy</span>}
                            {dish.isNewDish && <span className="bg-accent text-white px-3 py-1 text-sm rounded-md">Mới</span>}
                        </div>
                    </div>

                    <div className="lg:w-1/2">
                        <h1 className="font-bold text-3xl md:text-4xl text-neutral mb-4">{dish.name}</h1>

                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                        key={star}
                                        className={`${star <= Math.floor(Number(dish.rating)) ? 'fas fa-star' : star - 0.5 <= Number(dish.rating) ? 'fas fa-star-half-alt' : 'far fa-star'}`}
                                    ></i>
                                ))}
                            </div>
                            <span className="text-sm ml-2">({dish.soldCount} đã bán)</span>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <span className="font-bold text-3xl text-primary">{formatCurrency(Number(dish.price))}</span>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-medium text-lg mb-2">Mô tả</h3>
                            <Card className="p-4">
                                <p className={`text-neutral/80 ${!showFullDescription && 'line-clamp-3'}`}>{dish.description}</p>
                                {dish.description.length > 150 && (
                                    <button className="text-primary font-medium mt-2" onClick={() => setShowFullDescription(!showFullDescription)}>
                                        {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                                    </button>
                                )}
                            </Card>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-medium text-lg mb-2">Số lượng</h3>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center border border-gray-200 rounded-md bg-white">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-r-none" onClick={decrementQuantity} disabled={quantity <= 1} aria-label="Decrease quantity">
                                        <i className="fas fa-minus"></i>
                                    </Button>
                                    <span className="w-16 text-center font-medium">{quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-l-none" onClick={incrementQuantity} aria-label="Increase quantity">
                                        <i className="fas fa-plus"></i>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button variant="default" size="lg" className="flex-1" onClick={handleAddToCart}>
                                <i className="fas fa-shopping-cart mr-2"></i> Thêm vào giỏ hàng
                            </Button>
                        </div>
                    </div>
                </div>

                {similarDishes.length > 0 && (
                    <div className="border-t pt-12">
                        <h2 className="font-bold text-2xl mb-6">Sản phẩm tương tự</h2>
                        {isSimilarLoading ? (
                            <div className="text-center py-8">
                                <i className="fas fa-spinner fa-spin text-xl text-primary"></i>
                                <p className="mt-2">Đang tải...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {similarDishes.map((similarDish) => (
                                    <FoodCard key={similarDish._id} dish={similarDish} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DishDetail
