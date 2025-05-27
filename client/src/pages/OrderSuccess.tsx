import { useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib'
import { PaymentMethod } from '@/types/schema'


const OrderSuccess = () => {
    const [, setLocation] = useLocation()

    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('orderId')
    const totalAmount = Number(params.get('total'))
    const paymentMethod = params.get('paymentMethod') as PaymentMethod

    useEffect(() => {
        if (!orderId || !totalAmount || !paymentMethod) {
            setLocation('/')
            return
        }

        document.title = 'Đặt Hàng Thành Công | ViệtFood'
    }, [orderId, totalAmount, paymentMethod, setLocation])

    if (!orderId || !totalAmount || !paymentMethod) {
        return null
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <Card className="max-w-2xl mx-auto p-8 text-center">
                    <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6">
                        <i className="fas fa-check text-white text-3xl"></i>
                    </div>
                    <h1 className="font-bold text-3xl text-neutral mb-4">Đặt Hàng Thành Công!</h1>
                    <p className="text-lg mb-6">Cảm ơn bạn đã đặt hàng tại ViệtFood. Đơn hàng của bạn đã được ghi nhận và sẽ được xử lý trong thời gian sớm nhất.</p>

                    <div className="mb-8 bg-gray-50 border rounded-md p-4 text-left inline-block">
                        <p className="font-medium">
                            Mã đơn hàng: <span className="text-primary">#{orderId}</span>
                        </p>
                        <p className="font-medium">
                            Tổng thanh toán: <span className="text-primary">{formatCurrency(totalAmount)}</span>
                        </p>
                        <p className="font-medium">
                            Phương thức thanh toán: <span className="text-primary">{paymentMethod === PaymentMethod.COD ? 'Tiền mặt khi nhận hàng' : 'Chuyển khoản ngân hàng'}</span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button variant="default" size="lg">
                                <i className="fas fa-home mr-2"></i> Về Trang Chủ
                            </Button>
                        </Link>
                        <Link href="/menu">
                            <Button variant="outline" size="lg">
                                <i className="fas fa-utensils mr-2"></i> Tiếp Tục Mua Sắm
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default OrderSuccess
