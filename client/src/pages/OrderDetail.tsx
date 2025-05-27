import { useState, useEffect } from 'react'
import { useParams, Link } from 'wouter'
import { get } from '@/lib'
import {  OrderStatus, Dish } from '@/types/schema'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib'
import { Loader2, ArrowLeft, MapPin, CreditCard } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { IAddress } from '@/types/address'
import { SHIPPING } from '@/lib'

interface IOrderItem {
    dishId: Dish
    quantity: number
    price: number
}

interface IOrderDetail {
    orderItems: IOrderItem[]
    address: IAddress
    notes: string
    totalAmount: number
    status: OrderStatus
    createdAt: string
    updatedAt: string
}

const OrderDetail = () => {
    const { orderId } = useParams()
    const [order, setOrder] = useState<IOrderDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchOrderDetail()
    }, [orderId])

    const fetchOrderDetail = async () => {
        try {
            setIsLoading(true)
            const response = await get<IOrderDetail>(`/orders/detail/${orderId}`)
            setOrder(response)
            document.title = `Đơn hàng #${orderId} | ViệtFood`
        } catch (error) {
            console.error('Error fetching order:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'text-yellow-600 bg-yellow-50'
            case OrderStatus.PROCESSING:
                return 'text-blue-600 bg-blue-50'
            case OrderStatus.SHIPPED:
                return 'text-purple-600 bg-purple-50'
            case OrderStatus.DELIVERED:
                return 'text-green-600 bg-green-50'
            case OrderStatus.CANCELLED:
                return 'text-red-600 bg-red-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const getStatusText = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'Chờ xác nhận'
            case OrderStatus.PROCESSING:
                return 'Đang xử lý'
            case OrderStatus.SHIPPED:
                return 'Đang giao hàng'
            case OrderStatus.DELIVERED:
                return 'Đã giao hàng'
            case OrderStatus.CANCELLED:
                return 'Đã hủy'
            default:
                return status
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                    <p className="text-lg mb-4">Không tìm thấy thông tin đơn hàng.</p>
                    <Link href="/orders">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link href="/orders">
                        <Button variant="ghost" className="mr-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Chi tiết đơn hàng #{orderId}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Thông tin đơn hàng */}
                    <Card className="md:col-span-2 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Thông tin đơn hàng</h2>
                                <p className="text-sm text-gray-500">
                                    Đặt ngày:{' '}
                                    {new Date(order.createdAt || '').toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                        </div>

                        <div className="space-y-4">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-md overflow-hidden">
                                            <img src={item.dishId
                                                .imageUrl} alt={item.dishId.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{item.dishId.name}</h3>
                                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                            <p className="text-sm text-primary">{formatCurrency(item.price)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Tạm tính</span>
                                <span>{formatCurrency(order.totalAmount - SHIPPING.DELIVERY_FEE)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Phí giao hàng</span>
                                <span>{formatCurrency(SHIPPING.DELIVERY_FEE)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                                <span>Tổng cộng</span>
                                <span className="text-lg text-primary">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-6">
                        <div>
                            <div className="flex items-center mb-4">
                                <MapPin className="w-5 h-5 mr-2 text-primary" />
                                <h2 className="text-lg font-semibold">Địa chỉ giao hàng</h2>
                            </div>
                            <div className="text-sm space-y-2">
                                <p className="font-medium">{order.address.fullName}</p>
                                <p>{order.address.phone}</p>
                                <p className="text-gray-600">
                                    {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.city}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="flex items-center mb-4">
                                <CreditCard className="w-5 h-5 mr-2 text-primary" />
                                <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
                            </div>
                            <p className="text-sm">Thanh toán khi nhận hàng (COD)</p>
                        </div>

                        {order.notes && (
                            <>
                                <Separator />
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Ghi chú</h2>
                                    <p className="text-sm text-gray-600">{order.notes}</p>
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default OrderDetail
