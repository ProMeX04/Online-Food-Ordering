import DishController from "@/controllers/dish.controller"
import { Router } from "express"
import { authenticate, requireAdmin } from "@/middlewares/auth.middleware"
import { dishUpload } from "@/middlewares/upload.middleware"
const router = Router()

router.get("/", DishController.getAllDish)
router.get("/popular", DishController.getPopularDishes)
router.get("/special", DishController.getSpecialDishes)
router.get("/category/:categoryId", DishController.getDishesByCategory)
router.get("/search/elasticsearch", DishController.searchDishes)
router.get("/:id", DishController.getDishDetail)
router.post("/", authenticate, requireAdmin, DishController.createDish)
router.post("/sync-elasticsearch", authenticate, requireAdmin, DishController.syncDishesToElasticsearch)
router.put("/:id", authenticate, requireAdmin, DishController.updateDish)
router.put("/:id/availability", authenticate, requireAdmin, DishController.updateDishAvailability)
router.put("/:id/rating", authenticate, requireAdmin, DishController.updateDishRating)
router.put("/:id/increment-sold", authenticate, requireAdmin, DishController.incrementSoldCount)
router.delete("/:id", authenticate, requireAdmin, DishController.deleteDish)

router.post("/:id/image", authenticate, requireAdmin, dishUpload.single('image'), DishController.uploadDishImage)
router.get("/similar/:id", DishController.getSimilarDishes)
export default router
