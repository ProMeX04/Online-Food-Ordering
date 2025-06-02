import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { get, del, put } from '@/lib'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Dish, Category } from '@/types/schema'
import { Pencil, Trash2, Search, Plus, Filter } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import AdminLayout from '../AdminLayout'

export default function ProductsPage() {
    const { toast } = useToast()
    const [, setLocation] = useLocation()
    const [dishes, setDishes] = useState<Dish[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchInput, setSearchInput] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [totalItems, setTotalItems] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [sortBy, setSortBy] = useState<string>('-createdAt')
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        const delaySearchTimeout = setTimeout(() => {
            if (searchInput !== searchQuery) {
                setSearchQuery(searchInput)
                setCurrentPage(1)
            }
        }, 800)

        return () => clearTimeout(delaySearchTimeout)
    }, [searchInput, searchQuery])
    const fetchData = async (currentPage: number, itemsPerPage: number, sortBy: string, selectedCategory: string, searchQuery: string) => {
        setIsLoading(true)
        try {
            let queryParams = `?page=${currentPage}&limit=${itemsPerPage}`

            if (sortBy) {
                queryParams += `&sortBy=${sortBy}`
            }

            if (selectedCategory && selectedCategory !== 'all') {
                queryParams += `&category=${selectedCategory}`
            }

            if (searchQuery) {
                queryParams += `&searchTerm=${searchQuery}`
            }

            const response = (await get(`/dishes${queryParams}`)) as {
                items: Dish[]
                total: number
                page: string
                limit: string
                totalPages: number
            }

            setDishes(response.items || [])
            setTotalItems(response.total || 0)
            setCurrentPage(parseInt(response.page) || 1)
            const pages = response.totalPages || Math.ceil((response.total || 0) / parseInt(response.limit))
            if (pages > 0) {
                setTotalPages(pages)
            }

            const categoriesResponse: Category[] = await get('/categories')
            setCategories(categoriesResponse)
        } catch (error) {
            console.error('Error fetching data:', error)
            toast({
                title: 'Lỗi',
                description: 'Không thể tải dữ liệu món ăn. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData(currentPage, itemsPerPage, sortBy, selectedCategory, searchQuery)
    }, [currentPage, itemsPerPage, sortBy, selectedCategory, searchQuery])

    const handleDeleteDish = async (id: string) => {
        try {
            await del(`/dishes/${id}`)
            toast({
                title: 'Xóa thành công',
                description: 'Món ăn đã được xóa thành công',
            })
            setDishes(dishes.filter((dish) => dish._id !== id))
        } catch (error) {
            console.error('Error deleting dish:', error)
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa món ăn. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        }
    }

    const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
        try {
            await put(`/dishes/${id}`, { isAvailable: !isAvailable })
            toast({
                title: 'Cập nhật thành công',
                description: `Món ăn đã được ${!isAvailable ? 'kích hoạt' : 'vô hiệu hóa'} thành công`,
            })
            setDishes(dishes.map((dish) => (dish._id === id ? { ...dish, isAvailable: !isAvailable } : dish)))
        } catch (error) {
            console.error('Error updating dish availability:', error)
            toast({
                title: 'Lỗi',
                description: 'Không thể cập nhật trạng thái món ăn. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const renderPagination = () => {
        if (totalPages <= 1) return null

        const pages = []
        const maxButtons = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
        const endPage = Math.min(totalPages, startPage + maxButtons - 1)

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button key={i} variant={i === currentPage ? 'default' : 'outline'} size="sm" onClick={() => handlePageChange(i)} className="w-9 h-9 p-0">
                    {i}
                </Button>,
            )
        }

        return (
            <div className="flex items-center gap-2 justify-center mt-4">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-9 h-9 p-0">
                    <i className="fas fa-chevron-left text-xs"></i>
                </Button>
                {startPage > 1 && (
                    <>
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} className="w-9 h-9 p-0">
                            1
                        </Button>
                        {startPage > 2 && (
                            <span key="start-ellipsis" className="text-neutral/60">
                                ...
                            </span>
                        )}
                    </>
                )}
                {pages}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <span key="end-ellipsis" className="text-neutral/60">
                                ...
                            </span>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} className="w-9 h-9 p-0">
                            {totalPages}
                        </Button>
                    </>
                )}
                <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-9 h-9 p-0">
                    <i className="fas fa-chevron-right text-xs"></i>
                </Button>
            </div>
        )
    }

    const getCategoryName = (categoryId: string) => {
        const category = categories.find((cat) => cat._id === categoryId)
        return category ? category.name : 'Không xác định'
    }

    return (
        <AdminLayout>
            <Card className="shadow-sm border-0">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Quản lý món ăn</CardTitle>
                        <Button onClick={() => setLocation('/admin/products/new')}>
                            <Plus className="w-4 h-4 mr-2" /> Thêm món ăn
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters and Search */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Tìm kiếm món ăn..." className="pl-9" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                            <p className="text-xs text-muted-foreground mt-1">Kết quả sẽ tự động cập nhật sau khi bạn dừng gõ</p>
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={selectedCategory}
                                onValueChange={(value) => {
                                    setSelectedCategory(value)
                                    setCurrentPage(1) // Reset to first page when changing category
                                }}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category._id} value={category._id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={sortBy}
                                onValueChange={(value) => {
                                    setSortBy(value)
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Sắp xếp theo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-createdAt">Mới nhất</SelectItem>
                                    <SelectItem value="createdAt">Cũ nhất</SelectItem>
                                    <SelectItem value="price">Giá: Thấp đến cao</SelectItem>
                                    <SelectItem value="-price">Giá: Cao đến thấp</SelectItem>
                                    <SelectItem value="name">Tên: A-Z</SelectItem>
                                    <SelectItem value="-name">Tên: Z-A</SelectItem>
                                    <SelectItem value="-soldCount">Bán chạy nhất</SelectItem>
                                    <SelectItem value="-rating">Đánh giá cao nhất</SelectItem>
                                    <SelectItem value="rating">Đánh giá thấp nhất</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Hình ảnh</TableHead>
                                    <TableHead>Tên món</TableHead>
                                    <TableHead className="text-right">Giá</TableHead>
                                    <TableHead className="text-center">Đã bán</TableHead>
                                    <TableHead className="text-center">Đánh giá</TableHead>
                                    <TableHead className="text-center">Trạng thái</TableHead>
                                    <TableHead className="text-center w-[120px]">Tùy chọn</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Skeleton className="h-10 w-10 rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-40" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-20" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-16 ml-auto" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-10 mx-auto" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-16 mx-auto" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-6 w-16 mx-auto" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-8 w-20 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : dishes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10 text-neutral/70">
                                            Không tìm thấy món ăn nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    dishes.map((dish) => (
                                        <TableRow key={dish._id}>
                                            <TableCell>
                                                <div className="w-10 h-10 rounded overflow-hidden">
                                                    <img
                                                        src={dish.imageUrl}
                                                        alt={dish.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=NA'
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{dish.name}</div>
                                                <div className="flex gap-1 mt-1">
                                                    {dish.isPopular && (
                                                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                                                            Bán chạy
                                                        </Badge>
                                                    )}
                                                    {dish.isNewDish && (
                                                        <Badge variant="outline" className="text-xs bg-accent/10 text-accent">
                                                            Mới
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getCategoryName(dish.category)}</TableCell>

                                            <TableCell className="text-center">{dish.soldCount || 0}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="font-medium mr-1">{dish.rating !== undefined ? Number(dish.rating).toFixed(1) : '0.0'}</span>
                                                    <i className="fas fa-star text-yellow-400 text-xs"></i>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <Switch
                                                        checked={dish.isAvailable}
                                                        onCheckedChange={() => handleToggleAvailability(dish._id, dish.isAvailable)}
                                                        className="data-[state=checked]:bg-green-500"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center space-x-2">
                                                    <Button variant="outline" size="icon" onClick={() => setLocation(`/admin/products/edit/${dish._id}`)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                                                <AlertDialogDescription>Bạn có chắc chắn muốn xóa món ăn "{dish.name}"? Hành động này không thể hoàn tác.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteDish(dish._id)} className="bg-red-500 hover:bg-red-600">
                                                                    Xóa
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {!isLoading && dishes.length > 0 && renderPagination()}

                    {/* Summary */}
                    <div className="mt-4 text-sm text-neutral/70 text-center">
                        Hiển thị {dishes.length} trên {totalItems} món ăn
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
