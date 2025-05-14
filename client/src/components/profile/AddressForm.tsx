import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { IAddress } from '@/types/address'
import { Loader2 } from 'lucide-react'

const addressSchema = z.object({
    fullName: z.string().min(2, {
        message: 'Họ tên phải có ít nhất 2 ký tự.',
    }),
    phone: z.string().min(10, {
        message: 'Số điện thoại không hợp lệ.',
    }),
    city: z.string().min(1, {
        message: 'Vui lòng chọn tỉnh/thành phố.',
    }),
    district: z.string().min(1, {
        message: 'Vui lòng chọn quận/huyện.',
    }),
    ward: z.string().min(1, {
        message: 'Vui lòng chọn phường/xã.',
    }),
    street: z.string().optional(),
    note: z.string().optional(),
    isDefault: z.boolean().default(false),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
    initialData?: IAddress
    onSubmit: (data: AddressFormValues) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export function AddressForm({ initialData, onSubmit, onCancel, isSubmitting = false }: AddressFormProps) {
    const formDefaultValues = initialData
        ? {
              ...initialData,
              isDefault: initialData.isDefault || false,
          }
        : {
              fullName: '',
              phone: '',
              city: '',
              district: '',
              ward: '',
              street: '',
              note: '',
              isDefault: false,
          }

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema) as any,
        defaultValues: formDefaultValues,
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Họ và tên</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập họ và tên" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số điện thoại</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập số điện thoại" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tỉnh/Thành phố</FormLabel>
                                <FormControl>
                                    <Input placeholder="Chọn tỉnh/thành phố" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quận/Huyện</FormLabel>
                                <FormControl>
                                    <Input placeholder="Chọn quận/huyện" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ward"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phường/Xã</FormLabel>
                                <FormControl>
                                    <Input placeholder="Chọn phường/xã" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Địa chỉ cụ thể</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập số nhà, tên đường" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ghi chú</FormLabel>
                            <FormControl>
                                <Input placeholder="Thêm ghi chú về địa chỉ" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Đặt làm địa chỉ mặc định</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : initialData ? (
                            'Cập nhật'
                        ) : (
                            'Thêm địa chỉ'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
