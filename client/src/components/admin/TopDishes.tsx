import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface TopDishesProps {
    data: {
        _id: string
        name: string
        image: string
        totalOrders: number
        totalRevenue: number
    }[]
}

export function TopDishes({ data }: TopDishesProps) {
    return (
        <div className="space-y-8">
            {data.map((dish) => (
                <div key={dish._id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={dish.image} alt={dish.name} />
                        <AvatarFallback>
                            {dish.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{dish.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {dish.totalOrders} đơn hàng ·{' '}
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(dish.totalRevenue)}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">+{((dish.totalOrders / data.reduce((acc, curr) => acc + curr.totalOrders, 0)) * 100).toFixed(1)}%</div>
                </div>
            ))}
        </div>
    )
}
