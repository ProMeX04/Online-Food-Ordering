import { get, post, put, del, upload } from './http-client';

const API_PATHS = {
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		VERIFY_EMAIL: '/auth/verify-email',
		RESEND_VERIFICATION: '/auth/resend-verification',
		ME: '/auth/me',
		LOGOUT: '/auth/logout',
		FORGOT_PASSWORD: '/auth/forgot-password',
		RESET_PASSWORD: '/auth/reset-password',
		CHANGE_PASSWORD: '/auth/change-password'
	},
	USERS: {
		PROFILE: '/users/profile',
		ADDRESS: '/users/address',
		ADDRESS_BY_ID: (index: number) => `/users/address/${index}`
	},
	PRODUCTS: {
		DISHES: '/dishes',
		DISH_BY_SLUG: (slug: string) => `/dishes/${slug}`,
		DISH_BY_ID: (id: string) => `/dishes/${id}`,
		DISH_AVAILABILITY: (id: string) => `/dishes/${id}/availability`,
		DISH_MEDIA: (dishId: string) => `/dishes/${dishId}/media`,
		POPULAR_DISHES: '/dishes/popular',
		SPECIAL_DISHES: '/dishes/special',
		CATEGORIES: '/categories',
		CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
		CATEGORY_BY_SLUG: (slug: string) => `/categories/${slug}`
	},
	ORDERS: {
		ALL: '/orders',
		BY_ID: (id: string) => `/orders/${id}`,
		ADMIN: '/admin/orders',
		UPDATE_STATUS: (id: string) => `/admin/orders/${id}/status`
	}
};

export const api = {
	// === Auth ===
	auth: {
		login: (credentials: { username: string; password: string }) =>
			post(API_PATHS.AUTH.LOGIN, credentials),

		register: (userData: any) =>
			post(API_PATHS.AUTH.REGISTER, userData),

		verifyEmail: (code: string) =>
			post(API_PATHS.AUTH.VERIFY_EMAIL, { code }),

		resendVerification: (email: string) =>
			post(API_PATHS.AUTH.RESEND_VERIFICATION, { email }),

		getProfile: () =>
			get(API_PATHS.AUTH.ME),

		logout: () =>
			post(API_PATHS.AUTH.LOGOUT, {}),

		forgotPassword: (email: string) =>
			post(API_PATHS.AUTH.FORGOT_PASSWORD, { email }),

		resetPassword: (token: string, password: string) =>
			post(API_PATHS.AUTH.RESET_PASSWORD, { token, password }),

		changePassword: (currentPassword: string, newPassword: string) =>
			put(API_PATHS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword })
	},

	// === User ===
	user: {
		updateProfile: (userId: string, userData: any) =>
			put(`/users/${userId}`, userData),

		getAddresses: () =>
			get(API_PATHS.USERS.ADDRESS),

		addAddress: (address: any) =>
			post(API_PATHS.USERS.ADDRESS, address),

		updateAddress: (index: number, address: any) =>
			put(API_PATHS.USERS.ADDRESS_BY_ID(index), address),

		deleteAddress: (index: number) =>
			del(API_PATHS.USERS.ADDRESS_BY_ID(index)),

		uploadAvatar: (file: File, onProgress?: (percent: number) => void) => {
			const formData = new FormData();
			formData.append('avatar', file);
			return upload(`${API_PATHS.USERS.PROFILE}/avatar`, formData, {
				onUploadProgress: onProgress ? (e: any) => {
					const percent = Math.round((e.loaded * 100) / e.total);
					onProgress(percent);
				} : undefined
			});
		}
	},

	products: {
		getCategories: () =>
			get(API_PATHS.PRODUCTS.CATEGORIES),

		getCategory: (slug: string) =>
			get(API_PATHS.PRODUCTS.CATEGORY_BY_SLUG(slug)),

		createCategory: (categoryData: any) =>
			post(API_PATHS.PRODUCTS.CATEGORIES, categoryData),

		updateCategory: (id: string, categoryData: any) =>
			put(API_PATHS.PRODUCTS.CATEGORY_BY_ID(id), categoryData),

		deleteCategory: (id: string) =>
			del(API_PATHS.PRODUCTS.CATEGORY_BY_ID(id)),

		getDishes: (params?: any) =>
			get(API_PATHS.PRODUCTS.DISHES, { params }),

		getDish: (slug: string) =>
			get(API_PATHS.PRODUCTS.DISH_BY_SLUG(slug)),

		getDishById: (id: string) =>
			get(API_PATHS.PRODUCTS.DISH_BY_ID(id)),

		getDishMedia: (dishId: string) =>
			get(API_PATHS.PRODUCTS.DISH_MEDIA(dishId)),

		getPopularDishes: (limit: number = 8) =>
			get(API_PATHS.PRODUCTS.POPULAR_DISHES, { params: { limit } }),

		getSpecialDishes: (limit: number = 5) =>
			get(API_PATHS.PRODUCTS.SPECIAL_DISHES, { params: { limit } }),

		createDish: (dishData: any) =>
			post(API_PATHS.PRODUCTS.DISHES, dishData),

		updateDish: (id: string, dishData: any) =>
			put(API_PATHS.PRODUCTS.DISH_BY_ID(id), dishData),

		deleteDish: (id: string) =>
			del(API_PATHS.PRODUCTS.DISH_BY_ID(id)),

		updateDishAvailability: (id: string, isAvailable: boolean) =>
			put(API_PATHS.PRODUCTS.DISH_AVAILABILITY(id), { isAvailable })
	},

	orders: {
		getOrders: () =>
			get(API_PATHS.ORDERS.ALL),

		createOrder: (orderData: any) =>
			post(API_PATHS.ORDERS.ALL, orderData),

		getAdminOrders: () =>
			get(API_PATHS.ORDERS.ADMIN),

		updateOrderStatus: (orderId: string, status: string) =>
			put(API_PATHS.ORDERS.UPDATE_STATUS(orderId), { status })
	}
};

export default api;
