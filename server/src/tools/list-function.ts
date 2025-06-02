import DishService from '@/services/dish.service'
import { addListDishToCart, addToCart, calculateCartTotal, displayCart, removeFromCart } from './temp-cart'
import CategoryService from '@/services/category.service'
export interface GetDishesInput {
    limit?: number
    sortBy?: string
    isPopular?: boolean
    isNewDish?: boolean
    isSpecial?: boolean
    minPrice?: number
    maxPrice?: number
    minRating?: number
    maxRating?: number
    searchTerm?: string
    category?: string
}

export const searchDishes = async ({ limit = undefined, sortBy = undefined, isPopular = undefined, isNewDish = undefined, isSpecial = undefined, minPrice = undefined, maxPrice = undefined, minRating = undefined, maxRating = undefined, searchTerm = undefined, category = undefined }: GetDishesInput) => {
    try {
        const dishes = await DishService.findDishesAgent({ limit, sortBy, isPopular, isNewDish, isSpecial, minPrice, maxPrice, minRating, maxRating, searchTerm, category })

        return {
            response: dishes,
            nextCall: false,
            responseType: 'dishes',
        }
    } catch (error) {
        return {
            message: error,
            response: [],
            nextCall: true,
            responseType: 'dishes',
        }
    }
}


export const getAllDishes = async () => {
    try {
        const dishes = await DishService.findAllDishesAgent()
        return {
            response: dishes,
            nextCall: false,
            responseType: 'dishes',
        }
    } catch (error) {
        return {
            message: error,
            response: [],
            nextCall: true,
            responseType: 'dishes',
        }
    }
}

export const getDishSchema = async () => {
    return `Đây là schema của món ăn
dishSchema = new Schema<IDishDocument>(
    {
        name: {type: String, required: true, unique: true, trim: true},
        description: {type: String, required: true, trim: true},
        price: {type: Number, required: true},
        imageUrl: {type: String, default: ""},
        category: {type: Schema.Types.ObjectId, ref: "Category", required: true},
        isAvailable: {type: Boolean, default: true},
        rating: {type: Number, required: true, min: 0, max: 5},
        soldCount: {type: Number, required: true, default: 0},
        isPopular: {type: Boolean, default: false},
        isNewDish: {type: Boolean, default: false},
        isSpecial: {type: Boolean, default: false}
    },
    {timestamps: true}
)`
}



export const getAllCategories = async () => {
    try {
        const categories = await CategoryService.findAll()
        return {
            response: categories,
            nextCall: false,
            responseType: 'categories',
        }
    } catch (error) {
        return {
            message: error,
            response: [],
            nextCall: true,
            responseType: 'categories',
        }
    }
}

const listFunction: Record<string, (...args: any[]) => Promise<any>> = {
    searchDishes,
    addToCart,
    removeFromCart,
    displayCart,
    getAllDishes,
    getDishSchema,
    getAllCategories,
    addListDishToCart,
    calculateCartTotal,
}



export default listFunction
