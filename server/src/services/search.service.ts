import { IDish, IDishDocument } from '@/model/dish.model'
import { esClient } from '@/config/elasticSearch'
import DishModel from '@/model/dish.model'


export default class SearchService {
    private static indexReady: boolean = false;

    static ensureIndex = async (): Promise<boolean> => {
        if (SearchService.indexReady) {
            return true;
        }

        try {
            const indexExists = await esClient.indices.exists({
                index: 'dishes'
            })

            if (!indexExists) {
                await SearchService.createIndex()
                SearchService.indexReady = true;
                return true
            }

            const needsRebuild = await SearchService.checkIndexNeedsRebuild()
            if (needsRebuild) {
                console.log('Cấu trúc index đã thay đổi, tiến hành tạo lại index...')
                await SearchService.rebuildIndex()
                SearchService.indexReady = true;
                return true
            }

            SearchService.indexReady = true;
            return true
        } catch (error: any) {
            console.error(`❌ Lỗi khi đảm bảo index Elasticsearch: ${error.message}`)
            SearchService.indexReady = false;
            return false
        }
    }

    static resetIndexStatus = (): void => {
        SearchService.indexReady = false;
    }
    private static createIndex = async (): Promise<void> => {
        try {
            await esClient.indices.create({
                index: 'dishes',
                mappings: {
                    properties: {
                        name: { type: 'text', analyzer: 'standard' },
                        description: { type: 'text', analyzer: 'standard' },
                        price: { type: 'float' },
                        category: { type: 'keyword' },
                        isAvailable: { type: 'boolean' },
                        rating: { type: 'float' },
                        soldCount: { type: 'integer' },
                        imageUrl: { type: 'keyword' },
                        isPopular: { type: 'boolean' },
                        isNewDish: { type: 'boolean' },
                        isSpecial: { type: 'boolean' }
                    }
                }
            })
            console.log('✅ Đã tạo thành công index Elasticsearch "dishes"')
        } catch (error: any) {
            console.error(`❌ Lỗi khi tạo index Elasticsearch: ${error.message}`)
            throw error
        }
    }

    // Kiểm tra xem index có cần tạo lại không (cấu trúc không khớp)
    private static checkIndexNeedsRebuild = async (): Promise<boolean> => {
        try {
            const mapping = await esClient.indices.getMapping({ index: 'dishes' })
            const properties = mapping.dishes?.mappings?.properties

            const requiredFields = [
                'name', 'description', 'price', 'category', 
                'isAvailable', 'rating', 'soldCount', 'imageUrl', 
                'isPopular', 'isNewDish', 'isSpecial'
            ]

            if (!properties) return true

            for (const field of requiredFields) {
                if (!properties[field]) return true
            }

            if (properties['createdAt'] || properties['updatedAt']) return true

            return false
        } catch (error: any) {
            console.error(`❌ Lỗi khi kiểm tra cấu trúc index: ${error.message}`)
            return true
        }
    }

    private static rebuildIndex = async (): Promise<void> => {
        try {
            const indexExists = await esClient.indices.exists({ index: 'dishes' })
            if (indexExists) {
                await esClient.indices.delete({ index: 'dishes' })
                console.log('✅ Đã xóa index "dishes" cũ')
            }

            await SearchService.createIndex()

            await SearchService.syncDishesToElasticsearch()
        } catch (error: any) {
            console.error(`❌ Lỗi khi tạo lại index: ${error.message}`)
            throw error
        }
    }

    static syncDishesToElasticsearch = async (): Promise<boolean> => {
        try {
            const indexReady = await SearchService.ensureIndex()
            if (!indexReady) {
                console.error('❌ Không thể đảm bảo index Elasticsearch')
                return false
            }

            const dishes = await DishModel.find({}).lean()

            if (dishes.length === 0) {
                console.log('Không có món ăn nào để đồng bộ')
                return true
            }

            // Chuẩn bị dữ liệu để chèn vào Elasticsearch
            const operations = dishes.flatMap(dish => [
                { index: { _index: 'dishes', _id: dish._id.toString() } },
                {
                    id: dish._id.toString(),
                    name: dish.name,
                    description: dish.description,
                    price: dish.price,
                    category: dish.category?.toString(),
                    isAvailable: dish.isAvailable,
                    rating: dish.rating,
                    soldCount: dish.soldCount,
                    imageUrl: dish.imageUrl,
                    isPopular: dish.isPopular || false,
                    isNew: dish.isNew || false,
                    isSpecial: dish.isSpecial || false
                }
            ])

            // Sử dụng bulk API để chèn nhiều món ăn cùng một lúc
            const response = await esClient.bulk({ operations, refresh: true })

            if (response.errors) {
                const failedItems = response.items?.filter(item => item.index?.error)
                console.error(`❌ Có ${failedItems?.length || 0} món ăn lỗi khi đồng bộ vào Elasticsearch`)
                return false
            }

            console.log(`✅ Đã đồng bộ ${dishes.length} món ăn từ MongoDB sang Elasticsearch`)
            return true
        } catch (error: any) {
            console.error(`❌ Lỗi khi đồng bộ dữ liệu: ${error.message}`)
            return false
        }
    }

    static indexDish = async (dish: IDishDocument): Promise<boolean> => {
        try {
            // Không cần gọi ensureIndex mỗi lần cập nhật, chỉ kiểm tra indexReady
            // Nếu chưa sẵn sàng, gọi kiểm tra một lần
            if (!SearchService.indexReady) {
                const indexReady = await SearchService.ensureIndex();
                if (!indexReady) {
                    console.error('❌ Không thể đảm bảo index Elasticsearch khi cập nhật món ăn')
                    return false
                }
            }

            await esClient.index({
                index: 'dishes',
                id: dish.id,
                document: {
                    id: dish.id,
                    name: dish.name,
                    description: dish.description,
                    price: dish.price,
                    category: dish.category?.toString(),
                    isAvailable: dish.isAvailable,
                    rating: dish.rating,
                    soldCount: dish.soldCount,
                    imageUrl: dish.imageUrl,
                    isPopular: dish.isPopular || false,
                    isNewDish: dish.isNewDish || false,
                    isSpecial: dish.isSpecial || false
                },
                refresh: true
            })

            return true
        } catch (error: any) {
            console.error(`❌ Lỗi khi thêm/cập nhật món ăn vào Elasticsearch: ${error.message}`)
            return false
        }
    }

    static deleteDish = async (dishId: string): Promise<boolean> => {
        try {
            if (!SearchService.indexReady) {
                const indexReady = await SearchService.ensureIndex();
                if (!indexReady) {
                    console.error('❌ Không thể đảm bảo index Elasticsearch khi xóa món ăn')
                    return false
                }
            }

            const exists = await esClient.exists({
                index: 'dishes',
                id: dishId
            })

            if (!exists) {
                console.warn(`⚠️ Món ăn với ID ${dishId} không tồn tại trong Elasticsearch, bỏ qua thao tác xóa`)
                return true
            }

            await esClient.delete({
                index: 'dishes',
                id: dishId,
                refresh: true
            })

            return true
        } catch (error: any) {
            if (error.meta?.statusCode === 404) {
                console.warn(`⚠️ Món ăn với ID ${dishId} không tồn tại trong Elasticsearch, bỏ qua thao tác xóa`)
                return true
            }

            console.error(`❌ Lỗi khi xóa món ăn khỏi Elasticsearch: ${error.message}`)
            return false
        }
    }

    static searchDishes = async (
        query: string,
        filters: {
            category?: string;
            minPrice?: number;
            maxPrice?: number;
            minRating?: number;
            maxRating?: number;
            isAvailable?: boolean;
            isPopular?: boolean;
            isNewDish?: boolean;
            isSpecial?: boolean;
        } = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ dishes: IDish[], total: number }> => {
        try {
            if (!SearchService.indexReady) {
                const indexReady = await SearchService.ensureIndex();
                if (!indexReady) {
                    console.error('❌ Không thể đảm bảo index Elasticsearch khi tìm kiếm món ăn')
                    return { dishes: [], total: 0 }
                }
            }

            const must: any[] = [
                {
                    multi_match: {
                        query,
                        fields: ['name^3', 'description'],
                        fuzziness: 'AUTO'
                    }
                }
            ]

            const filter: any[] = []

            if (filters.category) {
                filter.push({ term: { category: filters.category } })
            }


            if (filters.isAvailable !== undefined) {
                filter.push({ term: { isAvailable: filters.isAvailable } })
            }


            if (filters.isPopular !== undefined) {
                filter.push({ term: { isPopular: filters.isPopular } })
            }

            if (filters.isNewDish !== undefined) {
                filter.push({ term: { isNewDish: filters.isNewDish } })
            }

            if (filters.isSpecial !== undefined) {
                filter.push({ term: { isSpecial: filters.isSpecial } })
            }

            if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
                const rangeFilter: any = { range: { price: {} } }

                if (filters.minPrice !== undefined) {
                    rangeFilter.range.price.gte = filters.minPrice
                }

                if (filters.maxPrice !== undefined) {
                    rangeFilter.range.price.lte = filters.maxPrice
                }

                filter.push(rangeFilter)
            }

            if (filters.minRating !== undefined || filters.maxRating !== undefined) {
                const rangeFilter: any = { range: { rating: {} } }

                if (filters.minRating !== undefined) {
                    rangeFilter.range.rating.gte = filters.minRating
                }

                if (filters.maxRating !== undefined) {
                    rangeFilter.range.rating.lte = filters.maxRating
                }

                filter.push(rangeFilter)
            }

            const response = await esClient.search({
                index: 'dishes',
                from: (page - 1) * limit,
                size: limit,
                query: {
                    bool: {
                        must,
                        filter
                    }
                },
                sort: [
                    { _score: { order: 'desc' } }, 
                    { rating: { order: 'desc' } }, 
                    { soldCount: { order: 'desc' } } 
                ]
            })

            const hits = response.hits.hits
            const total = response.hits.total as any

            const dishes: IDish[] = hits.map((hit: any) => {
                const source = hit._source
                return {
                    _id: source.id,
                    name: source.name,
                    description: source.description,
                    price: source.price,
                    category: source.category,
                    isAvailable: source.isAvailable,
                    rating: source.rating,
                    soldCount: source.soldCount,
                    imageUrl: source.imageUrl,
                    isPopular: source.isPopular || false,
                    isNewDish: source.isNewDish || false,
                    isSpecial: source.isSpecial || false
                } as unknown as IDish
            })

            return {
                dishes,
                total: total.value
            }
        } catch (error: any) {
            console.error(`❌ Lỗi khi tìm kiếm món ăn: ${error.message}`)
            return { dishes: [], total: 0 }
        }
    }
} 