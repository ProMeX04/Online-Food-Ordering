import { Router } from "express"
import CategoryController from "@/controllers/category.controller"
import { authenticate, requireAdmin } from "@/middlewares/auth.middleware"

const router = Router()

router.get("/", CategoryController.getAllCategories)
router.get("/:id", CategoryController.getCategoryById)
router.get("/slug/:slug", CategoryController.getCategoryBySlug)
router.get("/search", CategoryController.searchCategoriesByName)
router.get("/popular", CategoryController.getPopularCategories)
router.post("/", authenticate, requireAdmin, CategoryController.createCategory)
router.put("/:id", authenticate, requireAdmin, CategoryController.updateCategory)
router.delete("/:id", authenticate, requireAdmin, CategoryController.deleteCategory)

export default router
