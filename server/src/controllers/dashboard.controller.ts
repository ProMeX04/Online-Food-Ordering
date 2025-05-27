import { Request, Response } from 'express'
import Order from '@model/order.model'
import User from '@model/user.model'
import Dish from '@model/dish.model'
import { OrderStatus } from '../../../shared/enum'

export default class DashboardController {
    static async getDashboardStats(req: Request, res: Response) {
        try {
            const { from, to } = req.query
            const fromDate = from ? new Date(from as string) : new Date()
            const toDate = to ? new Date(to as string) : new Date()

            const totalOrders = await Order.countDocuments({
                createdAt: {
                    $gte: fromDate,
                    $lte: toDate,
                },
            })

            const totalRevenue = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: fromDate,
                            $lte: toDate,
                        },
                        status: OrderStatus.DELIVERED,
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' },
                    },
                },
            ]).then((result) => (result[0]?.total || 0))

            const totalUsers = await User.countDocuments()
            const totalProducts = await Dish.countDocuments()

            const orderStats = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: fromDate,
                            $lte: toDate,
                        },
                        status: OrderStatus.DELIVERED,
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                        },
                        total: { $sum: '$total' },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        total: 1,
                    },
                },
            ])

            const topDishes = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: fromDate,
                            $lte: toDate,
                        },
                        status: OrderStatus.DELIVERED,
                    },
                },
                {
                    $unwind: '$items',
                },
                {
                    $group: {
                        _id: '$items.dish',
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    },
                },
                {
                    $sort: { totalOrders: -1 },
                },
                {
                    $limit: 5,
                },
                {
                    $lookup: {
                        from: 'dishes',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'dish',
                    },
                },
                {
                    $unwind: '$dish',
                },
                {
                    $project: {
                        _id: '$dish._id',
                        name: '$dish.name',
                        image: '$dish.imageUrl',
                        totalOrders: 1,
                        totalRevenue: 1,
                    },
                },
            ])

            const recentOrders = await Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('userId', 'fullName')
                .select('id code userId status totalAmount createdAt')
            res.json({
                totalOrders,
                totalRevenue,
                totalUsers,
                totalProducts,
                orderStats,
                topDishes,
                recentOrders,
            })
        } catch (error) {
            console.error('Error getting dashboard stats:', error)
            res.status(500).json({ message: 'Không thể lấy dữ liệu thống kê' })
        }
    }
}