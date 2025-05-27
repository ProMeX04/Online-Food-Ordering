import { useState, useEffect } from 'react'
import { get, put } from '@/lib'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { Loader2, Search } from 'lucide-react'
import AdminLayout from '@/pages/admin/AdminLayout'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Role } from '@shared/enum'

interface User {
    _id: string
    email: string
    fullName: string
    phone: string
    role: Role
    isActive: boolean
    createdAt: string
    updatedAt: string
}

const statusColors = {
    active: 'bg-green-500',
    blocked: 'bg-red-500',
}

const roleTranslations = {
    admin: 'Quản trị viên',
    user: 'Người dùng',
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [limit] = useState(10)
    const [hasMore, setHasMore] = useState(true)

    const fetchUsers = async (pageToFetch: number) => {
        try {
            setIsLoading(true)
            const response = await get<{ items: User[]; total: number; totalPages: number }>(`/users?page=${pageToFetch}&limit=${limit}${searchQuery ? `&searchTerm=${searchQuery}` : ''}`)

            setUsers((prevUsers) => (pageToFetch === 1 ? response.items : [...prevUsers, ...response.items]))
            setTotal(response.total)
            setHasMore(response.items.length > 0 && pageToFetch < response.totalPages)
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: 'Không thể tải danh sách người dùng',
                variant: 'destructive',
            })
            setHasMore(false)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setCurrentPage(1)
        setUsers([])
        setHasMore(true)
    }, [searchQuery])

    useEffect(() => {
        fetchUsers(currentPage)
    }, [currentPage, searchQuery, isUpdating])

    const loadMoreUsers = () => {
        if (!hasMore || isLoading) return
        setCurrentPage((prevPage) => prevPage + 1)
    }

    const handleStatusChange = async (userId: string, isActive: boolean) => {
        try {
            setIsUpdating(true)
            await put(`/users/${userId}`, { isActive: isActive })
            toast({
                title: 'Thành công',
                description: 'Cập nhật trạng thái người dùng thành công',
            })
            setCurrentPage(1)
            setSelectedUser(null)
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: 'Có lỗi xảy ra khi cập nhật trạng thái người dùng',
                variant: 'destructive',
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <AdminLayout>
            <Card className="shadow-sm border-0">
                <CardHeader className="pb-3">
                    <CardTitle>Quản lý người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>

                        <div className="rounded-md border">
                            <div className="max-h-[600px] overflow-auto">
                                <InfiniteScroll
                                    dataLength={users.length}
                                    next={loadMoreUsers}
                                    hasMore={hasMore}
                                    loader={
                                        <div className="text-center py-4">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                            <p className="mt-2 text-neutral/70">Đang tải thêm người dùng...</p>
                                        </div>
                                    }
                                    endMessage={<p className="text-center text-neutral/60 py-4">{users.length > 0 ? 'Đã hiển thị tất cả người dùng' : 'Không có người dùng nào'}</p>}
                                    scrollThreshold="50px"
                                    style={{ overflow: 'visible' }}
                                >
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Vai trò</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead>Ngày tạo</TableHead>
                                                <TableHead className="text-center">Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell className="font-medium">{user._id}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{roleTranslations[user.role]}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[user.isActive ? 'active' : 'blocked']}>{user.isActive ? 'Hoạt động' : 'Đã khóa'}</Badge>
                                                    </TableCell>
                                                    <TableCell>{format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center gap-2">
                                                            {user.role !== 'admin' && (
                                                                <>
                                                                    {user.isActive ? (
                                                                        <Button variant="destructive" size="sm" onClick={() => handleStatusChange(user._id, false)} disabled={isUpdating}>
                                                                            Khóa
                                                                        </Button>
                                                                    ) : (
                                                                        <Button variant="default" size="sm" onClick={() => handleStatusChange(user._id, true)} disabled={isUpdating}>
                                                                            Mở khóa
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                            <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
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

                        <div className="mt-4 text-sm text-neutral/70 text-center">{!isLoading && <>{`Tổng số: ${total} người dùng`}</>}</div>
                    </div>
                </CardContent>
            </Card>

            {selectedUser && (
                <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Chi tiết người dùng #{selectedUser._id}</DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                                <h3 className="font-medium mb-2">Thông tin cơ bản</h3>
                                <p>Email: {selectedUser.email}</p>
                                <p>Số điện thoại: {selectedUser.phone}</p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Thông tin tài khoản</h3>
                                <p>Vai trò: {roleTranslations[selectedUser.role]}</p>
                                <p>Trạng thái: {selectedUser.isActive ? 'Hoạt động' : 'Đã khóa'}</p>
                                <p>Ngày tạo: {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                            </div>
                        </div>

                        <DialogFooter>
                            {selectedUser.role !== 'admin' && (
                                <>
                                    {selectedUser.isActive ? (
                                        <Button variant="destructive" onClick={() => handleStatusChange(selectedUser._id, false)} disabled={isUpdating}>
                                            Khóa tài khoản
                                        </Button>
                                    ) : (
                                        <Button variant="default" onClick={() => handleStatusChange(selectedUser._id, true)} disabled={isUpdating}>
                                            Mở khóa tài khoản
                                        </Button>
                                    )}
                                </>
                            )}
                            <Button variant="outline" onClick={() => setSelectedUser(null)}>
                                Đóng
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </AdminLayout>
    )
}
