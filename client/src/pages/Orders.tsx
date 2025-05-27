import { useState, useEffect } from 'react'
import { get } from '@/lib'
import { IOrder, OrderStatus } from '@/types/schema'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib'
import { Link } from 'wouter'
import { Loader2, ChevronRight } from 'lucide-react'

const Orders = () => {
    const [orders, setOrders] = useState<IOrder[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        document.title = 'Lịch sử mua sắm | ViệtFood'
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setIsLoading(true)
            const response = await get<IOrder[]>('/orders/user')
            setOrders(response)
        } catch (error) {
            console.error('Error fetching orders:', error)
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Lịch Sử Mua Sắm</h1>

            {orders.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-lg mb-4">Bạn chưa có đơn hàng nào.</p>
                    <Link href="/menu">
                        <Button>Mua sắm ngay</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Link key={order._id} href={`/orders/${order._id}`}>
                            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="flex flex-col md:flex-row justify-between mb-4">
                                    <div>
                                        <p className="font-medium">
                                            Mã đơn hàng: <span className="text-primary">#{order._id}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">Ngày đặt: {new Date(order.createdAt || '').toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="mt-2 md:mt-0 flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>

                                <div className="border-t border-b py-4 my-4">
                                    {order.orderItems.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center mb-2">
                                            <div>
                                                <span className="font-medium">{item.quantity}x</span> {item.dishId}
                                            </div>
                                            <div>{formatCurrency(item.price * item.quantity)}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm">
                                            Giao đến: {order.address.fullName} - {order.address.phone}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.city}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Tổng tiền</p>
                                        <p className="font-bold text-lg text-primary">{formatCurrency(order.totalAmount)}</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Orders
