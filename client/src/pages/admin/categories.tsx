import { useState, useEffect } from 'react'
import { get, put } from '@/lib/http-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Category } from '@/types/schema'
import { Pencil, Trash2, PlusCircle, Loader2, Search } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { api } from '@/lib'
import AdminLayout from './AdminLayout'

const categoryFormSchema = z.object({
    name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
    description: z.string().optional(),
    imageUrl: z.string().url('URL hình ảnh không hợp lệ').optional(),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            name: '',
            description: '',
            imageUrl: '',
        },
    })

    const fetchCategories = async () => {
        setIsLoading(true)
        try {
            const response = await get('/categories')

            // Handle different response formats
            const categoriesData = Array.isArray(response) ? response : (response as any)?.categories || []

            // Map the data to ensure count property exists
            const mappedCategories = categoriesData.map((cat: any) => ({
                ...cat,
                count: cat.count || 0,
            }))

            setCategories(mappedCategories as Category[])
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast({
                title: 'Lỗi',
                description: 'Không thể tải danh sách danh mục. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const openNewCategoryDialog = () => {
        form.reset({ name: '', description: '', imageUrl: '' })
        setEditingCategory(null)
        setIsDialogOpen(true)
    }

    const openEditCategoryDialog = (category: Category) => {
        form.reset({
            name: category.name,
            description: category.description || '',
            imageUrl: category.imageUrl || '',
        })
        setEditingCategory(category)
        setIsDialogOpen(true)
    }

    const onSubmit = async (values: CategoryFormValues) => {
        setIsSubmitting(true)
        try {
            if (editingCategory) {
                await put(`/categories/${editingCategory._id}`, values)
                toast({
                    title: 'Thành công',
                    description: 'Đã cập nhật danh mục thành công',
                })
            } else {
                await api.products.createCategory(values)
                toast({
                    title: 'Thành công',
                    description: 'Đã thêm danh mục mới thành công',
                })
            }

            fetchCategories()
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error saving category:', error)
            toast({
                title: 'Lỗi',
                description: `Không thể ${editingCategory ? 'cập nhật' : 'tạo'} danh mục. Vui lòng thử lại sau.`,
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteCategory = async (id: string) => {
        try {
            await api.products.deleteCategory(id)
            toast({
                title: 'Xóa thành công',
                description: 'Danh mục đã được xóa thành công',
            })

            setCategories(categories.filter((category) => category._id !== id))
        } catch (error) {
            console.error('Error deleting category:', error)
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa danh mục. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        }
    }

    const filteredCategories = categories.filter(
        (category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()) || (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    return (
        <AdminLayout>
            <Card className="shadow-sm border-0">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Quản lý danh mục</CardTitle>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openNewCategoryDialog}>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Thêm danh mục
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Tên danh mục <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nhập tên danh mục" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mô tả</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nhập mô tả danh mục (tùy chọn)" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="imageUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>URL hình ảnh</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nhập URL hình ảnh (tùy chọn)" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    {field.value && (
                                                        <div className="mt-2">
                                                            <p className="text-sm text-muted-foreground mb-1">Xem trước:</p>
                                                            <div className="w-20 h-20 rounded border overflow-hidden">
                                                                <img
                                                                    src={field.value}
                                                                    alt="Preview"
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=Error'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                                                Hủy
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input placeholder="Tìm kiếm danh mục..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    {/* Table */}
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Hình ảnh</TableHead>
                                    <TableHead>Tên danh mục</TableHead>
                                    <TableHead>Mô tả</TableHead>
                                    <TableHead className="text-center">Số món ăn</TableHead>
                                    <TableHead className="text-center w-[120px]">Tùy chọn</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    // Loading skeletons
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Skeleton className="h-10 w-10 rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-40" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-60" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-10 mx-auto" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-8 w-20 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-neutral/70">
                                            Không tìm thấy danh mục nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <TableRow key={category._id}>
                                            <TableCell>
                                                {category.imageUrl ? (
                                                    <div className="w-10 h-10 rounded overflow-hidden">
                                                        <img
                                                            src={category.imageUrl}
                                                            alt={category.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=NA'
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">NA</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{category.name}</div>
                                            </TableCell>
                                            <TableCell>{category.description || '—'}</TableCell>
                                            <TableCell className="text-center">0</TableCell>
                                            <TableCell>
                                                <div className="flex justify-center space-x-2">
                                                    <Button variant="outline" size="icon" onClick={() => openEditCategoryDialog(category)}>
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
                                                                <AlertDialogDescription>
                                                                    Bạn có chắc chắn muốn xóa danh mục "{category.name}"?
                                                                    <br />
                                                                    Hành động này không thể hoàn tác.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteCategory(category._id)} className="bg-red-500 hover:bg-red-600">
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

                    {/* Summary */}
                    <div className="mt-4 text-sm text-neutral/70 text-center">
                        {!isLoading && <>{searchQuery ? `Hiển thị ${filteredCategories.length} trên ${categories.length} danh mục` : `Tổng số: ${categories.length} danh mục`}</>}
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
 