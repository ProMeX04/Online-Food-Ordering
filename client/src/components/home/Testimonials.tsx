import React from 'react'

interface Testimonial {
    _id: string
    userName: string
    userAvatar?: string
    rating: number
    comment: string
    createdAt: string
}

const Testimonials: React.FC = () => {
    const testimonials: Testimonial[] = [
        {
            _id: '1',
            userName: 'Nguyễn Văn A',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            rating: 5,
            comment: 'Món ăn rất ngon, dịch vụ tuyệt vời. Tôi sẽ quay lại nhiều lần nữa!',
            createdAt: new Date().toISOString(),
        },
        {
            _id: '2',
            userName: 'Trần Thị B',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
            rating: 4.5,
            comment: 'Đồ ăn ngon, giao hàng nhanh, sẽ đặt lại.',
            createdAt: new Date().toISOString(),
        },
        {
            _id: '3',
            userName: 'Lê Văn C',
            userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
            rating: 5,
            comment: 'Tôi đã thử nhiều nhà hàng nhưng đây là nơi tôi yêu thích nhất!',
            createdAt: new Date().toISOString(),
        },
        {
            _id: '4',
            userName: 'Phạm Thị D',
            userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
            rating: 4,
            comment: 'Món ăn đậm đà hương vị Việt Nam. Phục vụ tận tình.',
            createdAt: new Date().toISOString(),
        },
        {
            _id: '5',
            userName: 'Hoàng Văn E',
            userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
            rating: 4.5,
            comment: 'Chất lượng tuyệt vời, giá cả hợp lý. Nhân viên thân thiện.',
            createdAt: new Date().toISOString(),
        },
        {
            _id: '6',
            userName: 'Mai Thị F',
            userAvatar: '',
            rating: 5,
            comment: 'Không gian quán đẹp, món ăn ngon miệng. Sẽ giới thiệu cho bạn bè!',
            createdAt: new Date().toISOString(),
        },
    ]

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Phản hồi từ khách hàng</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Chúng tôi tự hào về chất lượng món ăn và dịch vụ của mình. Hãy đọc những gì khách hàng nói về ViệtFood!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                {testimonial.userAvatar ? (
                                    <img src={testimonial.userAvatar} alt={testimonial.userName} className="w-12 h-12 rounded-full object-cover mr-4" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                        <span className="text-green-600 font-semibold">{testimonial.userName.charAt(0).toUpperCase()}</span>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-gray-800">{testimonial.userName}</h4>
                                    <div className="flex mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">{testimonial.comment}</p>
                            <p className="text-xs text-gray-500 mt-3">{new Date(testimonial.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
