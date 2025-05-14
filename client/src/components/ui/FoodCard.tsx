import { Link } from 'wouter'
import { formatCurrency } from '@/lib'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import { Dish } from '@/types/schema'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface FoodCardProps {
    dish: Dish
}

export const FoodCard = ({ dish }: FoodCardProps) => {
    const [isFavorite, setIsFavorite] = useState(false)
    const { addToCart } = useCart()

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsFavorite(!isFavorite)
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart({
            id: String(dish._id),
            name: dish.name,
            price: Number(dish.price),
            imageUrl: dish.imageUrl,
            quantity: 1,
        })
    }

    return (
        <div className="food-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-neutral/10 overflow-hidden h-full flex flex-col">
            <Link href={`/dish/${dish._id}`} className="flex flex-col h-full">
                <div className="relative">
                    <img src={`${dish.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80`} alt={dish.name} className="w-full h-48 object-cover" />
                    <div className="absolute top-3 right-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border-0 ${isFavorite ? 'text-primary' : 'text-neutral/70'}`}
                            onClick={toggleFavorite}
                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                        </Button>
                    </div>

                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {dish.isPopular && (
                            <Badge variant="default" className="bg-primary text-white font-normal">
                                <i className="fas fa-fire-alt mr-1 text-xs"></i> Bán chạy
                            </Badge>
                        )}
                        {dish.isNewDish && (
                            <Badge variant="default" className="bg-accent text-white font-normal">
                                <i className="fas fa-certificate mr-1 text-xs"></i> Mới
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-medium text-lg mb-2 line-clamp-1">{dish.name}</h3>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                    key={star}
                                    className={`text-sm ${star <= Math.floor(Number(dish.rating)) ? 'fas fa-star' : star - 0.5 <= Number(dish.rating) ? 'fas fa-star-half-alt' : 'far fa-star'}`}
                                ></i>
                            ))}
                        </div>
                        <span className="text-xs ml-2 text-neutral/60">({dish.soldCount})</span>
                    </div>

                    <p className="text-sm text-neutral/70 mb-4 line-clamp-2">{dish.description}</p>

                    <div className="mt-auto pt-3 border-t border-neutral/10">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-lg">
                                {formatCurrency(Number(dish.price))}
                            </span>
                            <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10 hover:text-primary" onClick={handleAddToCart}>
                                <i className="fas fa-plus mr-1 text-xs"></i> Thêm vào giỏ
                            </Button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}
