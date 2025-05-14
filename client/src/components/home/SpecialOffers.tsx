import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib'
import { useCart } from '@/context/CartContext'
import { Link } from 'wouter'

interface SimpleOffer {
    _id: string
    name: string
    slug: string
    description: string
    price: number
    discountPrice: number | null
    imageUrl: string
    isNewDish: boolean
}

const SpecialOffers = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const { addToCart } = useCart()

    const offers: SimpleOffer[] = [
        {
            _id: '1',
            name: 'Combo Gia Đình',
            slug: 'combo-gia-dinh',
            description: 'Set ăn cho 4 người với nhiều món đa dạng',
            price: 450000,
            discountPrice: 399000,
            imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979',
            isNewDish: false,
        },
        {
            _id: '2',
            name: 'Combo Đôi',
            slug: 'combo-doi',
            description: 'Set ăn dành cho 2 người với giá ưu đãi',
            price: 250000,
            discountPrice: 220000,
            imageUrl: 'https://images.unsplash.com/photo-1553531889-e6cf4d692b1b',
            isNewDish: false,
        },
        {
            _id: '3',
            name: 'Lẩu Hải Sản',
            slug: 'lau-hai-san',
            description: 'Lẩu hải sản đặc biệt dành cho 3-4 người',
            price: 350000,
            discountPrice: 299000,
            imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
            isNewDish: false,
        },
        {
            _id: '4',
            name: 'Combo Bún Chả',
            slug: 'combo-bun-cha',
            description: 'Combo bún chả đầy đủ kèm nem rán và đồ uống',
            price: 120000,
            discountPrice: 99000,
            imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
            isNewDish: true,
        },
        {
            _id: '5',
            name: 'Combo Phở',
            slug: 'combo-pho',
            description: 'Phở bò tái kèm chả giò và đồ uống',
            price: 130000,
            discountPrice: 110000,
            imageUrl: 'https://images.unsplash.com/photo-1583224874284-0a42a95507eb',
            isNewDish: false,
        },
    ]

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < offers.length - 3 ? prev + 1 : prev))
    }

    const handleAddToCart = (dish: SimpleOffer, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()
        addToCart({
            id: String(dish._id),
            name: dish.name,
            price: Number(dish.discountPrice || dish.price),
            imageUrl: dish.imageUrl,
            quantity: 1,
        })
    }

    return (
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="font-medium text-3xl md:text-4xl text-neutral mb-2">
                        Ưu Đãi <span className="text-primary">Đặc Biệt</span>
                    </h2>
                    <p className="text-neutral/80">Khám phá các ưu đãi hấp dẫn hôm nay</p>
                </div>

                {/* Offers Carousel */}
                <div className="relative">
                    {/* Decorative elements */}
                    <div className="absolute -top-6 -left-6 z-0">
                        <div className="w-12 h-12 bg-secondary rounded-full opacity-50"></div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 z-0">
                        <div className="w-12 h-12 bg-primary rounded-full opacity-50"></div>
                    </div>

                    {/* Carousel Container */}
                    <div className="overflow-x-auto pb-4 scrollbar-hide relative z-10">
                        <div className="flex space-x-4 min-w-max">
                            {offers.slice(currentIndex, currentIndex + 3).map((offer) => (
                                <div key={offer._id} className="w-72">
                                    <Link href={`/dish/${offer.slug}`}>
                                        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral/10 flex flex-col overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                                            <div className="relative h-40 mb-4 overflow-hidden rounded-2xl">
                                                <img
                                                    src={`${offer.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80`}
                                                    alt={offer.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                />
                                                {offer.discountPrice && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="bg-primary text-white font-bold text-sm px-2 py-1 rounded-md inline-block">
                                                            -{Math.round((1 - Number(offer.discountPrice) / Number(offer.price)) * 100)}%
                                                        </span>
                                                    </div>
                                                )}
                                                {offer.isNewDish && !offer.discountPrice && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="bg-accent text-white font-bold text-sm px-2 py-1 rounded-md inline-block">MỚI</span>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-medium text-xl mb-2">{offer.name}</h3>
                                            <p className="text-sm mb-4">{offer.description}</p>
                                            <div className="flex justify-between items-center mt-auto">
                                                <div>
                                                    {offer.discountPrice && <span className="line-through text-neutral/60 mr-2">{formatCurrency(Number(offer.price))}</span>}
                                                    <span className="font-bold text-primary">{formatCurrency(Number(offer.discountPrice || offer.price))}</span>
                                                </div>
                                                <Button size="sm" onClick={(e) => handleAddToCart(offer, e)} className="px-3">
                                                    <i className="fas fa-plus mr-1"></i> Thêm
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Carousel Controls */}
                    {offers.length > 3 && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 bg-white w-10 h-10 rounded-full shadow-md z-20 md:flex hidden"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 bg-white w-10 h-10 rounded-full shadow-md z-20 md:flex hidden"
                                onClick={handleNext}
                                disabled={currentIndex >= offers.length - 3}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export default SpecialOffers
