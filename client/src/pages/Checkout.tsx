import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { formatCurrency, SHIPPING } from '@/lib'
import { useToast } from '@/hooks/use-toast'
import { post } from '@/lib'
import { Link, useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { IOrder, OrderStatus, PaymentMethod } from '@/types/schema'
import { useAuth } from '@/hooks/use-auth'
import { useProfile } from '@/hooks/use-profile'
import { IAddress } from '@/types/address'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { AddressForm } from '@/components/profile/AddressForm'
import { PlusCircle, Edit3 } from 'lucide-react'

interface CheckoutFormData {
    paymentMethod: PaymentMethod
    notes: string
}

const Checkout = () => {
    const [, setLocation] = useLocation()
    const { cartItems, getCartTotal, clearCart } = useCart()
    const { toast } = useToast()
    const { user: authUser } = useAuth()
    const { profile, addresses, isLoading: isLoadingProfile, addAddress: addProfileAddress, fetchProfile } = useProfile()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedAddressForCheckout, setSelectedAddressForCheckout] = useState<IAddress | null>(null)
    const [showAddressSelectionModal, setShowAddressSelectionModal] = useState(false)
    const [showAddAddressModal, setShowAddAddressModal] = useState(false)
    const [isAddingAddress, setIsAddingAddress] = useState(false)

    const [formData, setFormData] = useState<CheckoutFormData>({
        paymentMethod: PaymentMethod.COD,
        notes: '',
    })

    if (!authUser) {
        toast({
            title: 'Vui lòng đăng nhập để tiếp tục',
            description: 'Vui lòng đăng nhập để tiếp tục',
            variant: 'destructive',
        })
        setLocation('/login')
    }

    useEffect(() => {
        if (authUser && profile) {
            setFormData((prev) => ({
                ...prev,
            }))
        }
    }, [authUser, profile])

    useEffect(() => {
        if (addresses && addresses.length > 0 && !selectedAddressForCheckout) {
            const defaultAddress = addresses.find((addr) => addr.isDefault)
            const initialSelectedAddress = defaultAddress || addresses[0]
            setSelectedAddressForCheckout(initialSelectedAddress)
        }
    }, [addresses, selectedAddressForCheckout])

    useEffect(() => {
        if (selectedAddressForCheckout) {
            setFormData((prev) => ({
                ...prev,
                coordinates: selectedAddressForCheckout.latitude && selectedAddressForCheckout.longitude ? [selectedAddressForCheckout.latitude, selectedAddressForCheckout.longitude] : undefined,
            }))
        }
    }, [selectedAddressForCheckout])

    const cartTotal = getCartTotal()
    const deliveryFee = SHIPPING.DELIVERY_FEE
    const finalTotal = cartTotal + deliveryFee

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (cartItems.length === 0) {
            toast({
                title: 'Giỏ hàng trống',
                description: 'Vui lòng thêm món ăn vào giỏ hàng trước khi thanh toán',
                variant: 'destructive',
            })
            return
        }

        if (!selectedAddressForCheckout) {
            toast({
                title: 'Chưa chọn địa chỉ',
                description: 'Vui lòng chọn địa chỉ giao hàng.',
                variant: 'destructive',
            })
            return
        }

        if (
            !selectedAddressForCheckout.fullName ||
            !selectedAddressForCheckout.phone ||
            !selectedAddressForCheckout.street ||
            !selectedAddressForCheckout.ward ||
            !selectedAddressForCheckout.district ||
            !selectedAddressForCheckout.city
        ) {
            toast({
                title: 'Thông tin địa chỉ không đầy đủ',
                description: 'Địa chỉ được chọn thiếu thông tin quan trọng. Vui lòng kiểm tra lại hoặc chọn địa chỉ khác.',
                variant: 'destructive',
            })
            return
        }

        try {
            setIsSubmitting(true)

            const orderData: IOrder = {
                orderItems: cartItems.map((item) => ({
                    dishId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                notes: formData.notes,
                totalAmount: finalTotal,
                status: OrderStatus.PENDING,
                address: selectedAddressForCheckout,
            }

            const createdOrder = await post<IOrder>('/orders', orderData)

            const paymentData = {
                orderId: createdOrder._id,
                amount: finalTotal,
                paymentMethod: formData.paymentMethod,
            }

            await post('/payments', paymentData)

            clearCart()

            if (createdOrder._id) {
                const searchParams = new URLSearchParams({
                    orderId: createdOrder._id,
                    total: finalTotal.toString(),
                    paymentMethod: formData.paymentMethod,
                })
                setLocation(`/order-success?${searchParams.toString()}`)
            }
        } catch (error) {
            console.error('Error creating order:', error)
            toast({
                title: 'Lỗi',
                description: 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        document.title = 'Thanh toán | ViệtFood'

        if (cartItems.length === 0) {
            toast({
                title: 'Giỏ hàng trống',
                description: 'Vui lòng thêm món ăn vào giỏ hàng trước khi thanh toán',
            })
            setLocation('/menu')
        }
    }, [cartItems.length, toast, setLocation])

    const handleSelectAddressFromModal = (address: IAddress) => {
        setSelectedAddressForCheckout(address)
        setShowAddressSelectionModal(false)
        toast({ title: 'Địa chỉ đã được chọn', description: 'Thông tin giao hàng đã được cập nhật.' })
    }

    const handleOpenAddAddressModal = () => {
        setShowAddressSelectionModal(false)
        setShowAddAddressModal(true)
    }

    const handleAddAddressSubmit = async (addressData: IAddress) => {
        setIsAddingAddress(true)
        try {
            const newAddress = await addProfileAddress(addressData)

            if (newAddress && typeof newAddress === 'object' && '_id' in newAddress) {
                setSelectedAddressForCheckout(newAddress as IAddress)
            } else {
                await fetchProfile()
            }

            toast({
                title: 'Thêm địa chỉ thành công',
                description: 'Địa chỉ mới đã được thêm và chọn.',
            })
            setShowAddAddressModal(false)
        } catch (error: unknown) {
            toast({
                title: 'Thêm địa chỉ thất bại',
                description: (error as Error).message || 'Có lỗi xảy ra.',
                variant: 'destructive',
            })
        } finally {
            setIsAddingAddress(false)
        }
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="font-bold text-3xl text-center mb-8">
                    Thanh <span className="text-primary">Toán</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Checkout Form */}
                    <div className="lg:w-2/3">
                        <Card className="p-6">
                            <h2 className="font-bold text-xl mb-6">Thông Tin Giao Hàng</h2>

                            {isLoadingProfile && !selectedAddressForCheckout && <div className="mb-4 p-4 border rounded-md animate-pulse bg-gray-100 h-20"></div>}

                            {selectedAddressForCheckout && (
                                <div className="mb-6 p-4 border border-primary/50 rounded-md bg-primary/5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1 text-primary">Giao đến địa chỉ:</h3>
                                            <p className="font-medium">
                                                {selectedAddressForCheckout.fullName} - {selectedAddressForCheckout.phone}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                {`${selectedAddressForCheckout.street}, ${selectedAddressForCheckout.ward}, ${selectedAddressForCheckout.district}, ${selectedAddressForCheckout.city}`}
                                            </p>
                                            {selectedAddressForCheckout.isDefault && <span className="text-xs text-green-600 font-semibold">(Mặc định)</span>}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setShowAddressSelectionModal(true)} className="ml-4 flex-shrink-0">
                                            <Edit3 className="w-4 h-4 mr-1" /> Thay đổi
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!selectedAddressForCheckout && !isLoadingProfile && addresses && addresses.length > 0 && (
                                <div className="mb-6">
                                    <Button onClick={() => setShowAddressSelectionModal(true)} variant="default" className="w-full">
                                        <PlusCircle className="w-4 h-4 mr-2" /> Chọn địa chỉ giao hàng
                                    </Button>
                                </div>
                            )}

                            {!selectedAddressForCheckout && !isLoadingProfile && (!addresses || addresses.length === 0) && (
                                <div className="mb-6 p-4 border border-dashed rounded-md text-center">
                                    <p className="text-muted-foreground mb-2">Bạn chưa có địa chỉ nào.</p>
                                    <Button onClick={() => setShowAddAddressModal(true)} variant="default" size="sm">
                                        <PlusCircle className="w-4 h-4 mr-2" /> Thêm địa chỉ mới ngay
                                    </Button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-neutral font-medium mb-2">Ghi chú</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-24"
                                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                        disabled={isSubmitting}
                                    ></textarea>
                                </div>

                                <div>
                                    <h2 className="font-bold text-xl mb-4">Phương Thức Thanh Toán</h2>

                                    <div className="space-y-3">
                                        <div className="border p-4 rounded-md bg-white flex items-center">
                                            <input
                                                type="radio"
                                                id="cod"
                                                name="paymentMethod"
                                                value="cod"
                                                checked={formData.paymentMethod === 'cod'}
                                                onChange={handleChange}
                                                className="mr-3"
                                                disabled={isSubmitting}
                                            />
                                            <label htmlFor="cod" className="flex items-center cursor-pointer flex-1">
                                                <i className="fas fa-money-bill-wave text-green-500 mr-2"></i>
                                                <span>Thanh toán khi nhận hàng (COD)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <Link href="/menu" className="flex-1">
                                        <Button type="button" variant="outline" size="lg" className="w-full" disabled={isSubmitting}>
                                            <i className="fas fa-arrow-left mr-2"></i> Tiếp tục mua sắm
                                        </Button>
                                    </Link>
                                    <Button type="submit" variant="default" size="lg" className="flex-1" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check mr-2"></i> Hoàn tất đơn hàng
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    <div className="lg:w-1/3">
                        <Card className="p-6 bg-white">
                            <h2 className="font-bold text-xl mb-6">Đơn Hàng Của Bạn</h2>

                            <div className="space-y-4 mb-6">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4">
                                            <div className="h-16 w-16 overflow-hidden rounded-md">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.name}</h4>
                                                <p className="text-sm text-neutral/70">
                                                    {formatCurrency(item.price)} x {item.quantity}
                                                </p>
                                            </div>
                                            <div className="font-bold">{formatCurrency(item.price * item.quantity)}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-neutral/70">Giỏ hàng của bạn đang trống</p>
                                    </div>
                                )}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>{formatCurrency(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí giao hàng:</span>
                                    <span>{formatCurrency(deliveryFee)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Tổng cộng:</span>
                                    <span className="text-primary">{formatCurrency(finalTotal)}</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white mt-6">
                            <h2 className="font-bold text-xl mb-4">Mã Khuyến Mãi</h2>
                            <div className="flex">
                                <input
                                    type="text"
                                    className="border rounded-l-md p-3 flex-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Nhập mã khuyến mãi"
                                    disabled={isSubmitting}
                                />
                                <Button variant="secondary" className="rounded-l-none" disabled={isSubmitting}>
                                    Áp dụng
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Address Selection Modal */}
            <Dialog open={showAddressSelectionModal} onOpenChange={setShowAddressSelectionModal}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {addresses && addresses.length > 0 ? (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {addresses.map((addr, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 border rounded-md cursor-pointer hover:border-primary transition-all
                                            ${selectedAddressForCheckout?._id === addr._id ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'border-gray-200'}
                                        `}
                                        onClick={() => handleSelectAddressFromModal(addr)}
                                    >
                                        <p className="font-semibold text-base">
                                            {addr.fullName} - {addr.phone}
                                        </p>
                                        <p className="text-sm text-gray-600">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`}</p>
                                        {addr.isDefault && <span className="text-xs text-green-600 font-semibold mt-1 inline-block">(Mặc định)</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">Không có địa chỉ nào được lưu.</p>
                        )}
                    </div>
                    <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                        <Button onClick={handleOpenAddAddressModal} variant="outline">
                            <PlusCircle className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Đóng
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Address Modal */}
            <Dialog open={showAddAddressModal} onOpenChange={setShowAddAddressModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm địa chỉ mới</DialogTitle>
                    </DialogHeader>
                    <AddressForm onSubmit={handleAddAddressSubmit} onCancel={() => setShowAddAddressModal(false)} isSubmitting={isAddingAddress} />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Checkout
