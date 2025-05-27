import { useState, useEffect } from 'react'
import { get } from '@/lib'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/components/admin/Overview'
import { RecentOrders } from '@/components/admin/RecentOrders'
import { TopDishes } from '@/components/admin/TopDishes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDateRangePicker } from '@/components/admin/DateRangePicker'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import AdminLayout from './AdminLayout'

interface DashboardStats {
    totalOrders: number
    totalRevenue: number
    totalUsers: number
    totalProducts: number
    recentOrders: any[]
    topDishes: any[]
    orderStats: {
        date: string
        total: number
    }[]
}

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Đầu tháng hiện tại
        to: new Date(), // Hiện tại
    })

    const fetchDashboardStats = async () => {
        try {
            setIsLoading(true)
            const response = await get<DashboardStats>('/admin/dashboard', {
                params: {
                    from: dateRange.from.toISOString(),
                    to: dateRange.to.toISOString(),
                },
            })
            setStats(response)
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: 'Không thể tải dữ liệu thống kê',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardStats()
    }, [dateRange])

    if (isLoading || !stats) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
                    <div className="flex items-center space-x-2">
                        <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
                        <Button onClick={fetchDashboardStats}>Làm mới</Button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                        <TabsTrigger value="analytics">Phân tích</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(stats.totalRevenue)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Trong khoảng thời gian đã chọn</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+{stats.totalOrders}</div>
                                    <p className="text-xs text-muted-foreground">Tổng số đơn hàng đã nhận</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+{stats.totalUsers}</div>
                                    <p className="text-xs text-muted-foreground">Tổng số người dùng đã đăng ký</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalProducts}</div>
                                    <p className="text-xs text-muted-foreground">Tổng số món ăn đang bán</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Tổng quan</CardTitle>
                                    <CardDescription>Biểu đồ doanh thu theo thời gian</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <Overview data={stats.orderStats} />
                                </CardContent>
                            </Card>

                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Top sản phẩm bán chạy</CardTitle>
                                    <CardDescription>Các món ăn được đặt nhiều nhất</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TopDishes data={stats.topDishes} />
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Đơn hàng gần đây</CardTitle>
                                <CardDescription>Danh sách các đơn hàng mới nhất trong hệ thống</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentOrders data={stats.recentOrders} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Phân tích doanh thu</CardTitle>
                                    <CardDescription>Phân tích chi tiết doanh thu theo thời gian</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">{/* Thêm biểu đồ phân tích chi tiết ở đây */}</div>
                                </CardContent>
                            </Card>

                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Phân tích người dùng</CardTitle>
                                    <CardDescription>Thông tin về người dùng hệ thống</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">{/* Thêm biểu đồ phân tích người dùng ở đây */}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    )
}
