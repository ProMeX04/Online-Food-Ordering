import { IDish } from "@/model/dish.model"
import DishService from "@/services/dish.service"

const userCart = new Map<string, IDish[]>()


const getOrCreateUserCart = (userId: string): IDish[] => {
    if (!userCart.has(userId)) {
        userCart.set(userId, [])
    }
    return userCart.get(userId) as IDish[]
}

export const addListDishToCart = async ({ userId, dishIds }: { userId: string, dishIds: string[] }) => {
    try {
        const dishes = await DishService.findByIds(dishIds)
        if (!dishes) {
            return {
                error: 'Món ăn không tồn tại',
                response: [],
                nextCall: true,
                responseType: 'dishes',
            }
        }
        const cart = getOrCreateUserCart(userId)
        cart.push(...dishes)
        userCart.set(userId, cart)
        return {
            message: "Đã thêm danh sách món ăn vào giỏ hàng",
            response: cart,
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

export const calculateCartTotal = async ({ userId }: { userId: string }) => {
    const cart = getOrCreateUserCart(userId)
    const total = cart.reduce((total, dish) => total + dish.price, 0)
    return {
        message: null,
        response: total,
        nextCall: false,
        responseType: 'cart',
    }
}

export const displayCart = async ({ userId }: { userId: string }) => {
    try {
        const dishes: IDish[] = getOrCreateUserCart(userId)
        return {
            message: "Đã hiển thị danh sách món ăn trong giỏ hàng",
            response: dishes,
            nextCall: false,
            responseType: 'dishes',
        }
    } catch (error) {
        console.log(error)
        return {
            message: error,
            response: [],
            nextCall: true,
            responseType: 'dishes',
        }
    }
}


export const addToCart = async ({ userId, dishId }: { userId: string, dishId: string }) => {
    try {
        const dish = await DishService.findById(dishId)
        if (!dish) {
            return {
                error: 'Món ăn không tồn tại',
                response: [],
                nextCall: true,
                responseType: 'cart',
            }
        }
        const cart = getOrCreateUserCart(userId)
        cart.push(dish)
        return {
            message: "Đã thêm món ăn vào giỏ hàng",
            response: 'Đã thêm món ăn vào giỏ hàng',
            nextCall: false,
            responseType: 'cart',
        }
    } catch (error) {
        console.log(error)
        return {
            message: error,
            response: [],
            nextCall: true,
            responseType: 'cart',
        }
    }
}

export const removeFromCart = async ({ userId, dishId }: { userId: string, dishId: string }) => {
    console.log(userId, dishId)
    const dish = await DishService.findById(dishId)
    if (!dish) {
        return {
            error: 'Món ăn không tồn tại',
            response: [],
            nextCall: true,
            responseType: 'cart',
        }
    }
    const cart = getOrCreateUserCart(userId)
    cart.splice(cart.indexOf(dish), 1)
    userCart.set(userId, cart)
    return {
        message: "Đã xóa món ăn khỏi giỏ hàng",
        response: 'Đã xóa món ăn khỏi giỏ hàng',
        nextCall: true,
        responseType: 'cart',
    }
}