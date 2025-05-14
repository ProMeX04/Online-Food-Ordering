import { Button, TextField, FormControlLabel, Checkbox, Grid } from '@mui/material'
import { useForm } from 'react-hook-form'
import { IAddress } from '@/types/address'
import { useAddress } from '@/hooks/use-address'
import { useToast } from '@/hooks/use-toast'

interface AddressFormProps {
    address?: IAddress
    onSuccess?: () => void
    onCancel?: () => void
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IAddress>({
        defaultValues: address || {
            fullName: '',
            phone: '',
            city: '',
            district: '',
            ward: '',
            street: '',
            note: '',
            isDefault: false,
        },
    })

    const { addAddress, updateAddress } = useAddress()
    const { toast } = useToast()

    const onSubmit = async (data: IAddress) => {
        try {
            if (address?.index !== undefined) {
                // Cập nhật địa chỉ hiện có
                await updateAddress({
                    addressIndex: address.index,
                    address: data,
                })
                toast({
                    title: 'Đã cập nhật địa chỉ',
                    variant: 'default',
                    className: 'bg-green-500',
                })
            } else {
                // Thêm địa chỉ mới
                await addAddress(data)
                toast({
                    title: 'Đã thêm địa chỉ mới',
                    variant: 'default',
                    className: 'bg-green-500',
                })
            }
            onSuccess?.()
        } catch (error) {
            toast({
                title: 'Có lỗi xảy ra. Vui lòng thử lại',
                variant: 'destructive',
            })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField {...register('fullName', { required: 'Họ tên là bắt buộc' })} label="Họ tên" fullWidth error={!!errors.fullName} helperText={errors.fullName?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField {...register('phone', { required: 'Số điện thoại là bắt buộc' })} label="Số điện thoại" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
                </Grid>
                <Grid item xs={12}>
                    <TextField {...register('city', { required: 'Tỉnh/Thành phố là bắt buộc' })} label="Tỉnh/Thành phố" fullWidth error={!!errors.city} helperText={errors.city?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField {...register('district', { required: 'Quận/Huyện là bắt buộc' })} label="Quận/Huyện" fullWidth error={!!errors.district} helperText={errors.district?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField {...register('ward', { required: 'Phường/Xã là bắt buộc' })} label="Phường/Xã" fullWidth error={!!errors.ward} helperText={errors.ward?.message} />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        {...register('street', { required: 'Địa chỉ cụ thể là bắt buộc' })}
                        label="Địa chỉ cụ thể (Số nhà, tên đường)"
                        fullWidth
                        error={!!errors.street}
                        helperText={errors.street?.message}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField {...register('note')} label="Ghi chú thêm" fullWidth multiline rows={2} />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel control={<Checkbox {...register('isDefault')} />} label="Đặt làm địa chỉ mặc định" />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
                    {onCancel && (
                        <Button onClick={onCancel} disabled={isSubmitting}>
                            Hủy
                        </Button>
                    )}
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {address?.index !== undefined ? 'Cập nhật' : 'Thêm địa chỉ'}
                    </Button>
                </Grid>
            </Grid>
        </form>
    )
}
