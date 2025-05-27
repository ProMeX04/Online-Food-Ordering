import Payment, { IPayment } from "@/model/payment.model";

export class PaymentService {
    static async createPayment(payment: IPayment) {
        const newPayment = await Payment.create(payment);
        return newPayment;
    }

    static async findPaymentByOrderId(orderId: string) {
        const payment = await Payment.findOne({ orderId });
        return payment;
    }

    static async updatePayment(orderId: string, payment: Partial<IPayment>) {
        const updatedPayment = await Payment.findOneAndUpdate({ orderId }, payment, { new: true });
        return updatedPayment;
    }

    static async deletePayment(orderId: string) {
        await Payment.deleteOne({ orderId });
    }

    static async findPaymentByUserId(userId: string) {
        const payments = await Payment.find({ userId });
        return payments;
    }
}