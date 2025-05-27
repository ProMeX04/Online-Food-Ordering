import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface Order {
    _id: string
    userId: {
        username: string
        email: string
    }
    orderItems: Array<{
        dishId: {
            name: string
            price: number
        }
        quantity: number
        price: number
    }>
    totalAmount: number
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    createdAt: string
    updatedAt: string
    notes: string
    address: {
        fullName: string
        phone: string
        city: string
        district: string
        ward: string
        street?: string
        note?: string
    }
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/admin/orders')
            if (!response.ok) throw new Error('Failed to fetch orders')
            const data = await response.json()
            setOrders(data) 

            
        } catch (error) {
            toast.error('Không thể tải danh sách đơn hàng')
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) throw new Error('Failed to update order status')

            toast.success('Cập nhật trạng thái đơn hàng thành công')
            fetchOrders() // Refresh orders list
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái đơn hàng')
        }
    }

    const getStatusColor = (status: Order['status']) => {
        const colors = {
            pending: 'bg-yellow-500',
            processing: 'bg-blue-500',
            shipped: 'bg-purple-500',
            delivered: 'bg-green-500',
            cancelled: 'bg-red-500',
        }
        return colors[status]
    }

    const getStatusText = (status: Order['status']) => {
        const texts = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy',
        }
        return texts[status]
    }

    if (loading) {
        return <div className="flex items-center justify-center h-96">Đang tải...</div>
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã đơn</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày đặt</TableHead>
                            <TableHead>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell className="font-medium">{order._id.slice(-6)}</TableCell>
                                <TableCell>
                                    <div>
                                        <p>{order.address.fullName}</p>
                                        <p className="text-sm text-gray-500">{order.address.phone}</p>
                                    </div>
                                </TableCell>
                                <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                                </TableCell>
                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {order.status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => updateOrderStatus(order._id, 'processing')}>
                                                    Xác nhận
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order._id, 'cancelled')}>
                                                    Hủy
                                                </Button>
                                            </>
                                        )}
                                        {order.status === 'processing' && (
                                            <Button size="sm" onClick={() => updateOrderStatus(order._id, 'shipped')}>
                                                Giao hàng
                                            </Button>
                                        )}
                                        {order.status === 'shipped' && (
                                            <Button size="sm" onClick={() => updateOrderStatus(order._id, 'delivered')}>
                                                Hoàn thành
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
