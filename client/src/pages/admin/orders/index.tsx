import { useState, useEffect } from 'react'
import { get, put } from '@/lib'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { Loader2, Search } from 'lucide-react'
import AdminLayout from '@/pages/admin/AdminLayout'
import { IAddress } from '@/types/address'
import { OrderStatus } from '@/types/schema'
import InfiniteScroll from 'react-infinite-scroll-component'

interface OrderItem {
    _id: string
    dishId: {
        _id: string
        name: string
        price: number
        imageUrl: string
    }
    quantity: number
    price: number
}

interface Order {
    _id: string
    orderNumber: string
    userId: string
    orderItems: OrderItem[]
    totalAmount: number
    address: IAddress
    status: OrderStatus
    createdAt: string
    updatedAt: string
}

const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
}

const statusTranslations: Record<OrderStatus, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [currentStatus, setCurrentStatus] = useState<OrderStatus>(OrderStatus.PENDING)
    const [isUpdating, setIsUpdating] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [limit] = useState(10)
    const [hasMore, setHasMore] = useState(true)

    const fetchOrders = async (pageToFetch: number) => {
        try {
            setIsLoading(true)
            const response = await get<{ items: Order[]; total: number; totalPages: number }>(
                `/orders?page=${pageToFetch}&limit=${limit}&status=${currentStatus}${searchQuery ? `&searchTerm=${searchQuery}` : ''}`,
            )

            setOrders((prevOrders) => (pageToFetch === 1 ? response.items : [...prevOrders, ...response.items]))
            setTotal(response.total)
            setHasMore(pageToFetch < response.totalPages)

        } catch (error) {
            toast.error('Không thể tải danh sách đơn hàng')
            setHasMore(false)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setCurrentPage(1)
        setOrders([])
        setHasMore(true)
    }, [currentStatus, searchQuery])

    useEffect(() => {
        fetchOrders(currentPage)
    }, [currentPage, currentStatus, searchQuery, limit, isUpdating])

    const loadMoreOrders = () => {
        if (!hasMore || isLoading) return
        setCurrentPage((prevPage) => prevPage + 1)
    }

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        try {
            setIsUpdating(true)
            await put(`/orders/${orderId}`, { status })
            toast.success('Cập nhật trạng thái đơn hàng thành công')
            setCurrentPage(1)
            setSelectedOrder(null)
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <AdminLayout>
            <Card className="shadow-sm border-0">
                <CardHeader className="pb-3">
                    <CardTitle>Quản lý đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex space-x-2">
                            {Object.entries(statusTranslations).map(([status, label]) => (
                                <Button key={status} variant={currentStatus === status ? 'default' : 'outline'} onClick={() => setCurrentStatus(status as OrderStatus)}>
                                    {label}
                                </Button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Tìm kiếm theo mã đơn, tên khách hàng hoặc số điện thoại..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>

                        <div className="rounded-md border">
                            <div id="orders-table" className="max-h-[600px] overflow-auto">
                                <InfiniteScroll
                                    dataLength={orders.length}
                                    next={loadMoreOrders}
                                    hasMore={hasMore}
                                    loader={
                                        <div className="text-center py-4">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                            <p className="mt-2 text-neutral/70">Đang tải thêm đơn hàng...</p>
                                        </div>
                                    }
                                    endMessage={<p className="text-center text-neutral/60 py-4">{orders.length > 0 ? 'Đã hiển thị tất cả đơn hàng' : 'Không có đơn hàng nào'}</p>}
                                    scrollThreshold="50px"
                                    scrollableTarget="orders-table"
                                    style={{ overflow: 'visible' }}
                                >
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Mã đơn</TableHead>
                                                <TableHead>Khách hàng</TableHead>
                                                <TableHead>Món ăn</TableHead>
                                                <TableHead>Tổng tiền</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead>Ngày đặt</TableHead>
                                                <TableHead className="text-center">Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.map((order) => (
                                                <TableRow key={order._id}>
                                                    <TableCell className="font-medium">{order._id}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p>{order.address.fullName}</p>
                                                            <p className="text-sm text-gray-500">{order.address.phone}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-h-20 overflow-y-auto">
                                                            {order.orderItems.map((item) => (
                                                                <div key={item._id} className="text-sm">
                                                                    {item.dishId.name} x {item.quantity}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        }).format(order.totalAmount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[order.status]}>{statusTranslations[order.status]}</Badge>
                                                    </TableCell>
                                                    <TableCell>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center gap-2">
                                                            {order.status === 'pending' && (
                                                                <>
                                                                    <Button variant="default" size="sm" onClick={() => handleStatusChange(order._id, OrderStatus.PROCESSING)} disabled={isUpdating}>
                                                                        Xác nhận
                                                                    </Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => handleStatusChange(order._id, OrderStatus.CANCELLED)} disabled={isUpdating}>
                                                                        Từ chối
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {order.status === 'processing' && (
                                                                <Button variant="default" size="sm" onClick={() => handleStatusChange(order._id, OrderStatus.SHIPPED)} disabled={isUpdating}>
                                                                    Giao hàng
                                                                </Button>
                                                            )}
                                                            {order.status === 'shipped' && (
                                                                <Button variant="default" size="sm" onClick={() => handleStatusChange(order._id, OrderStatus.DELIVERED)} disabled={isUpdating}>
                                                                    Đã giao
                                                                </Button>
                                                            )}
                                                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                                Chi tiết
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </InfiniteScroll>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-neutral/70 text-center">{!isLoading && <>{`Tổng số: ${total} đơn hàng`}</>}</div>
                    </div>
                </CardContent>
            </Card>

            {selectedOrder && (
                <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Chi tiết đơn hàng #{selectedOrder._id}</DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                                <h3 className="font-medium mb-2">Thông tin khách hàng</h3>
                                <p>Tên: {selectedOrder.address.fullName}</p>
                                <p>SĐT: {selectedOrder.address.phone}</p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Địa chỉ giao hàng</h3>
                                <p>
                                    {selectedOrder.address.street}, {selectedOrder.address.ward}, {selectedOrder.address.district}, {selectedOrder.address.city}
                                </p>
                            </div>
                        </div>

                        <div className="py-2">
                            <h3 className="font-medium mb-2">Trạng thái đơn hàng</h3>
                            <div className="flex items-center gap-2">
                                <Badge className={statusColors[selectedOrder.status]}>{statusTranslations[selectedOrder.status]}</Badge>
                                <Select
                                    onValueChange={(value) => {
                                        if (isUpdating) return
                                        handleStatusChange(selectedOrder._id, value as OrderStatus)
                                    }}
                                    defaultValue={selectedOrder.status}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Cập nhật trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                                        <SelectItem value="processing">Đang xử lý</SelectItem>
                                        <SelectItem value="shipped">Đang giao hàng</SelectItem>
                                        <SelectItem value="delivered">Đã giao hàng</SelectItem>
                                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                            </div>
                        </div>

                        <div className="py-2">
                            <h3 className="font-medium mb-2">Danh sách món ăn</h3>
                            <div className="border rounded-md">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Món ăn</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedOrder.orderItems.map((item) => (
                                            <tr key={item._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{item.dishId.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    }).format(item.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    }).format(item.price * item.quantity)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end text-lg font-bold pt-4">
                            Tổng:{' '}
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(selectedOrder.totalAmount)}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                                Đóng
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </AdminLayout>
    )
}
