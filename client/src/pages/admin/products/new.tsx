import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Category } from '@/types/schema'
import { ChevronLeft, Loader2, Upload, Image as ImageIcon } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { get, post } from '@/lib/axiosClient'
import AdminLayout from '../AdminLayout'

const formSchema = z.object({
    name: z.string().min(1, 'Tên món ăn không được để trống'),
    description: z.string().min(10, 'Mô tả cần ít nhất 10 ký tự'),
    price: z.coerce.number().min(1000, 'Giá phải lớn hơn 1,000đ'),
    category: z.string().min(1, 'Vui lòng chọn danh mục'),
    isAvailable: z.boolean().default(true),
    rating: z.coerce.number().min(0).max(5).default(5),
    isPopular: z.boolean().default(false),
    isNewDish: z.boolean().default(false),
    isSpecial: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

export default function NewDishPage() {
    const [, setLocation] = useLocation()
    const { toast } = useToast()
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
            isAvailable: true,
            rating: 5,
            isPopular: false,
            isNewDish: false,
            isSpecial: false,
        } as FormValues,
    })

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true)
            try {
                const categoriesData: Category[] = await get('/categories')
                setCategories(categoriesData)
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

        fetchCategories()
    }, [toast])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedImage(file)

            const reader = new FileReader()
            reader.onload = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        try {
            const dishResponse = (await post('/dishes', values)) as { _id: string }

            if (selectedImage && dishResponse._id) {
                const formData = new FormData()
                formData.append('image', selectedImage)

                await post(`/dishes/${dishResponse._id}/image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
            }

            toast({
                title: 'Thành công',
                description: 'Đã thêm món ăn mới thành công',
            })

            setLocation('/admin/products')
        } catch (error) {
            console.error('Error creating dish:', error)
            toast({
                title: 'Lỗi',
                description: 'Không thể tạo món ăn mới. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AdminLayout>
            <Card className="shadow-sm border-0">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setLocation('/admin/products')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <CardTitle>Thêm món ăn mới</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Tên món ăn <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tên món ăn" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Upload hình ảnh */}
                                <FormItem>
                                    <FormLabel>
                                        Hình ảnh <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full flex flex-col items-center justify-center h-32 relative">
                                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} />
                                                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">Click để chọn ảnh</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {previewUrl ? (
                                                <div className="w-full h-32 rounded-lg overflow-hidden relative">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-32 rounded-lg bg-gray-200 flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </FormItem>

                                {/* Giá */}
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Giá <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Nhập giá tiền" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Danh mục <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn danh mục" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category._id} value={category._id}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Đánh giá */}
                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Đánh giá (0-5)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Nhập đánh giá" min={0} max={5} step={0.1} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Mô tả */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Mô tả <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Nhập mô tả món ăn" className="min-h-32" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Các tùy chọn */}
                            <div className="border rounded-md p-4 space-y-4">
                                <h3 className="font-medium">Tùy chọn món ăn</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="isAvailable"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Có sẵn</FormLabel>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isPopular"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Phổ biến</FormLabel>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isNewDish"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Món mới</FormLabel>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isSpecial"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">Món đặc biệt</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setLocation('/admin/products')} disabled={isSubmitting}>
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Thêm món ăn
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
