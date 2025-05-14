import authRoutes from "@routes/auth.route"
import userProfileRoutes from "@routes/user-profile.route"
import dishRoutes from "@routes/dish.route"
import categoryRoutes from "@routes/category.route"
import { Router } from "express"


const router = Router()

router.use("/auth", authRoutes)
router.use("/user-profile", userProfileRoutes)
router.use("/dishes", dishRoutes)
router.use("/categories", categoryRoutes)

export default router