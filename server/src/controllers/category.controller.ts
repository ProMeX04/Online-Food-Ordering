import CategoryService from "@/services/category.service"
import { sendError, sendSuccess } from "@/utils/responseUtils"
import { Request, Response } from "express"
import { ICategory } from "@/model/category.model"

export default class CategoryController {
    static async getAllCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await CategoryService.findAll()
            sendSuccess(res, categories)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async getCategoryById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const category = await CategoryService.findById(id)
            if (!category) {
                sendError(res, "Category not found")
                return
            }
            sendSuccess(res, category)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async getCategoryBySlug(req: Request, res: Response): Promise<void> {
        try {
            const slug = req.params.slug
            const category = await CategoryService.findBySlug(slug)
            if (!category) {
                sendError(res, "Category not found")
                return
            }
            sendSuccess(res, category)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async searchCategoriesByName(req: Request, res: Response): Promise<void> {
        try {
            const name = req.query.name as string
            if (!name) {
                sendError(res, "Tên danh mục tìm kiếm không được để trống", 400)
                return
            }

            const categories = await CategoryService.searchByName(name)
            sendSuccess(res, categories)
        } catch (error) {
            sendError(res, (error as Error).message)
        }
    }

    static async getPopularCategories(req: Request, res: Response): Promise<void> {
        try {
            const limit = Number(req.query.limit) || 10
            const categories = await CategoryService.getPopular(limit)
            sendSuccess(res, categories)
        } catch (error) {
            sendError(res, (error as Error).message)
        }
    }

    static async createCategory(req: Request, res: Response): Promise<void> {
        try {
            const categoryData: Partial<ICategory> = req.body
            const newCategory = await CategoryService.create(categoryData)
            sendSuccess(res, newCategory, "Category created successfully", 201)
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const categoryData: Partial<ICategory> = req.body
            const updatedCategory = await CategoryService.update(id, categoryData)
            if (!updatedCategory) {
                sendError(res, "Category not found")
                return
            }
            sendSuccess(res, updatedCategory, "Category updated successfully")
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }

    static async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const deletedCategory = await CategoryService.delete(id)
            if (!deletedCategory) {
                sendError(res, "Category not found")
                return
            }
            sendSuccess(res, {}, "Category deleted successfully")
        } catch (err) {
            sendError(res, (err as Error).message)
        }
    }
}
