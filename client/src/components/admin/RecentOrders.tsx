import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/types/schema'
import { RecentOrder } from '@/pages/admin'

interface RecentOrdersProps {
    data: RecentOrder[]
}

const statusMap = {
    [OrderStatus.PENDING]: {
        label: 'Chờ xác nhận',
        variant: 'default',
    },
    [OrderStatus.PROCESSING]: {
        label: 'Đã xác nhận',
        variant: 'secondary',
    },
    [OrderStatus.SHIPPED]: {
        label: 'Đang giao hàng',
        variant: 'outline',
    },
    [OrderStatus.DELIVERED]: {
        label: 'Đã giao',
        variant: 'default',
    },
    [OrderStatus.CANCELLED]: {
        label: 'Đã hủy',
        variant: 'destructive',
    },
} as const

export function RecentOrders({ data }: RecentOrdersProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="h-12 px-4 text-left align-middle font-medium">Mã đơn</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Khách hàng</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Ngày đặt</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Trạng thái</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Tổng tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((order) => (
                        <tr key={order._id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">{order._id}</td>
                            <td className="p-4 align-middle">{order.userId.username}</td>
                            <td className="p-4 align-middle">
                                {new Date(order?.createdAt || new Date()).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </td>
                            <td className="p-4 align-middle">
                                <Badge variant={statusMap[order.status].variant}>{statusMap[order.status].label}</Badge>
                            </td>
                            <td className="p-4 align-middle text-right">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(order.totalAmount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
