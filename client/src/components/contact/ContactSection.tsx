import { CartoonButton } from '@/components/ui/CartoonButton'
import { useToast } from '@/hooks/use-toast'
import { useState, FormEvent } from 'react'
import { post } from '@/lib'

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!formData.name || !formData.phone || !formData.email || !formData.message) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng điền đầy đủ thông tin',
                variant: 'destructive',
            })
            return
        }

        try {
            setIsSubmitting(true)

            await post('/api/contact', formData)

            toast({
                title: 'Gửi liên hệ thành công!',
                description: 'Chúng tôi sẽ liên hệ với bạn sớm nhất có thể',
            })

            setFormData({
                name: '',
                phone: '',
                email: '',
                message: '',
            })
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: 'Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section id="contact" className="py-12 bg-light">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Contact Form */}
                    <div className="lg:w-1/2">
                        <h2 className="font-baloo font-bold text-3xl md:text-4xl text-neutral mb-2">
                            Liên Hệ <span className="text-primary">Với Chúng Tôi</span>
                        </h2>
                        <p className="text-neutral/80 mb-6">Hãy gửi thông tin để được hỗ trợ nhanh chóng</p>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral font-medium mb-2">Họ tên</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="cartoon-border w-full p-3 focus:outline-none"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-neutral font-medium mb-2">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="cartoon-border w-full p-3 focus:outline-none"
                                        placeholder="0912 345 678"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="cartoon-border w-full p-3 focus:outline-none"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label className="block text-neutral font-medium mb-2">Nội dung</label>
                                <textarea
                                    name="message"
                                    className="cartoon-border w-full p-3 h-32 focus:outline-none"
                                    placeholder="Nhập nội dung liên hệ..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                ></textarea>
                            </div>

                            <CartoonButton type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang gửi...' : 'Gửi Liên Hệ'}
                            </CartoonButton>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:w-1/2 flex flex-col justify-between">
                        <div>
                            <h2 className="font-baloo font-bold text-3xl md:text-4xl text-neutral mb-2">
                                Thông Tin <span className="text-primary">Cửa Hàng</span>
                            </h2>
                            <p className="text-neutral/80 mb-6">Ghé thăm chúng tôi tại cửa hàng hoặc liên hệ qua các kênh sau</p>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <CartoonButton className="bg-accent h-12 w-12 flex items-center justify-center text-white mr-4">
                                        <i className="fas fa-map-marker-alt text-xl"></i>
                                    </CartoonButton>
                                    <div>
                                        <h3 className="font-baloo font-medium text-lg">Địa chỉ</h3>
                                        <p>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <CartoonButton className="bg-primary h-12 w-12 flex items-center justify-center text-white mr-4">
                                        <i className="fas fa-phone-alt text-xl"></i>
                                    </CartoonButton>
                                    <div>
                                        <h3 className="font-baloo font-medium text-lg">Điện thoại</h3>
                                        <p>0912 345 678</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <CartoonButton className="bg-yellow-500 h-12 w-12 flex items-center justify-center text-white mr-4">
                                        <i className="fas fa-envelope text-xl"></i>
                                    </CartoonButton>
                                    <div>
                                        <h3 className="font-baloo font-medium text-lg">Email</h3>
                                        <p>info@vietfood.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <CartoonButton className="bg-info h-12 w-12 flex items-center justify-center text-white mr-4">
                                        <i className="fas fa-clock text-xl"></i>
                                    </CartoonButton>
                                    <div>
                                        <h3 className="font-baloo font-medium text-lg">Giờ mở cửa</h3>
                                        <p>Hàng ngày: 9:00 - 22:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="mt-8">
                            <h3 className="font-baloo font-medium text-lg mb-4">Theo dõi chúng tôi</h3>
                            <div className="flex space-x-3">
                                <CartoonButton className="bg-light h-12 w-12 flex items-center justify-center text-neutral hover:bg-secondary hover:text-white transition">
                                    <i className="fab fa-facebook-f text-xl"></i>
                                </CartoonButton>
                                <CartoonButton className="bg-light h-12 w-12 flex items-center justify-center text-neutral hover:bg-secondary hover:text-white transition">
                                    <i className="fab fa-instagram text-xl"></i>
                                </CartoonButton>
                                <CartoonButton className="bg-light h-12 w-12 flex items-center justify-center text-neutral hover:bg-secondary hover:text-white transition">
                                    <i className="fab fa-tiktok text-xl"></i>
                                </CartoonButton>
                                <CartoonButton className="bg-light h-12 w-12 flex items-center justify-center text-neutral hover:bg-secondary hover:text-white transition">
                                    <i className="fab fa-youtube text-xl"></i>
                                </CartoonButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactSection
