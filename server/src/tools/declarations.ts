import { Tool, Type } from "@google/genai";

const tools: Tool[] = [
    {
        functionDeclarations: [
            {
                name: 'searchDishes',
                description: 'Tìm kiếm và trả về danh sách các món ăn theo các tiêu chí được cung cấp. category: danh mục món ăn là dạng ObjectId. Nếu không có tiêu chí nào được cung cấp sẽ trả về tất cả món ăn',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        limit: { type: Type.NUMBER, default: undefined, maximum: 10, minimum: 1 },
                        sortBy: { type: Type.STRING, default: undefined },
                        isPopular: { type: Type.BOOLEAN, default: undefined },
                        isNewDish: { type: Type.BOOLEAN, default: undefined },
                        isSpecial: { type: Type.BOOLEAN, default: undefined },
                        minPrice: { type: Type.NUMBER, default: undefined },
                        maxPrice: { type: Type.NUMBER, default: undefined },
                        minRating: { type: Type.NUMBER, default: undefined },
                        maxRating: { type: Type.NUMBER, default: undefined },
                        searchTerm: { type: Type.STRING, default: undefined },
                        category: { type: Type.STRING, default: undefined },
                    },
                },
            },

            {
                name: 'addToCart',
                description: 'Thêm món ăn vào giỏ hàng tạm thời của người dùng',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        dishId: { type: Type.STRING },
                    },
                },
            },

            {
                name: 'removeFromCart',
                description: 'Xóa 1 món ăn khỏi giỏ hàng tạm thời của người dùng',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        dishId: { type: Type.STRING },
                    },
                },
            },
            {
                name: 'displayCart',
                description: 'Trả về danh sách món ăn trong giỏ hàng tạm thời của người dùng',
            },
            {
                name: 'getAllCategories',
                description: 'Lấy dữ liệu danh mục món ăn từ cơ sở dữ liệu bao gồm: id, name, description, image, createdAt, updatedAt',
            },
            {
                name: 'addListDishToCart',
                description: 'Thêm danh sách món ăn vào giỏ hàng của người dùng tạm thời',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        dishIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                },
            },
            {
                name: 'calculateCartTotal',
                description: 'Tính tổng giá trị giỏ hàng của người dùng tạm thời',
            },
        ]
    }
]

export default tools