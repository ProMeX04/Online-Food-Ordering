import { Request, Response } from "express";
import { PaymentService } from "@/services/payment.service";
import { sendError, sendSuccess } from "@/utils/responseUtils";
import { PaymentStatus } from "@/model/payment.model";

export default class PaymentController {
    static async createPayment(req: Request, res: Response) {
        try {
            const user = req.user;
            const payment = await PaymentService.createPayment({
                ...req.body,
                userId: user?._id,
                paymentDate: new Date().toISOString(),
                paymentStatus: PaymentStatus.PENDING,
            }); 
            sendSuccess(res, payment);
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }

    static async getPaymentByOrderId(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const payment = await PaymentService.findPaymentByOrderId(orderId);
            sendSuccess(res, payment);
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }

    static async updatePayment(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const payment = await PaymentService.updatePayment(orderId, req.body);
            sendSuccess(res, payment);
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }

    static async deletePayment(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            await PaymentService.deletePayment(orderId);
            sendSuccess(res, { message: "Payment deleted successfully" });
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }

    static async getPaymentByUserId(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const payments = await PaymentService.findPaymentByUserId(userId);
            sendSuccess(res, payments);
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }


}