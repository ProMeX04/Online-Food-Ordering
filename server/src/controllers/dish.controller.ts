import { IDish } from "@/model/dish.model"
import DishService, { ICreateDishRequest, IGetDishQuery } from "@/services/dish.service"
import { Request, Response } from "express"
import { sendSuccess, sendError, sendPaginatedSuccess } from "@/utils/responseUtils"


export default class DishController {
    static async getAllDish(req: Request, res: Response): Promise<void> {
        try {
            const query: IGetDishQuery = req.query
            const result = await DishService.findAll(query)
            
            sendPaginatedSuccess(res, result.dishes, result.total, result.page, result.limit, result.totalPages)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async getSimilarDishes(req: Request, res: Response): Promise<void> {
        try {
            const id: string = req.params.id
            const category: string = req.query.category as string
            const dishes = await DishService.findSimilarDishes(id, category)
            sendSuccess(res, dishes)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }


    static async getDishDetail(req: Request, res: Response): Promise<void> {
        try {
            const id: string = req.params.id
            const dish: IDish | null = await DishService.findById(id)
            if (!dish) throw new Error("Dish Not Found")

            sendSuccess(res, dish)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async createDish(req: Request, res: Response): Promise<void> {
        try {
            const newDish: ICreateDishRequest = req.body
            const createdDish = await DishService.create(newDish)

            sendSuccess(res, createdDish, "Dish created successfully", 201)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async updateDish(req: Request, res: Response): Promise<void> {
        try {
            const id: string = req.params.id
            const dish: Partial<IDish> = req.body
            const updatedDish = await DishService.update(id, dish)
            if (!updatedDish) throw new Error("Dish Not Found")

            sendSuccess(res, updatedDish, "Dish updated successfully")
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }
    static async deleteDish(req: Request, res: Response): Promise<void> {
        try {
            const id: string = req.params.id
            const deletedDish = await DishService.delete(id)
            if (!deletedDish) throw new Error("Dish Not Found")
            sendSuccess(res, { id }, "Dish deleted successfully")
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }
    static async updateDishAvailability(req: Request, res: Response): Promise<void> {
        try {
            const id: string = req.params.id
            const { isAvailable } = req.body

            if (isAvailable === undefined) {
                throw new Error("isAvailable is required")
            }

            const updatedDish = await DishService.updateAvailability(id, isAvailable)
            if (!updatedDish) throw new Error("Dish Not Found")

            sendSuccess(res, updatedDish, `Dish is now ${isAvailable ? 'available' : 'unavailable'}`)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async updateDishRating(req: Request, res: Response): Promise<void> {
        try {
            const id: string = req.params.id
            const { rating } = req.body

            if (rating === undefined) {
                throw new Error("Rating is required")
            }

            const updatedDish = await DishService.updateRating(id, rating)
            if (!updatedDish) throw new Error("Dish Not Found")

            sendSuccess(res, updatedDish, "Dish rating updated successfully")
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }
    static async incrementSoldCount(req: Request, res: Response): Promise<void> {
        try {
            const id: string = req.params.id
            const { quantity } = req.body

            const updatedDish = await DishService.incrementSoldCount(id, quantity || 1)
            if (!updatedDish) throw new Error("Dish Not Found")

            sendSuccess(res, updatedDish, "Dish sold count updated successfully")
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }


    static async getPopularDishes(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 10
            const dishes = await DishService.getPopularDishes(limit)
            sendSuccess(res, dishes)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async getNewDishes(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 10
            const dishes = await DishService.getNewDishes(limit)
            sendSuccess(res, dishes)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async getDishesByCategory(req: Request, res: Response): Promise<void> {
        try {
            const categoryId = req.params.categoryId
            const limit = req.query.limit ? Number(req.query.limit) : 20

            const dishes = await DishService.getDishesByCategory(categoryId, limit)
            sendSuccess(res, dishes)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }


    static async syncDishesToElasticsearch(req: Request, res: Response): Promise<void> {
        try {
            const success = await DishService.syncAllDishesToElasticsearch()

            if (success) {
                sendSuccess(res, { success }, "Đã đồng bộ thành công dữ liệu món ăn sang Elasticsearch")
            } else {
                throw new Error("Có lỗi xảy ra khi đồng bộ dữ liệu sang Elasticsearch")
            }
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async searchDishes(req: Request, res: Response): Promise<void> {
        try {
            const { query, category, minPrice, maxPrice, minRating, maxRating, isAvailable, page, limit } = req.query

            if (!query) {
                throw new Error("Query parameter is required")
            }

            const filters = {
                category: category as string | undefined,
                minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
                minRating: minRating ? parseFloat(minRating as string) : undefined,
                maxRating: maxRating ? parseFloat(maxRating as string) : undefined,
                isAvailable: isAvailable ? (isAvailable as string) === 'true' : undefined
            }

            const pageNumber = page ? parseInt(page as string) : 1
            const limitNumber = limit ? parseInt(limit as string) : 20

            const result = await DishService.searchDishesWithElasticsearch(
                query as string,
                filters,
                pageNumber,
                limitNumber
            )

            sendSuccess(res, result.dishes)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async getSpecialDishes(req: Request, res: Response): Promise<void> {
        try {
            const limit = Number(req.query.limit) || 5;
            const dishes = await DishService.getSpecialDishes(limit)
            sendSuccess(res, dishes)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async uploadDishImage(req: Request, res: Response): Promise<void> {
        try {
            const id: string = req.params.id
            if (!req.file) {
                throw new Error("Không tìm thấy file hình ảnh")
            }

            const imageUrl = req.file.path
            const updatedDish = await DishService.updateImage(id, imageUrl)

            if (!updatedDish) throw new Error("Dish Not Found")

            sendSuccess(res, updatedDish, "Cập nhật hình ảnh món ăn thành công")
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }
}
