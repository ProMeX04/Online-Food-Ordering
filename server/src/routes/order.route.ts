import { Router } from "express"
import OrderController from "@/controllers/order.controller"
import { authenticate, requireAdmin } from "@/middlewares/auth.middleware"

const router = Router()

router.post('/', authenticate, OrderController.createOrder)
router.get('/detail/:id', authenticate, OrderController.getOrderById)
router.get('/user', authenticate, OrderController.getUserOrders)
router.put('/:id', authenticate, requireAdmin, OrderController.updateOrder)
router.delete('/:id', authenticate, OrderController.deleteOrder)
router.get('/', authenticate, requireAdmin, OrderController.getAllOrdersWithItems)
router.post('/:id/items', authenticate, OrderController.addOrderItem)
router.delete('/:id/items', authenticate, OrderController.removeOrderItem)

export default router