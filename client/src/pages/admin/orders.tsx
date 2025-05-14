import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { get, put } from '@/lib/http-client'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import AdminLayout from './AdminLayout'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface OrderItem {
    _id: string
  dishId: {
        _id: string
        name: string
        price: number
        image: string
    }
    quantity: number
    price: number
}

interface Order {
    _id: string
    orderNumber: string
  user: {
        _id: string
        email: string
    profile: {
            fullName: string
            phone: string
        }
    }
    items: OrderItem[]
    totalAmount: number
  shippingAddress: {
        fullName: string
        phone: string
        city: string
        district: string
        ward: string
        street: string
    }
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
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [currentStatus, setCurrentStatus] = useState<OrderStatus | 'all'>('all')
    const [isUpdating, setIsUpdating] = useState(false)

    const {
        data: orders = [],
        isLoading,
        refetch,
    } = useQuery<Order[]>({
        queryKey: ['orders'],
    queryFn: async () => {
            const response = await get<Order[]>('/api/admin/orders')
            return response
    },
    })

    const filteredOrders = currentStatus === 'all' ? orders : orders.filter((order: Order) => order.status === currentStatus)

  const handleViewOrderDetails = (order: Order) => {
        setSelectedOrder(order)
    }

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
            setIsUpdating(true)
            await put(`/api/admin/orders/${orderId}/status`, { status })
            toast.success('Cập nhật trạng thái đơn hàng thành công')
            refetch()
            setSelectedOrder(null)
    } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng')
            console.error(error)
    } finally {
            setIsUpdating(false)
        }
    }

  const columns: ColumnDef<Order>[] = [
    {
            accessorKey: 'orderNumber',
            header: 'Mã đơn hàng',
      cell: ({ row }: { row: any }) => <div>{row.original.orderNumber}</div>,
    },
    {
            accessorKey: 'user.profile.fullName',
            header: 'Khách hàng',
      cell: ({ row }: { row: any }) => <div>{row.original.user.profile.fullName}</div>,
    },
    {
            accessorKey: 'createdAt',
            header: 'Ngày đặt',
      cell: ({ row }: { row: any }) => (
        <div>
                    {format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm', {
            locale: vi,
          })}
        </div>
      ),
    },
    {
            accessorKey: 'status',
            header: 'Trạng thái',
      cell: ({ row }: { row: any }) => {
                const status = row.original.status
                return <Badge className={statusColors[status as OrderStatus]}>{statusTranslations[status as OrderStatus]}</Badge>
      },
    },
    {
            accessorKey: 'totalAmount',
            header: 'Tổng tiền',
      cell: ({ row }: { row: any }) => (
        <div className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
          }).format(row.original.totalAmount)}
        </div>
      ),
    },
    {
            id: 'actions',
      cell: ({ row }: { row: any }) => (
                <Button variant="outline" size="sm" onClick={() => handleViewOrderDetails(row.original)}>
          Chi tiết
        </Button>
      ),
    },
    ]

  const statusCounts = orders.reduce((acc: Record<string, number>, order: Order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        acc.all = (acc.all || 0) + 1
        return acc
    }, {})

  return (
        <AdminLayout>
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

                <Tabs defaultValue="all" onValueChange={(value) => setCurrentStatus(value as OrderStatus | 'all')}>
        <div className="mb-6">
          <TabsList className="grid grid-cols-6">
                            <TabsTrigger value="all">Tất cả ({statusCounts.all || 0})</TabsTrigger>
                            <TabsTrigger value="pending">Chờ xử lý ({statusCounts.pending || 0})</TabsTrigger>
                            <TabsTrigger value="processing">Đang xử lý ({statusCounts.processing || 0})</TabsTrigger>
                            <TabsTrigger value="shipped">Đang giao ({statusCounts.shipped || 0})</TabsTrigger>
                            <TabsTrigger value="delivered">Đã giao ({statusCounts.delivered || 0})</TabsTrigger>
                            <TabsTrigger value="cancelled">Đã hủy ({statusCounts.cancelled || 0})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
                                <DataTable columns={columns} data={filteredOrders} isLoading={isLoading} searchColumn="orderNumber" searchPlaceholder="Tìm theo mã đơn hàng..." />
            </CardContent>
          </Card>
        </TabsContent>

                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <TabsContent key={status} value={status} className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{statusTranslations[status as OrderStatus]}</CardTitle>
              </CardHeader>
              <CardContent>
                                    <DataTable columns={columns} data={filteredOrders} isLoading={isLoading} searchColumn="orderNumber" searchPlaceholder="Tìm theo mã đơn hàng..." />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng #{selectedOrder.orderNumber}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="font-medium mb-2">Thông tin khách hàng</h3>
                <p>Tên: {selectedOrder.shippingAddress.fullName}</p>
                <p>SĐT: {selectedOrder.shippingAddress.phone}</p>
                <p>Email: {selectedOrder.user.email}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Địa chỉ giao hàng</h3>
                <p>
                  {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}
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
                    {selectedOrder.items.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                                                                <img className="h-10 w-10 rounded-md object-cover" src={item.dishId.image} alt={item.dishId.name} />
                            </div>
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
    </div>
        </AdminLayout>
    )
} 
