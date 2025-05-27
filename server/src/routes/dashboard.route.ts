import { Router } from 'express'
import DashboardController from '@/controllers/dashboard.controller'
import { authenticate, requireAdmin } from '@middlewares/auth.middleware'

const router = Router()

router.get('/', authenticate, requireAdmin, DashboardController.getDashboardStats)

export default router 