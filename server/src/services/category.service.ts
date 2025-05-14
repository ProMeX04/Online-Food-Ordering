import CategoryModel, { ICategory } from "@/model/category.model"
import redis from "@config/redis"

const CATEGORY_CACHE_PREFIX = "category:"
const CATEGORIES_CACHE_KEY = "categories:all"

export default class CategoryService {
    private static async invalidateCache(id?: string) {
        const pipeline = redis.pipeline()
        pipeline.del(CATEGORIES_CACHE_KEY)
        if (id) {
            pipeline.del(`${CATEGORY_CACHE_PREFIX}${id}`)
        }
        await pipeline.exec()
    }

    static async findAll(): Promise<ICategory[]> {
        const cachedCategories = await redis.get(CATEGORIES_CACHE_KEY)
        if (cachedCategories) {
            return JSON.parse(cachedCategories)
        }

        const categories = await CategoryModel.find().sort({ name: 1 })
        await redis.set(CATEGORIES_CACHE_KEY, JSON.stringify(categories))
        return categories
    }

    static async findBySlug(slug: string): Promise<ICategory | null> {
        const cacheKey = `${CATEGORY_CACHE_PREFIX}${slug}`
        const cachedCategory = await redis.get(cacheKey)
        if (cachedCategory) {
            return JSON.parse(cachedCategory)
        }
        const category = await CategoryModel.findOne({ slug })
        if (!category) {
            throw new Error("Category not found")
        }

        if (category) {
            await redis.set(cacheKey, JSON.stringify(category))
        }

        return category
    }

    static async findById(id: string): Promise<ICategory | null> {
        const cacheKey = `${CATEGORY_CACHE_PREFIX}${id}`
        const cachedCategory = await redis.get(cacheKey)
        if (cachedCategory) {
            return JSON.parse(cachedCategory)
        }
        const category = await CategoryModel.findById(id)
        if (!category) {
            throw new Error("Category not found")
        }
        return category
    }
    
    static searchByName = async (name: string): Promise<ICategory[]> => {
        return await CategoryModel.find({
            name: { $regex: name, $options: 'i' }
        });
    }

    static async create(categoryData: Partial<ICategory>): Promise<ICategory> {
        const existingCategory = await CategoryModel.findOne({ name: categoryData.name })
        if (existingCategory) {
            throw new Error("Category with this name already exists")
        }

        const newCategory = await CategoryModel.create(categoryData)
        await CategoryService.invalidateCache() // Invalidate list cache
        return newCategory
    }

    static async update(id: string, categoryData: Partial<ICategory>): Promise<ICategory | null> {
        // Check if updating name to one that already exists (excluding itself)
        if (categoryData.name) {
            const existingCategory = await CategoryModel.findOne({
                name: categoryData.name,
                _id: { $ne: id }
            })
            if (existingCategory) {
                throw new Error("Another category with this name already exists")
            }
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(id, categoryData, { new: true })
        if (updatedCategory) {
            await CategoryService.invalidateCache(id)
        }
        return updatedCategory
    }

    static async delete(id: string): Promise<ICategory | null> {
        const deletedCategory = await CategoryModel.findByIdAndDelete(id)
        if (deletedCategory) {
            await CategoryService.invalidateCache(id)
        }
        return deletedCategory
    }

    static getPopular = async (limit: number = 10): Promise<ICategory[]> => {
        const cacheKey = `categories:popular:${limit}`

        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return JSON.parse(cachedData)
        }

        const popularCategories = await CategoryModel.find()
            .limit(limit)

        await redis.set(cacheKey, JSON.stringify(popularCategories))
        return popularCategories
    }
}
