import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Upload, Trash } from 'lucide-react'
import { AddressForm } from '@/components/profile/AddressForm'
import { AddressList } from '@/components/profile/AddressList'
import { IAddress } from '@/types/address'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { upload, del } from '@/lib'
import { getErrorMessage } from '@/types/errors'
import { useProfile } from '@/hooks/use-profile'

const profileSchema = z.object({
    fullName: z.string().min(2, {
        message: 'Họ tên phải có ít nhất 2 ký tự.',
    }),
    phone: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
    const { user: authUser } = useAuth()
    const { toast } = useToast()
    const { profile, addresses, isLoading, error: profileError, fetchProfile, updateProfileInfo, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useProfile()

    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState<IAddress | undefined>()
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [isDeletingImage, setIsDeletingImage] = useState(false)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            gender: undefined,
        },
    })

    useEffect(() => {
        if (profile) {
            form.reset({
                fullName: profile.fullName || '',
                phone: profile.phone || '',
                gender: profile.gender || undefined,
            })
        } else {
            form.reset({
                fullName: '',
                phone: '',
                gender: undefined,
            })
        }
    }, [profile, form])

    const onSubmitProfile = async (data: ProfileFormValues) => {
        setIsSubmittingProfile(true)
        try {
            await updateProfileInfo(data)
            toast({
                title: 'Cập nhật thành công',
                description: 'Thông tin cá nhân của bạn đã được cập nhật.',
            })
        } catch (error: unknown) {
            toast({
                title: 'Cập nhật thất bại',
                description: getErrorMessage(error),
                variant: 'destructive',
            })
        } finally {
            setIsSubmittingProfile(false)
        }
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) {
            toast({
                title: 'Lỗi',
                description: 'Không tìm thấy file. Vui lòng chọn lại.',
                variant: 'destructive',
            })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Lỗi',
                description: 'Kích thước file không được vượt quá 5MB',
                variant: 'destructive',
            })
            return
        }

        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Lỗi',
                description: 'Chỉ chấp nhận file hình ảnh',
                variant: 'destructive',
            })
            return
        }

        event.target.value = ''

        setIsUploadingImage(true)
        try {
            const formData = new FormData()
            formData.append('image', file)
            await upload('user-profile/profile/image', formData)
            await fetchProfile()
            toast({
                title: 'Cập nhật thành công',
                description: 'Ảnh đại diện của bạn đã được cập nhật.',
            })
        } catch (error) {
            toast({
                title: 'Cập nhật thất bại',
                description: getErrorMessage(error),
                variant: 'destructive',
            })
        } finally {
            setIsUploadingImage(false)
        }
    }

    const handleDeleteProfileImage = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ảnh đại diện này?')) {
            setIsDeletingImage(true)
            try {
                await del('user-profile/profile/image')
                await fetchProfile()
                toast({
                    title: 'Xóa thành công',
                    description: 'Ảnh đại diện của bạn đã được xóa.',
                })
            } catch (error) {
                toast({
                    title: 'Xóa thất bại',
                    description: getErrorMessage(error),
                    variant: 'destructive',
                })
            } finally {
                setIsDeletingImage(false)
            }
        }
    }

    const handleAddAddressSubmit = async (addressData: IAddress) => {
        try {
            await addAddress(addressData)
            toast({
                title: 'Thêm địa chỉ thành công',
                description: 'Địa chỉ mới đã được thêm vào tài khoản của bạn.',
            })
            setShowAddressForm(false)
        } catch (error) {
            toast({
                title: 'Thêm địa chỉ thất bại',
                description: getErrorMessage(error),
                variant: 'destructive',
            })
        }
    }

    const handleUpdateAddressSubmit = async (addressData: IAddress) => {
        try {
            const addressIndex = addresses.findIndex((addr) => addr._id === selectedAddress?._id)
            if (addressIndex === -1) {
                toast({
                    title: 'Lỗi',
                    description: 'Không tìm thấy địa chỉ được chọn để cập nhật.',
                    variant: 'destructive',
                })
                return
            }
            await updateAddress(addressIndex, addressData)
            toast({
                title: 'Cập nhật địa chỉ thành công',
                description: 'Địa chỉ đã được cập nhật.',
            })
            setShowAddressForm(false)
            setSelectedAddress(undefined)
        } catch (error) {
            toast({
                title: 'Cập nhật địa chỉ thất bại',
                description: getErrorMessage(error),
                variant: 'destructive',
            })
        }
    }

    const handleDeleteAddressClick = async (addressIndex: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            try {
                await deleteAddress(addressIndex)
                toast({
                    title: 'Xóa địa chỉ thành công',
                    description: 'Địa chỉ đã được xóa khỏi tài khoản của bạn.',
                })
            } catch (error) {
                toast({
                    title: 'Xóa địa chỉ thất bại',
                    description: getErrorMessage(error),
                    variant: 'destructive',
                })
            }
        }
    }

    const handleSetDefaultAddressClick = async (addressIndex: number) => {
        try {
            await setDefaultAddress(addressIndex)
            toast({
                title: 'Cập nhật thành công',
                description: 'Địa chỉ mặc định đã được cập nhật.',
            })
        } catch (error) {
            toast({
                title: 'Cập nhật thất bại',
                description: getErrorMessage(error),
                variant: 'destructive',
            })
        }
    }

    const handleAddressFormSubmit = (addressData: IAddress) => {
        if (selectedAddress) {
            handleUpdateAddressSubmit(addressData)
        } else {
            handleAddAddressSubmit(addressData)
        }
    }

    const handleEditAddressClick = (address: IAddress) => {
        setSelectedAddress(address)
        setShowAddressForm(true)
    }

    useEffect(() => {
        if (profileError) {
            toast({
                title: 'Lỗi tải dữ liệu Profile',
                description: getErrorMessage(profileError),
                variant: 'destructive',
            })
        }
    }, [profileError, toast])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Thông tin tài khoản</h1>

            {isLoading && !profile ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : profile ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <Avatar className="w-32 h-32 border-4 border-primary/10">
                                        <AvatarImage src={profile.imageUrl || ''} alt={profile.fullName || ''} />
                                        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                            {profile.fullName
                                                ?.split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="absolute bottom-0 right-0 flex gap-1">
                                        <label htmlFor="avatar-upload" className="bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                                            <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                                            {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        </label>

                                        {profile.imageUrl && (
                                            <button
                                                className="bg-destructive text-white p-2 rounded-full cursor-pointer hover:bg-destructive/90 transition-colors"
                                                onClick={handleDeleteProfileImage}
                                                disabled={isDeletingImage}
                                            >
                                                {isDeletingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Ảnh đại diện</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex justify-center">
                                            <img src={profile.imageUrl} alt={profile.fullName || 'Profile'} className="max-h-[60vh] rounded-md" />
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <h2 className="text-xl font-semibold">{profile.fullName || '...'}</h2>
                                <p className="text-muted-foreground">{authUser?.email}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">Thông tin tài khoản</h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Email:</span>
                                    <p>{authUser?.email}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Ngày tham gia:</span>
                                    <p>{profile.createdAt && new Date(profile.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>

                            {isLoading && !form.formState.isDirty ? (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Họ và tên</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nguyễn Văn A" {...field} />
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
                                                        <Input placeholder="0912345678" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Giới tính</FormLabel>
                                                    <Select 
                                                        onValueChange={field.onChange} 
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn giới tính" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Male">Nam</SelectItem>
                                                            <SelectItem value="Female">Nữ</SelectItem>
                                                            <SelectItem value="Other">Khác</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" disabled={isSubmittingProfile}>
                                            {isSubmittingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Cập nhật thông tin
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Địa chỉ giao hàng</h2>
                                <Button
                                    onClick={() => {
                                        setSelectedAddress(undefined)
                                        setShowAddressForm(true)
                                    }}
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Thêm địa chỉ
                                </Button>
                            </div>

                            {isLoading && addresses.length === 0 ? (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : addresses.length > 0 ? (
                                <AddressList addresses={addresses} onEdit={handleEditAddressClick} onDelete={handleDeleteAddressClick} onSetDefault={handleSetDefaultAddressClick} />
                            ) : (
                                <div className="text-center p-4 border border-dashed rounded-md">
                                    <p className="text-muted-foreground">Bạn chưa có địa chỉ giao hàng nào.</p>
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            setSelectedAddress(undefined)
                                            setShowAddressForm(true)
                                        }}
                                    >
                                        Thêm địa chỉ mới
                                    </Button>
                                </div>
                            )}

                            {showAddressForm && (
                                <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{selectedAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
                                        </DialogHeader>
                                        <AddressForm
                                            initialData={selectedAddress}
                                            onSubmit={handleAddressFormSubmit}
                                            onCancel={() => {
                                                setShowAddressForm(false)
                                                setSelectedAddress(undefined)
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Không thể tải thông tin người dùng. Vui lòng thử lại.</p>
                    <Button onClick={() => fetchProfile()} className="mt-4">
                        Tải lại
                    </Button>
                </div>
            )}
        </div>
    )
}
