import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { IAddress } from '@/types/address'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Province {
    name: string
    code: number
    division_type: string
    districts?: District[]
}

interface District {
    name: string
    code: number
    division_type: string
    province_code: number
    wards?: Ward[]
}

interface Ward {
    name: string
    code: number
    division_type: string
    district_code: number
}

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
    street: z.string().min(1, { message: 'Vui lòng nhập địa chỉ cụ thể.' }),
    note: z.string().optional(),
    isDefault: z.boolean().default(false),
    cityCode: z.number().optional(),
    districtCode: z.number().optional(),
    wardCode: z.number().optional(),
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
    initialData?: IAddress
    onSubmit: (data: AddressFormValues) => void
    onCancel: () => void
    isSubmitting?: boolean
}

const API_BASE_URL = 'https://provinces.open-api.vn/api'

export function AddressForm({ initialData, onSubmit, onCancel, isSubmitting = false }: AddressFormProps) {
    const [provinces, setProvinces] = useState<Province[]>([])
    const [districts, setDistricts] = useState<District[]>([])
    const [wards, setWards] = useState<Ward[]>([])

    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false)
    const [isLoadingWards, setIsLoadingWards] = useState(false)

    const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null)
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null)

    const form = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            city: '',
            district: '',
            ward: '',
            street: '',
            note: '',
            isDefault: false,
            cityCode: undefined,
            districtCode: undefined,
            wardCode: undefined,
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                fullName: initialData.fullName || '',
                phone: initialData.phone || '',
                city: initialData.city || '',
                district: initialData.district || '',
                ward: initialData.ward || '',
                street: initialData.street || '',
                note: initialData.note || '',
                isDefault: initialData.isDefault || false,
                cityCode: undefined,
                districtCode: undefined,
                wardCode: undefined,
            })

            if (provinces.length > 0 && initialData.city) {
                const matchedProvince = provinces.find((p) => p.name === initialData.city)
                if (matchedProvince) {
                    setSelectedProvinceCode(matchedProvince.code)
                } else {
                    setSelectedProvinceCode(null)
                    setSelectedDistrictCode(null)
                    setDistricts([])
                    setWards([])
                }
            } else {
                setSelectedProvinceCode(null)
                setSelectedDistrictCode(null)
                setDistricts([])
                setWards([])
            }
        } else {
            form.reset({
                fullName: '',
                phone: '',
                city: '',
                district: '',
                ward: '',
                street: '',
                note: '',
                isDefault: false,
                cityCode: undefined,
                districtCode: undefined,
                wardCode: undefined,
            })
            setSelectedProvinceCode(null)
            setSelectedDistrictCode(null)
            setDistricts([])
            setWards([])
        }
    }, [initialData, provinces, form]) 

    useEffect(() => {
        const fetchProvinces = async () => {
            setIsLoadingProvinces(true)
            try {
                const response = await fetch(`${API_BASE_URL}/p/`)
                if (!response.ok) throw new Error('Failed to fetch provinces')
                const data: Province[] = await response.json()
                setProvinces(data)
            } catch (error) {
                console.error('Error fetching provinces:', error)
            } finally {
                setIsLoadingProvinces(false)
            }
        }
        fetchProvinces()
    }, []) 

    useEffect(() => {
        if (!selectedProvinceCode) {
            setDistricts([])
            setWards([])
            setSelectedDistrictCode(null) 
            form.setValue('district', '')
            form.setValue('districtCode', undefined)
            form.setValue('ward', '')
            form.setValue('wardCode', undefined)
            return
        }
        const fetchDistricts = async () => {
            setIsLoadingDistricts(true)
            setDistricts([])
            setWards([])
            setSelectedDistrictCode(null)
            form.setValue('district', '')
            form.setValue('districtCode', undefined)
            form.setValue('ward', '')
            form.setValue('wardCode', undefined)
            try {
                const response = await fetch(`${API_BASE_URL}/p/${selectedProvinceCode}?depth=2`)
                if (!response.ok) {
                   throw new Error('Failed to fetch districts')
                }
                const data: Province = await response.json()
                setDistricts(data.districts || [])

                if (initialData?.district && data.districts && data.name === initialData.city) {
                    const matchedDistrict = data.districts.find((d) => d.name === initialData.district)
                    if (matchedDistrict) {
                        setSelectedDistrictCode(matchedDistrict.code)
                    }
                }
            } catch (error) {
                console.error('Error fetching districts:', error)
            } finally {
                setIsLoadingDistricts(false)
            }
        }
        fetchDistricts()
    }, [selectedProvinceCode, initialData, form.setValue]) 

    useEffect(() => {
        if (!selectedDistrictCode) {
            setWards([])
            form.setValue('ward', '')
            form.setValue('wardCode', undefined)
            return
        }
        const fetchWards = async () => {
            setIsLoadingWards(true)
            setWards([]) 
            form.setValue('ward', '')
            form.setValue('wardCode', undefined)
            try {
                const response = await fetch(`${API_BASE_URL}/d/${selectedDistrictCode}?depth=2`)
                if (!response.ok) {
                    throw new Error('Failed to fetch wards')
                }
                const data: District = await response.json()
                setWards(data.wards || [])

                if (initialData?.ward && data.wards && data.name === initialData.district) {
                    const matchedWard = data.wards.find((w) => w.name === initialData.ward)
                    if (matchedWard) {
                        form.setValue('ward', matchedWard.name)
                        form.setValue('wardCode', matchedWard.code)
                    }
                }
            } catch (error) {
                console.error('Error fetching wards:', error)
            } finally {
                setIsLoadingWards(false)
            }
        }
        fetchWards()
    }, [selectedDistrictCode, initialData, form.setValue]) 

    const handleProvinceChange = (provinceCodeStr: string) => {
        const provinceCode = parseInt(provinceCodeStr)
        const selectedProv = provinces.find((p) => p.code === provinceCode)
        if (selectedProv) {
            form.setValue('city', selectedProv.name)
            form.setValue('cityCode', selectedProv.code)
            setSelectedProvinceCode(selectedProv.code)
        } else {
            setSelectedProvinceCode(null)
        }
    }

    const handleDistrictChange = (districtCodeStr: string) => {
        const districtCode = parseInt(districtCodeStr)
        const selectedDist = districts.find((d) => d.code === districtCode)
        if (selectedDist) {
            form.setValue('district', selectedDist.name)
            form.setValue('districtCode', selectedDist.code)
            setSelectedDistrictCode(selectedDist.code)
        } else {
            setSelectedDistrictCode(null)
        }
    }

    const handleWardChange = (wardCodeStr: string) => {
        const wardCode = parseInt(wardCodeStr)
        const selectedW = wards.find((w) => w.code === wardCode)
        if (selectedW) {
            form.setValue('ward', selectedW.name)
            form.setValue('wardCode', selectedW.code)
        }
    }

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
                        render={() => (
                            <FormItem>
                                <FormLabel>Tỉnh/Thành phố</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        handleProvinceChange(value)
                                    }}
                                    value={selectedProvinceCode?.toString() || ''}
                                    disabled={isLoadingProvinces}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {provinces.map((province) => (
                                            <SelectItem key={province.code} value={province.code.toString()}>
                                                {province.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="district"
                        render={() => (
                            <FormItem>
                                <FormLabel>Quận/Huyện</FormLabel>
                                <Select
                                    onValueChange={handleDistrictChange}
                                    value={selectedDistrictCode?.toString() || ''}
                                    disabled={isLoadingProvinces || !selectedProvinceCode || isLoadingDistricts}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    isLoadingProvinces
                                                        ? 'Đang tải tỉnh...'
                                                        : !selectedProvinceCode
                                                        ? 'Vui lòng chọn tỉnh/TP'
                                                        : isLoadingDistricts
                                                        ? 'Đang tải quận/huyện...'
                                                        : districts.length === 0
                                                        ? 'Không có quận/huyện'
                                                        : 'Chọn quận/huyện'
                                                }
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {districts.map((district) => (
                                            <SelectItem key={district.code} value={district.code.toString()}>
                                                {district.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ward"
                        render={() => (
                            <FormItem>
                                <FormLabel>Phường/Xã</FormLabel>
                                <Select onValueChange={handleWardChange} value={form.getValues('wardCode')?.toString() || ''} disabled={!selectedDistrictCode || isLoadingWards || wards.length === 0}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingWards ? 'Đang tải...' : 'Chọn phường/xã'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {wards.map((ward) => (
                                            <SelectItem key={ward.code} value={ward.code.toString()}>
                                                {ward.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                <Input placeholder="Thêm ghi chú (tùy chọn)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id="isDefaultAddress" />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="isDefaultAddress">Đặt làm địa chỉ mặc định</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isLoadingProvinces || isLoadingDistricts || isLoadingWards}>
                        {isSubmitting || isLoadingProvinces || isLoadingDistricts || isLoadingWards ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : initialData ? (
                            'Cập nhật địa chỉ'
                        ) : (
                            'Thêm địa chỉ'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
