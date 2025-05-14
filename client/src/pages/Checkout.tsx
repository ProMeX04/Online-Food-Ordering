import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { formatCurrency, SHIPPING } from '@/lib'
import { useToast } from '@/hooks/use-toast'
import { post } from '@/lib'
import { Link, useLocation } from 'wouter'
import { AddressMap } from '@/components/checkout/AddressMap'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Order } from '@/types/schema'

interface CheckoutFormData {
    customerName: string
    customerEmail: string
    customerPhone: string
    address: string
    coordinates?: [number, number] 
    paymentMethod: 'cod' | 'bank' | 'card'
    notes: string
}

const Checkout = () => {
    const [, setLocation] = useLocation()
    const { cartItems, getCartTotal, clearCart } = useCart()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [orderId, setOrderId] = useState<string | null>(null)
    const [addressTab, setAddressTab] = useState<'text' | 'map'>('text')

    const [formData, setFormData] = useState<CheckoutFormData>({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        address: '',
        coordinates: undefined,
        paymentMethod: 'cod',
        notes: '',
    })

    const cartTotal = getCartTotal()
    const deliveryFee = SHIPPING.DELIVERY_FEE
    const finalTotal = cartTotal + deliveryFee

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleLocationSelect = (location: { address: string; coordinates: [number, number] }) => {
        setFormData((prev) => ({
            ...prev,
            address: location.address,
            coordinates: location.coordinates,
        }))

        toast({
            title: 'Địa chỉ đã được chọn',
            description: 'Địa chỉ giao hàng đã được cập nhật.',
            variant: 'default',
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (cartItems.length === 0) {
            toast({
                title: 'Giỏ hàng trống',
                description: 'Vui lòng thêm món ăn vào giỏ hàng trước khi thanh toán',
                variant: 'destructive',
            })
            return
        }

        if (!formData.customerName || !formData.customerPhone || !formData.address) {
            toast({
                title: 'Thông tin không đầy đủ',
                description: 'Vui lòng điền đầy đủ thông tin giao hàng',
                variant: 'destructive',
            })
            return
        }

        try {
            setIsSubmitting(true)

            const orderData = {
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                address: formData.address,
                coordinates: formData.coordinates,
                total: finalTotal,
                status: 'pending',
                createdAt: new Date().toISOString(),
            }

            const order: Order = await post('/api/orders', orderData)

            // Create order items
            for (const item of cartItems) {
                await post(`/api/orders/${order._id}/items`, {
                    dishId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })
            }

            setOrderId(order._id)
            setShowSuccess(true)
            clearCart()
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        document.title = 'Thanh toán | ViệtFood'

        if (cartItems.length === 0 && !showSuccess) {
            toast({
                title: 'Giỏ hàng trống',
                description: 'Vui lòng thêm món ăn vào giỏ hàng trước khi thanh toán',
            })
            setLocation('/menu')
        }
    }, [cartItems.length, showSuccess, toast, setLocation])

    if (showSuccess) {
        return (
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <Card className="max-w-2xl mx-auto p-8 text-center">
                        <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6">
                            <i className="fas fa-check text-white text-3xl"></i>
                        </div>
                        <h1 className="font-bold text-3xl text-neutral mb-4">Đặt Hàng Thành Công!</h1>
                        <p className="text-lg mb-6">Cảm ơn bạn đã đặt hàng tại ViệtFood. Đơn hàng của bạn đã được ghi nhận và sẽ được xử lý trong thời gian sớm nhất.</p>

                        <div className="mb-8 bg-gray-50 border rounded-md p-4 text-left inline-block">
                            <p className="font-medium">
                                Mã đơn hàng: <span className="text-primary">#{orderId}</span>
                            </p>
                            <p className="font-medium">
                                Tổng thanh toán: <span className="text-primary">{formatCurrency(finalTotal)}</span>
                            </p>
                            <p className="font-medium">
                                Phương thức thanh toán:{' '}
                                <span className="text-primary">
                                    {formData.paymentMethod === 'cod' ? 'Tiền mặt khi nhận hàng' : formData.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thẻ tín dụng/ghi nợ'}
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/">
                                <Button variant="default" size="lg">
                                    <i className="fas fa-home mr-2"></i> Về Trang Chủ
                                </Button>
                            </Link>
                            <Link href="/menu">
                                <Button variant="outline" size="lg">
                                    <i className="fas fa-utensils mr-2"></i> Tiếp Tục Mua Sắm
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="font-bold text-3xl text-center mb-8">
                    Thanh <span className="text-primary">Toán</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Checkout Form */}
                    <div className="lg:w-2/3">
                        <Card className="p-6">
                            <h2 className="font-bold text-xl mb-6">Thông Tin Giao Hàng</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-neutral font-medium mb-2">Họ tên *</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Nguyễn Văn A"
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-neutral font-medium mb-2">Số điện thoại *</label>
                                        <input
                                            type="tel"
                                            name="customerPhone"
                                            value={formData.customerPhone}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="0912 345 678"
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-neutral font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="customerEmail"
                                        value={formData.customerEmail}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="example@email.com"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral font-medium mb-2">Địa chỉ giao hàng *</label>

                                    <Tabs defaultValue="text" className="w-full" value={addressTab} onValueChange={(value) => setAddressTab(value as 'text' | 'map')}>
                                        <TabsList className="mb-4">
                                            <TabsTrigger value="text">Nhập địa chỉ</TabsTrigger>
                                            <TabsTrigger value="map">Chọn trên bản đồ</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="text">
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố"
                                                disabled={isSubmitting}
                                                required
                                            />
                                        </TabsContent>

                                        <TabsContent value="map">
                                            <AddressMap onLocationSelect={handleLocationSelect} defaultAddress={formData.address} />
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <div>
                                    <label className="block text-neutral font-medium mb-2">Ghi chú</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-24"
                                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                        disabled={isSubmitting}
                                    ></textarea>
                                </div>

                                <div>
                                    <h2 className="font-bold text-xl mb-4">Phương Thức Thanh Toán</h2>

                                    <div className="space-y-3">
                                        <div className="border p-4 rounded-md bg-white flex items-center">
                                            <input
                                                type="radio"
                                                id="cod"
                                                name="paymentMethod"
                                                value="cod"
                                                checked={formData.paymentMethod === 'cod'}
                                                onChange={handleChange}
                                                className="mr-3"
                                                disabled={isSubmitting}
                                            />
                                            <label htmlFor="cod" className="flex items-center cursor-pointer flex-1">
                                                <i className="fas fa-money-bill-wave text-green-500 mr-2"></i>
                                                <span>Thanh toán khi nhận hàng (COD)</span>
                                            </label>
                                        </div>

                                        <div className="border p-4 rounded-md bg-white flex items-center">
                                            <input
                                                type="radio"
                                                id="bank"
                                                name="paymentMethod"
                                                value="bank"
                                                checked={formData.paymentMethod === 'bank'}
                                                onChange={handleChange}
                                                className="mr-3"
                                                disabled={isSubmitting}
                                            />
                                            <label htmlFor="bank" className="flex items-center cursor-pointer flex-1">
                                                <i className="fas fa-university text-blue-500 mr-2"></i>
                                                <span>Chuyển khoản ngân hàng</span>
                                            </label>
                                        </div>

                                        <div className="border p-4 rounded-md bg-white flex items-center">
                                            <input
                                                type="radio"
                                                id="card"
                                                name="paymentMethod"
                                                value="card"
                                                checked={formData.paymentMethod === 'card'}
                                                onChange={handleChange}
                                                className="mr-3"
                                                disabled={isSubmitting}
                                            />
                                            <label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                                                <i className="fas fa-credit-card text-purple-500 mr-2"></i>
                                                <span>Thẻ tín dụng/ghi nợ</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <Link href="/menu" className="flex-1">
                                        <Button type="button" variant="outline" size="lg" className="w-full" disabled={isSubmitting}>
                                            <i className="fas fa-arrow-left mr-2"></i> Tiếp tục mua sắm
                                        </Button>
                                    </Link>
                                    <Button type="submit" variant="default" size="lg" className="flex-1" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check mr-2"></i> Hoàn tất đơn hàng
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    <div className="lg:w-1/3">
                        <Card className="p-6 bg-white">
                            <h2 className="font-bold text-xl mb-6">Đơn Hàng Của Bạn</h2>

                            <div className="space-y-4 mb-6">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4">
                                            <div className="h-16 w-16 overflow-hidden rounded-md">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.name}</h4>
                                                <p className="text-sm text-neutral/70">
                                                    {formatCurrency(item.price)} x {item.quantity}
                                                </p>
                                            </div>
                                            <div className="font-bold">{formatCurrency(item.price * item.quantity)}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-neutral/70">Giỏ hàng của bạn đang trống</p>
                                    </div>
                                )}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>{formatCurrency(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí giao hàng:</span>
                                    <span>{formatCurrency(deliveryFee)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Tổng cộng:</span>
                                    <span className="text-primary">{formatCurrency(finalTotal)}</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white mt-6">
                            <h2 className="font-bold text-xl mb-4">Mã Khuyến Mãi</h2>
                            <div className="flex">
                                <input
                                    type="text"
                                    className="border rounded-l-md p-3 flex-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Nhập mã khuyến mãi"
                                    disabled={isSubmitting}
                                />
                                <Button variant="secondary" className="rounded-l-none" disabled={isSubmitting}>
                                    Áp dụng
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
