import { Router } from "express"
import UserController from "@controllers/user.controller"
import { authenticate,requireAdmin} from "@middlewares/auth.middleware"

const router = Router()

router.get("/:id", authenticate, requireAdmin, UserController.getUserDetail)
router.get("/", authenticate, requireAdmin, UserController.getListUser)
router.put("/:id", authenticate, requireAdmin, UserController.updateUser)

export default router