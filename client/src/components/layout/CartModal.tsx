import { useCart } from '@/context/CartContext'
import { CartoonButton } from '@/components/ui/CartoonButton'
import { formatCurrency, SHIPPING } from '@/lib'
import { Link, useLocation } from 'wouter'

const CartModal = () => {
    const [, setLocation] = useLocation()

    const { isCartOpen, toggleCartOpen, cartItems, increaseQuantity, decreaseQuantity, removeFromCart, getCartTotal } = useCart()
    const handleOverlayClick = () => {
        toggleCartOpen()
    }

    const handleCloseClick = () => {
        toggleCartOpen()
    }

    const handleContinueShopping = () => {
        setLocation('/menu')
        toggleCartOpen()
    }

    const cartTotal = getCartTotal()
    const deliveryFee = SHIPPING.DELIVERY_FEE
    const finalTotal = cartTotal + deliveryFee

    if (!isCartOpen) return null

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-neutral/70" onClick={handleOverlayClick}></div>

            {/* Cart Content */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cartoon-border bg-white p-6 w-11/12 max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-baloo font-bold text-2xl text-neutral">
                        Giỏ Hàng <span className="text-primary">Của Bạn</span>
                    </h3>
                    <CartoonButton className="bg-light h-8 w-8 flex items-center justify-center" onClick={handleCloseClick} aria-label="Close">
                        <i className="fas fa-times"></i>
                    </CartoonButton>
                </div>

                {/* Cart Items */}
                {cartItems.length > 0 ? (
                    <div className="space-y-4 mb-6">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4 bg-light p-3 cartoon-border">
                                <img src={`${item.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80`} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                <div className="flex-1">
                                    <h4 className="font-baloo font-medium">{item.name}</h4>
                                    <p className="text-sm text-neutral/70">
                                        {formatCurrency(item.price)} x {item.quantity}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CartoonButton
                                        className="bg-light h-6 w-6 flex items-center justify-center text-neutral"
                                        onClick={() => decreaseQuantity(item.id)}
                                        disabled={item.quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        -
                                    </CartoonButton>
                                    <span>{item.quantity}</span>
                                    <CartoonButton className="bg-light h-6 w-6 flex items-center justify-center text-neutral" onClick={() => increaseQuantity(item.id)} aria-label="Increase quantity">
                                        +
                                    </CartoonButton>
                                </div>
                                <CartoonButton className="bg-primary h-8 w-8 flex items-center justify-center text-white" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                                    <i className="fas fa-trash-alt"></i>
                                </CartoonButton>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 mb-6">
                        <i className="fas fa-shopping-cart text-4xl text-neutral/30 mb-4"></i>
                        <p className="text-neutral/70">Giỏ hàng của bạn đang trống</p>
                    </div>
                )}

                {/* Cart Total */}
                {cartItems.length > 0 && (
                    <>
                        <div className="border-t border-b border-neutral/20 py-4 mb-6">
                            <div className="flex justify-between mb-2">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>Phí giao hàng:</span>
                                <span>{formatCurrency(deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Tổng cộng:</span>
                                <span className="text-primary">{formatCurrency(finalTotal)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3">
                            <Link href="/checkout">
                                <CartoonButton className="bg-primary text-white font-baloo font-medium py-3 w-full" onClick={toggleCartOpen}>
                                    Thanh Toán
                                </CartoonButton>
                            </Link>
                            <CartoonButton className="bg-light text-neutral font-baloo font-medium py-3 w-full" onClick={handleContinueShopping}>
                                Tiếp Tục Mua Sắm
                            </CartoonButton>
                        </div>
                    </>
                )}

                {cartItems.length === 0 && (
                    <CartoonButton className="bg-primary text-white font-baloo font-medium py-3 w-full" onClick={handleContinueShopping}>
                        Xem Thực Đơn
                    </CartoonButton>
                )}
            </div>
        </div>
    )
}

export default CartModal
