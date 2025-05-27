import { Request, Response } from "express"
import OrderService from "@services/order.service"
import { sendError, sendPaginatedSuccess, sendSuccess } from "@/utils/responseUtils";
import { getFullImageUrl } from "@/utils/imageUtils";

export default class OrderController {
    static async createOrder(req: Request, res: Response) {
        try {
            const user = req.user;
            const order = await OrderService.create({
                ...req.body,
                userId: user?._id,
            })
            sendSuccess(res, order)
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }

    static async getOrderById(req: Request, res: Response) {
        try {
            const order = await OrderService.findByIdWithItems(req.params.id)
            if (!order) {
                return sendError(res, 'Order not found')
            }
            
            const processedOrder = {
                ...order,
                orderItems: order.orderItems.map((item: any) => {
                    return {
                        ...item,
                        dishId: {
                            ...(item.dishId as any),
                            imageUrl: getFullImageUrl(item.dishId.imageUrl)
                        }
                    }
                })
            }
            sendSuccess(res, processedOrder)
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }

    static async getUserOrders(req: Request, res: Response) {
        try {
            const orders = await OrderService.findByUserId(req.user?.id)
            sendSuccess(res, orders)
        } catch (error) {
            console.error(error)
            sendError(res, (error as Error).message);
        }
    }

    static async updateOrder(req: Request, res: Response) {
        try {
            const order = await OrderService.update(req.params.id, req.body)
            sendSuccess(res, order)
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }

    static async deleteOrder(req: Request, res: Response) {
        try {
            const order = await OrderService.delete(req.params.id)
            sendSuccess(res, order)
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }

    static async getAllOrdersWithItems(req: Request, res: Response) {
        try {
            const query: any = req.query
            const result = await OrderService.findAllWithItems(query)
            sendPaginatedSuccess(res, result.orders, result.total, result.page, result.limit, result.totalPages)
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }
    

    static async addOrderItem(req: Request, res: Response) {
        try {
            const order = await OrderService.addOrderItem(req.params.id, req.body)
            sendSuccess(res, order)
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }

    static async removeOrderItem(req: Request, res: Response) {
        try {
            const order = await OrderService.removeOrderItem(req.params.id, req.body)
            sendSuccess(res, order)
        } catch (error) {
            sendError(res, (error as Error).message);
        }
    }
}