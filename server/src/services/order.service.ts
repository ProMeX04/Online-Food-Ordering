import { IOrder } from "@model/order.model"
import { IOrderItem } from "@model/orderItem.model"
import Order from "@model/order.model"


export default class OrderService {
    static async create(order: IOrder) {
        const newOrder = await Order.create(order)
        return newOrder
    }

    static async findById(id: string) {
        const order = await Order.findById(id).lean()
        return order
    }

    static async findByIdWithItems(id: string) {
        const order = await Order.findById(id).populate('orderItems.dishId').lean()
        return order
    }

    static async findByUserId(userId: string, sort: any = { createdAt: -1 }) {
        const orders = await Order.find({ userId }).sort(sort).lean()
        return orders
    }

    static async update(id: string, order: IOrder) {
        const updatedOrder = await Order.findByIdAndUpdate(id, order, { new: true }).lean()
        return updatedOrder
    }

    static async delete(id: string) {
        const deletedOrder = await Order.findByIdAndDelete(id).lean()
        return deletedOrder
    }

    static async findAllWithItems(query: any) {
        const { page = 1, limit = 10, sort = { createdAt: -1 } } = query

        const filterOption: any = {
            ...(query.status && { status: query.status }),
        }
        const skip = (page - 1) * limit
        const orders = await Order.find(filterOption).sort(sort).skip(skip).limit(limit).populate('orderItems.dishId').lean()
        const total = await Order.countDocuments(filterOption)
        const totalPages = Math.ceil(total / limit)
        return { orders, total, page, limit, totalPages }
    }

    static async addOrderItem(id: string, orderItem: IOrderItem) {
        const order = await Order.findByIdAndUpdate(id, { $push: { orderItems: orderItem } }, { new: true }).lean()
        return order
    }

    static async removeOrderItem(id: string, orderItem: IOrderItem) {
        const order = await Order.findByIdAndUpdate(id, { $pull: { orderItems: orderItem } }, { new: true }).lean()
        return order
    }
}