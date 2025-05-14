import { useState } from "react"
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, CircularProgress } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import { useAddress } from "@/hooks/use-address"
import { AddressList } from "./address-list"
import { AddressForm } from "./address-form"

interface AddressManagerProps {
	onAddressSelect?: (address: { id: string; addressLine: string; city: string; state: string; isDefault: boolean }) => void
}

export function AddressManager({ onAddressSelect }: AddressManagerProps) {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const { addresses, isLoading } = useAddress()

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" p={4}>
				<CircularProgress />
			</Box>
		)
	}

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Typography variant="h6">Địa chỉ của bạn</Typography>
				<Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddDialogOpen(true)}>
					Thêm địa chỉ mới
				</Button>
			</Box>

			{addresses.length === 0 ? (
				<Typography color="text.secondary" textAlign="center" py={4}>
					Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới!
				</Typography>
			) : (
				<AddressList addresses={addresses} onAddressSelect={onAddressSelect} />
			)}

			<Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>Thêm địa chỉ mới</DialogTitle>
				<DialogContent>
					<AddressForm onSuccess={() => setIsAddDialogOpen(false)} onCancel={() => setIsAddDialogOpen(false)} />
				</DialogContent>
			</Dialog>
		</Box>
	)
}
