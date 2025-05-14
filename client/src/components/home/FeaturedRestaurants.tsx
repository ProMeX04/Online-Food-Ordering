import React from 'react'
import { Link } from 'wouter'

/**
 * This component is currently not used in the Home page.
 * Kept for potential future implementation.
 */
const FeaturedRestaurants: React.FC = () => {
    // Static data for restaurants
    const restaurants = [
        {
            id: 1,
            name: 'Nhà hàng Việt Palace',
            image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
            rating: 4.8,
            location: 'Quận 1, TP.HCM',
            cuisine: 'Ẩm thực miền Bắc',
        },
        {
            id: 2,
            name: 'Quán Cơm Ngon',
            image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
            rating: 4.5,
            location: 'Quận 3, TP.HCM',
            cuisine: 'Ẩm thực miền Nam',
        },
        {
            id: 3,
            name: 'Hương Việt Restaurant',
            image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9',
            rating: 4.7,
            location: 'Quận 2, TP.HCM',
            cuisine: 'Ẩm thực miền Trung',
        },
    ]

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Nhà Hàng Đối Tác</h2>
                    <p className="text-gray-600">Những nhà hàng tuyển chọn với chất lượng đảm bảo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant) => (
                        <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                            <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                                <img src={`${restaurant.image}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`} alt={restaurant.name} className="w-full h-48 object-cover" />
                                <div className="p-5">
                                    <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                                    <div className="flex items-center mb-2">
                                        <span className="text-yellow-500 mr-1">
                                            <i className="fas fa-star"></i>
                                        </span>
                                        <span className="text-gray-700">{restaurant.rating}</span>
                                    </div>
                                    <p className="text-gray-600 mb-1">
                                        <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                                        {restaurant.location}
                                    </p>
                                    <p className="text-gray-600">
                                        <i className="fas fa-utensils mr-2 text-primary"></i>
                                        {restaurant.cuisine}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturedRestaurants
