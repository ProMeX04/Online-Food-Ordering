import { IDish } from '@/model/dish.model'
import DishModel from '@/model/dish.model'
import redis from '@/config/redis'
import SearchService from '@/services/search-dishes.service'
import { IDishDocument } from '@/model/dish.model'
import { Types } from 'mongoose'
import fs from 'fs'
import { GoogleGenAI } from '@google/genai'
import { GEMINI_API_KEY } from '@/config'
import { getFullImageUrl, processImagesInArray } from '@/utils/imageUtils'

export interface IGetDishQuery {
    category?: string
    limit?: number
    page?: number
    sortBy?: string
    isAvailable?: boolean
    minRating?: number
    maxRating?: number
    minPrice?: number
    maxPrice?: number
    searchTerm?: string
    isPopular?: boolean
    isNewDish?: boolean
    isSpecial?: boolean

}
export interface ICreateDishRequest {
    name: string
    description: string
    price: number
    discountPrice?: number
    imageUrl?: string
    category: Types.ObjectId
    isAvailable?: boolean
    rating: number
    soldCount?: number
    isPopular?: boolean
    isNewDish?: boolean
    isSpecial?: boolean
}

export default class DishService {
    static gemini = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
    })

    static async primeAllDishesCache(): Promise<void> {
        try {
            const allDishes = await DishModel.find({ isAvailable: true }).lean()
            if (allDishes && allDishes.length > 0) {
                const pipeline = redis.pipeline()
                for (const dish of allDishes) {
                    const cacheKey = `dish:${dish._id}`
                    pipeline.set(cacheKey, JSON.stringify(dish), 'EX', 3600 * 24)
                }
                await pipeline.exec()
            }
        } catch (error) {
            console.error('Error priming all dishes cache:', error)
        }
    }

    static findByIds = async (ids: string[]) => {
        const cacheKeys = ids.map((id) => `dish:${id}`)
        const cachedData = await redis.mget(cacheKeys)
        if (cachedData.some((data) => !data)) {
            return null
        }
        const dishes = cachedData.map((data) => JSON.parse(data as string))
        return dishes
    }

    static findAll = async (query: IGetDishQuery = {}) => {
        if (query.searchTerm) {
            const { dishes, total } = await SearchService.searchDishes(
                query.searchTerm,
                {
                    category: query.category,
                    minPrice: query.minPrice,
                    maxPrice: query.maxPrice,
                    minRating: query.minRating,
                    maxRating: query.maxRating,
                    isAvailable: query.isAvailable,
                },
                query.page || 1,
                query.limit || 10,
            )

            const page = query.page || 1
            const limit = query.limit || 10
            const totalPages = Math.ceil(total / limit)

            return {
                dishes: processImagesInArray(dishes, 'imageUrl'),
                total,
                totalPages,
                page,
                limit,
            }
        }

        const cacheKey = `dishes:${JSON.stringify(query)}`

        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return JSON.parse(cachedData)
        }

        const filterOption: any = {
            ...(query.category && { category: query.category }),
            ...(query.isAvailable !== undefined && {
                isAvailable: query.isAvailable,
            }),
            price: {
                $lte: query.maxPrice ?? Number.MAX_SAFE_INTEGER,
                $gte: query.minPrice ?? 0,
            },
            rating: {
                $lte: query.maxRating ?? 5,
                $gte: query.minRating ?? 0,
            },
        }

        const sortBy =
            query?.sortBy?.split(',').reduce((acc: any, field: string) => {
                const isDesc = field.startsWith('-')
                const key = isDesc ? field.substring(1) : field
                acc[key] = isDesc ? -1 : 1
                return acc
            }, {}) || {}

        const page: number = query?.page || 1
        const limit: number = query?.limit || 10
        const total: number = await DishModel.countDocuments(filterOption)
        const totalPages: number = Math.ceil(total / limit)

        const dishes: IDish[] = await DishModel.find(filterOption)
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            
        const processedDishes = processImagesInArray(dishes, 'imageUrl')
        const result = { dishes: processedDishes, total, totalPages, page, limit }
        await redis.set(cacheKey, JSON.stringify(result), 'EX', 600)

        return result
    }

    static findDishesAgent = async (query: IGetDishQuery) => {
        if (query.searchTerm) {
            const { dishes } = await SearchService.searchDishes(
                query.searchTerm,
                {
                    category: query.category,
                    minPrice: query.minPrice,
                    maxPrice: query.maxPrice,
                    minRating: query.minRating,
                    maxRating: query.maxRating,
                    isAvailable: query.isAvailable,
                    isPopular: query.isPopular,
                    isNewDish: query.isNewDish,
                    isSpecial: query.isSpecial,
                },
                query.page || 1,
                query.limit || Number.MAX_SAFE_INTEGER,
            )

            return processImagesInArray(dishes, 'imageUrl')
        }

        const cacheKey = `dishes:${JSON.stringify(query)}`

        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return processImagesInArray(JSON.parse(cachedData), 'imageUrl')
        }

        const filterOption: any = {
            ...(query.category && { category: query.category }),
            ...(query.isAvailable !== undefined && {
                isAvailable: query.isAvailable,
            }),
            price: {
                $lte: query.maxPrice ?? Number.MAX_SAFE_INTEGER,
                $gte: query.minPrice ?? 0,
            },
            rating: {
                $lte: query.maxRating ?? 5,
                $gte: query.minRating ?? 0,
            },
            ...(query.isPopular !== undefined && {
                isPopular: query.isPopular,
            }),
            ...(query.isNewDish !== undefined && {
                isNewDish: query.isNewDish,
            }),
            ...(query.isSpecial !== undefined && {
                isSpecial: query.isSpecial,
            }),
        }

        const sortBy =
            query?.sortBy?.split(',').reduce((acc: any, field: string) => {
                const isDesc = field.startsWith('-')
                const key = isDesc ? field.substring(1) : field
                acc[key] = isDesc ? -1 : 1
                return acc
            }, {}) || {}

        const page: number = query?.page || 1
        const limit: number = query?.limit || Number.MAX_SAFE_INTEGER

        const dishes: IDish[] = await DishModel.find(filterOption)
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

        await redis.set(cacheKey, JSON.stringify(dishes), 'EX', 600)
        return processImagesInArray(dishes, 'imageUrl')
    }

    static findAllDishesAgent = async () => {
        const cacheKey = 'dishes'
        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return processImagesInArray(JSON.parse(cachedData), 'imageUrl')
        }
        const dishes = await DishModel.find({ isAvailable: true }).lean()
        await redis.set(cacheKey, JSON.stringify(dishes), 'EX', 600)
        return processImagesInArray(dishes, 'imageUrl')
    }

    static findSimilarDishes = async (id: string, category: string): Promise<IDish[]> => {
        const dishes = await DishModel.find({ category, isAvailable: true, _id: { $ne: id } })
            .sort({ rating: -1, soldCount: -1 })
            .limit(6)
            .lean()
        return processImagesInArray(dishes, 'imageUrl')
    }

    static findById = async (id: string): Promise<IDish | null> => {
        const cacheKey = `dish:${id}`
        const cachedDish = await redis.get(cacheKey)

        if (cachedDish) {
            const dish = JSON.parse(cachedDish)
            dish.imageUrl = getFullImageUrl(dish.imageUrl)
            return dish
        }

        const dish = await DishModel.findById(id).lean()

        if (!dish) {
            return null
        }
        await redis.set(cacheKey, JSON.stringify(dish), 'EX', 3600 * 24)
        dish.imageUrl = getFullImageUrl(dish.imageUrl)
        return dish
    }

    static create = async (dishData: ICreateDishRequest): Promise<IDish> => {
        const newDish = await DishModel.create(dishData)
        await DishService.updateCacheAndElasticsearch(newDish.id, newDish)
        return newDish
    }

    static update = async (id: string, dishData: Partial<IDish>): Promise<IDish | null> => {
        const updatedDish = await DishModel.findByIdAndUpdate(id, dishData, { new: true })

        if (updatedDish) {
            await DishService.updateCacheAndElasticsearch(id, updatedDish)
        }

        return updatedDish
    }

    static delete = async (id: string): Promise<IDish | null> => {
        const deletedDish = await DishModel.findByIdAndDelete(id)
        if (deletedDish) {
            await redis.del(`dish:${id}`)
            await DishService.invalidateDishesCache()
            await SearchService.deleteDish(id)
        }

        return deletedDish
    }

    static updateAvailability = async (id: string, isAvailable: boolean): Promise<IDish | null> => {
        const updatedDish = await DishModel.findByIdAndUpdate(id, { isAvailable }, { new: true })

        if (updatedDish) {
            await DishService.updateCacheAndElasticsearch(id, updatedDish)
        }

        return updatedDish
    }

    static updateRating = async (id: string, rating: number): Promise<IDish | null> => {
        const normalizedRating = Math.min(Math.max(rating, 0), 5)

        const updatedDish = await DishModel.findByIdAndUpdate(id, { rating: normalizedRating }, { new: true })

        if (updatedDish) {
            await DishService.updateCacheAndElasticsearch(id, updatedDish)
        }

        return updatedDish
    }

    static incrementSoldCount = async (id: string, quantity: number = 1): Promise<IDish | null> => {
        const updatedDish = await DishModel.findByIdAndUpdate(id, { $inc: { soldCount: quantity } }, { new: true })

        if (updatedDish) {
            await DishService.updateCacheAndElasticsearch(id, updatedDish)
        }

        return updatedDish
    }

    private static updateCacheAndElasticsearch = async (id: string, dish: IDishDocument): Promise<void> => {
        await redis.set(`dish:${id}`, JSON.stringify(dish), 'EX', 3600 * 24)
        await DishService.invalidateDishesCache()
        await SearchService.indexDish(dish)
    }

    private static invalidateDishesCache = async (): Promise<void> => {
        const keys = await redis.keys('dishes:*')

        if (keys.length > 0) {
            const pipeline = redis.pipeline()
            keys.forEach((key) => pipeline.del(key))
            await pipeline.exec()
        }
    }

    static getPopularDishes = async (limit: number = 6): Promise<IDish[]> => {
        const cacheKey = `dishes:popular:${limit}`

        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return processImagesInArray(JSON.parse(cachedData), 'imageUrl')
        }

        const popularDishes = await DishModel.find({ isAvailable: true, isPopular: true }).limit(limit).lean()

        await redis.set(cacheKey, JSON.stringify(popularDishes), 'EX', 3600 * 6)

        const processedDishes = processImagesInArray(popularDishes, 'imageUrl')

        return processedDishes
    }

    static getDishesByCategory = async (categoryId: string, limit: number = 20): Promise<IDish[]> => {
        const cacheKey = `dishes:category:${categoryId}:${limit}`

        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return processImagesInArray(JSON.parse(cachedData), 'imageUrl')
        }

        const dishes = await DishModel.find({ category: categoryId, isAvailable: true }).limit(limit).lean()
        await redis.set(cacheKey, JSON.stringify(dishes), 'EX', 3600 * 6)

        return processImagesInArray(dishes, 'imageUrl')
    }

    static syncAllDishesToElasticsearch = async (): Promise<boolean> => {
        SearchService.resetIndexStatus()
        return await SearchService.syncDishesToElasticsearch()
    }

    static searchDishesWithElasticsearch = async (
        query: string,
        filters: {
            category?: string
            minPrice?: number
            maxPrice?: number
            minRating?: number
            maxRating?: number
            isAvailable?: boolean
            isPopular?: boolean
            isNewDish?: boolean
            isSpecial?: boolean
        } = {},
        page: number = 1,
        limit: number = 20,
    ): Promise<{ dishes: IDish[]; total: number }> => {
        return await SearchService.searchDishes(query, filters, page, limit)
    }

    static getDishByFilters = async (
        filters: {
            category?: string
            isPopular?: boolean
            isNewDish?: boolean
            isSpecial?: boolean
        },
        limit: number = 10,
    ): Promise<IDish[]> => {
        const cacheKey = `dishes:filters:${JSON.stringify(filters)}:${limit}`

        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return JSON.parse(cachedData)
        }

        const filterOptions: any = {}

        if (filters.category) {
            filterOptions.category = filters.category
        }

        if (filters.isPopular !== undefined) {
            filterOptions.isPopular = filters.isPopular
        }

        if (filters.isNewDish !== undefined) {
            filterOptions.isNewDish = filters.isNewDish
        }

        if (filters.isSpecial !== undefined) {
            filterOptions.isSpecial = filters.isSpecial
        }
        filterOptions.isAvailable = true

        const dishes = await DishModel.find(filterOptions).sort({ rating: -1, soldCount: -1 }).limit(limit).lean()

        await redis.set(cacheKey, JSON.stringify(dishes), 'EX', 3600 * 6)

        return processImagesInArray(dishes, 'imageUrl')
    }

    static getSpecialDishes = async (limit: number = 6): Promise<IDish[]> => {
        const cacheKey = `dishes:special:${limit}`

        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return processImagesInArray(JSON.parse(cachedData), 'imageUrl')
        }

        const specialDishes = await DishModel.find({
            isSpecial: true,
            isAvailable: true,
        })
            .limit(limit)
            .lean()

        await redis.set(cacheKey, JSON.stringify(specialDishes), 'EX', 3600 * 6)

        return processImagesInArray(specialDishes, 'imageUrl')
    }

    static getNewDishes = async (limit: number = 6): Promise<IDish[]> => {
        console.log('getNewDishes', limit)
        const cacheKey = `dishes:new:${limit}`
        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return processImagesInArray(JSON.parse(cachedData), 'imageUrl')
        }

        const newDishes = await DishModel.find({ isAvailable: true, isNewDish: true }).limit(limit).lean()
        await redis.set(cacheKey, JSON.stringify(newDishes), 'EX', 3600 * 6)

        return processImagesInArray(newDishes, 'imageUrl')
    }

    static updateImage = async (dishId: string, imagePath: string): Promise<IDishDocument | null> => {
        const dish = await DishModel.findById(dishId)

        if (!dish) {
            throw new Error('Không tìm thấy món ăn')
        }

        if (dish.imageUrl && !dish.imageUrl.startsWith('http') && fs.existsSync(dish.imageUrl)) {
            fs.unlinkSync(dish.imageUrl)
        }

        dish.imageUrl = imagePath

        const updatedDish = await dish.save()

        await DishService.updateCacheAndElasticsearch(dishId, updatedDish)

        return updatedDish
    }
}
