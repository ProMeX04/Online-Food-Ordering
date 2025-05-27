import { IDish, IDishDocument } from '@/model/dish.model'
import { esClient } from '@/config/elasticSearch'
import DishModel from '@/model/dish.model'
import DishService from './dish.service'

export default class SearchService {
    private static indexReady: boolean = false;
    private static readonly INDEX_NAME = 'dishes';

    private static convertDishToDocument(dish: IDishDocument | any): any {
        return {
            id: dish._id?.toString(),
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
        };
    }

    static resetIndexStatus = (): void => {
        SearchService.indexReady = false;
    }

    static initElasticsearch = async (): Promise<void> => {
        try {
            SearchService.resetIndexStatus();
            await DishService.syncAllDishesToElasticsearch();
        } catch (error: any) {
            console.error(`❌ Lỗi khi khởi tạo Elasticsearch: ${error.message}`);
        }
    }

    static ensureIndex = async (): Promise<boolean> => {
        if (SearchService.indexReady) {
            return true;
        }

        try {
            const indexExists = await esClient.indices.exists({
                index: SearchService.INDEX_NAME
            });

            if (!indexExists) {
                await SearchService.createIndex();
                SearchService.indexReady = true;
                return true;
            }

            const needsRebuild = await SearchService.checkIndexNeedsRebuild();
            if (needsRebuild) {
                await SearchService.rebuildIndex();
            }

            SearchService.indexReady = true;
            return true;
        } catch (error: any) {
            console.error(`❌ Lỗi khi kiểm tra index Elasticsearch: ${error.message}`);
            return false;
        }
    }

    private static createIndex = async (): Promise<void> => {
        await esClient.indices.create({
            index: SearchService.INDEX_NAME,
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
        });
    }

    private static checkIndexNeedsRebuild = async (): Promise<boolean> => {
        try {
            const mapping = await esClient.indices.getMapping({
                index: SearchService.INDEX_NAME
            });
            const properties = mapping[SearchService.INDEX_NAME]?.mappings?.properties;

            if (!properties) return true;

            const requiredFields = [
                'name', 'description', 'price', 'category',
                'isAvailable', 'rating', 'soldCount', 'imageUrl',
                'isPopular', 'isNewDish', 'isSpecial'
            ];

            for (const field of requiredFields) {
                if (!properties[field]) return true;
            }

            return properties['createdAt'] || properties['updatedAt'] ? true : false;
        } catch (error) {
            return true;
        }
    }

    private static rebuildIndex = async (): Promise<void> => {
        const indexExists = await esClient.indices.exists({
            index: SearchService.INDEX_NAME
        });

        if (indexExists) {
            await esClient.indices.delete({
                index: SearchService.INDEX_NAME
            });
        }

        await SearchService.createIndex();
        await SearchService.syncDishesToElasticsearch();
    }

    static syncDishesToElasticsearch = async (): Promise<boolean> => {
        try {
            await SearchService.ensureIndex();

            const dishes = await DishModel.find({}).lean();
            if (dishes.length === 0) return true;

            const operations = dishes.flatMap(dish => [
                { index: { _index: SearchService.INDEX_NAME, _id: dish._id.toString() } },
                SearchService.convertDishToDocument(dish)
            ]);

            const response = await esClient.bulk({ operations, refresh: true });
            return !response.errors;
        } catch (error: any) {
            console.error(`❌ Lỗi khi đồng bộ dữ liệu: ${error.message}`);
            return false;
        }
    }

    static indexDish = async (dish: IDishDocument): Promise<boolean> => {
        try {
            await SearchService.ensureIndex();

            await esClient.index({
                index: SearchService.INDEX_NAME,
                id: dish.id,
                document: SearchService.convertDishToDocument(dish),
                refresh: true
            });

            return true;
        } catch (error: any) {
            console.error(`❌ Lỗi khi thêm/cập nhật món ăn: ${error.message}`);
            return false;
        }
    }

    static deleteDish = async (dishId: string): Promise<boolean> => {
        try {
            await SearchService.ensureIndex();

            try {
                await esClient.delete({
                    index: SearchService.INDEX_NAME,
                    id: dishId,
                    refresh: true
                });
                return true;
            } catch (error: any) {
                if (error.meta?.statusCode === 404) {
                    return true;
                }
                throw error;
            }
        } catch (error: any) {
            console.error(`❌ Lỗi khi xóa món ăn: ${error.message}`);
            return false;
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
            await SearchService.ensureIndex();

            // Xây dựng query
            const searchQuery = {
                bool: {
                    must: [{
                        multi_match: {
                            query,
                            fields: ['name^3', 'description'],
                            fuzziness: 'AUTO'
                        }
                    }],
                    filter: SearchService.buildFilters(filters)
                }
            };

            const response = await esClient.search({
                index: SearchService.INDEX_NAME,
                from: (page - 1) * limit,
                size: limit,
                query: searchQuery,
                sort: [
                    { _score: { order: 'desc' } },
                    { rating: { order: 'desc' } },
                    { soldCount: { order: 'desc' } }
                ]
            });

            const hits = response.hits.hits;
            const total = response.hits.total as any;

            const dishes: IDish[] = hits.map((hit: any) => ({
                _id: hit._source.id,
                name: hit._source.name,
                description: hit._source.description,
                price: hit._source.price,
                category: hit._source.category,
                isAvailable: hit._source.isAvailable,
                rating: hit._source.rating,
                soldCount: hit._source.soldCount,
                imageUrl: hit._source.imageUrl,
                isPopular: hit._source.isPopular || false,
                isNewDish: hit._source.isNewDish || false,
                isSpecial: hit._source.isSpecial || false
            } as unknown as IDish));

            return {
                dishes,
                total: total.value
            };
        } catch (error: any) {
            console.error(`❌ Lỗi khi tìm kiếm món ăn: ${error.message}`);
            return { dishes: [], total: 0 };
        }
    }

    private static buildFilters(filters: any): any[] {
        const filter: any[] = [];

        if (filters.category) {
            filter.push({ term: { category: filters.category } });
        }

        const booleanFields = ['isAvailable', 'isPopular', 'isNewDish', 'isSpecial'];
        booleanFields.forEach(field => {
            if (filters[field] !== undefined) {
                filter.push({ term: { [field]: filters[field] } });
            }
        });

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            const priceRange: any = { range: { price: {} } };
            if (filters.minPrice !== undefined) priceRange.range.price.gte = filters.minPrice;
            if (filters.maxPrice !== undefined) priceRange.range.price.lte = filters.maxPrice;
            filter.push(priceRange);
        }

        if (filters.minRating !== undefined || filters.maxRating !== undefined) {
            const ratingRange: any = { range: { rating: {} } };
            if (filters.minRating !== undefined) ratingRange.range.rating.gte = filters.minRating;
            if (filters.maxRating !== undefined) ratingRange.range.rating.lte = filters.maxRating;
            filter.push(ratingRange);
        }

        return filter;
    }
}



