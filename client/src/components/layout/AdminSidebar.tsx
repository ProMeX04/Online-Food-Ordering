import { useLocation, useRoute } from 'wouter'
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarSeparator } from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Home, Package, List, PlusCircle, Settings, Grid, BarChart, Archive, Users } from 'lucide-react'

export default function AdminSidebar() {
    const [, navigate] = useLocation()
    const [isAdminRoute] = useRoute('/admin/:path*')

    return (
        <div className="h-[calc(100vh-3.5rem)] w-64 border-r bg-white flex-shrink-0 overflow-hidden">
            <Sidebar className="h-full">
                <SidebarHeader className="border-b pb-2 pt-3">
                    <div className="flex items-center space-x-2 px-4">
                        <span className="text-base font-semibold">Quản lý</span>
                    </div>
                </SidebarHeader>
                <SidebarContent className="h-full">
                    <ScrollArea className="h-[calc(100vh-8rem)]">
                        <SidebarGroup>
                            <SidebarGroupLabel>Chung</SidebarGroupLabel>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => navigate('/admin')} isActive={isAdminRoute && !window.location.pathname.split('/admin/')[1]}>
                                        <Home className="w-4 h-4" />
                                        <span>Tổng quan</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => navigate('/admin/statistics')} isActive={window.location.pathname === '/admin/statistics'}>
                                        <BarChart className="w-4 h-4" />
                                        <span>Thống kê</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>Quản lý sản phẩm</SidebarGroupLabel>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => navigate('/admin/products')} isActive={window.location.pathname === '/admin/products'}>
                                        <Package className="w-4 h-4" />
                                        <span>Danh sách món ăn</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => navigate('/admin/products/new')} isActive={window.location.pathname === '/admin/products/new'}>
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Thêm món ăn</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => navigate('/admin/categories')} isActive={window.location.pathname === '/admin/categories'}>
                                        <List className="w-4 h-4" />
                                        <span>Danh mục</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>Quản lý cửa hàng</SidebarGroupLabel>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => navigate('/admin/branches')} isActive={window.location.pathname === '/admin/branches'}>
                                        <Grid className="w-4 h-4" />
                                        <span>Chi nhánh</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => navigate('/admin/orders')} isActive={window.location.pathname === '/admin/orders'}>
                                        <Archive className="w-4 h-4" />
                                        <span>Đơn hàng</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => navigate('/admin/users')} isActive={window.location.pathname === '/admin/users'}>
                                        <Users className="w-4 h-4" />
                                        <span>Người dùng</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>Cài đặt</SidebarGroupLabel>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => navigate('/admin/settings')} isActive={window.location.pathname === '/admin/settings'}>
                                        <Settings className="w-4 h-4" />
                                        <span>Thiết lập</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    </ScrollArea>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarSeparator />
                    <div className="p-2 text-xs text-center text-muted-foreground">© {new Date().getFullYear()} Vietnamese Food</div>
                </SidebarFooter>
            </Sidebar>
        </div>
    )
}
