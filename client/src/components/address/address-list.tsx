import { useState } from "react"
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box
} from "@mui/material"
import { Edit as EditIcon, Delete as DeleteIcon, Star as StarIcon } from "@mui/icons-material"
import { IAddress } from "@/types/address"
import { useAddress } from "@/hooks/use-address"
import { useToast } from "@/hooks/use-toast"
import { AddressForm } from "./address-form"

interface AddressListProps {
  addresses: IAddress[]
  onAddressSelect?: (address: IAddress) => void
}

export function AddressList({ addresses, onAddressSelect }: AddressListProps) {
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { deleteAddress, setDefaultAddress, isDeleting, isSettingDefault } = useAddress()
  const { toast } = useToast()

  // Thêm index vào mỗi địa chỉ
  const addressesWithIndex = addresses.map((address, index) => ({
    ...address,
    index
  }))

  const handleEdit = (address: IAddress) => {
    setSelectedAddress(address)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (address: IAddress) => {
    setSelectedAddress(address)
    setIsDeleteDialogOpen(true)
  }

  const handleSetDefault = async (address: IAddress) => {
    try {
      if (address.index === undefined) {
        toast.error("Không thể xác định vị trí địa chỉ")
        return
      }
      await setDefaultAddress(address.index)
      toast.success("Đã đặt làm địa chỉ mặc định")
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại")
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedAddress?.index === undefined) {
      toast.error("Không thể xác định vị trí địa chỉ")
      return
    }
    try {
      await deleteAddress(selectedAddress.index)
      toast.success("Đã xóa địa chỉ")
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại")
    }
  }

  return (
    <>
      <Grid container spacing={2}>
        {addressesWithIndex.map((address) => (
          <Grid item xs={12} sm={6} md={4} key={address.index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" gutterBottom>
                    {address.fullName}
                  </Typography>
                  {address.isDefault && (
                    <StarIcon color="primary" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {address.phone}
                </Typography>
                <Typography variant="body2">
                  {[
                    address.street,
                    address.ward,
                    address.district,
                    address.city
                  ].filter(Boolean).join(", ")}
                </Typography>
                {address.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {address.note}
                  </Typography>
                )}
                <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                  {!address.isDefault && (
                    <Button
                      size="small"
                      onClick={() => handleSetDefault(address)}
                      disabled={isSettingDefault}
                    >
                      Đặt làm mặc định
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(address)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(address)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                {onAddressSelect && (
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => onAddressSelect(address)}
                  >
                    Chọn địa chỉ này
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAddress?.index !== undefined ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
        </DialogTitle>
        <DialogContent>
          <AddressForm
            address={selectedAddress || undefined}
            onSuccess={() => setIsEditDialogOpen(false)}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa địa chỉ này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={isDeleting}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
} 