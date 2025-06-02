import authRoutes from "@routes/auth.route"
import userProfileRoutes from "@routes/user-profile.route"
import dishRoutes from "@routes/dish.route"
import categoryRoutes from "@routes/category.route"
import { Router } from "express"
import paymentRoutes from "@routes/payment.route"
import orderRoutes from "@routes/order.route"
import userRoutes from "@routes/user.route"
import dashboardRoutes from "@routes/dashboard.route" 
import chatRoutes from "@/routes/agent.route"


const router = Router()

router.use("/auth", authRoutes)
router.use("/user-profile", userProfileRoutes)
router.use("/dishes", dishRoutes)
router.use("/categories", categoryRoutes)
router.use("/payments", paymentRoutes)
router.use("/orders", orderRoutes)
router.use("/users", userRoutes)
router.use("/admin/dashboard", dashboardRoutes)
router.use("/chat", chatRoutes)
export default router