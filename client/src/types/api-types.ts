import { User, UserProfile, Dish, Category, Order, Review } from './schema';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface VerificationResponse {
  verified: boolean;
  message: string;
}

export interface MessageResponse {
  message: string;
}

export interface ProfileResponse {
  profile: UserProfile;
}

export interface AddressResponse {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface ImageUploadResponse {
  imageUrl: string;
}

export interface ProductsResponse {
  products: Dish[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface ProductResponse {
  product: Dish;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

// Order API response types
export interface OrdersResponse {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface OrderResponse {
  order: Order;
}

export interface ReviewsResponse {
  reviews: Review[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  statusCode?: number;
} 