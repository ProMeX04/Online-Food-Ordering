import { Router } from "express";
import PaymentController from "@/controllers/payment.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, PaymentController.createPayment);
router.get("/:orderId", authenticate, PaymentController.getPaymentByOrderId);
router.put("/:orderId", authenticate, PaymentController.updatePayment);
router.delete("/:orderId", authenticate, PaymentController.deletePayment);
router.get("/user", authenticate, PaymentController.getPaymentByUserId);

export default router;