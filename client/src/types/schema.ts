import { z } from "zod";
import { IAddress } from "./address";

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video"
}

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Tên danh mục không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type Category = z.infer<typeof categorySchema>;

export const dishSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Tên món ăn không được để trống"),
  description: z.string(),
  price: z.number().min(0, "Giá không được âm"),
  imageUrl: z.string(),
  category: z.string(),
  isAvailable: z.boolean().default(true),
  rating: z.number().min(0).max(5),
  soldCount: z.number().default(0),
  isPopular: z.boolean().default(false),
  isNewDish: z.boolean().default(false),
  isSpecial: z.boolean().default(false)
});

export type Dish = z.infer<typeof dishSchema>;



export const orderSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  items: z.array(z.object({
    dishId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })),
  totalAmount: z.number().min(0),
  shippingAddress: z.object({
    fullName: z.string().min(1, "Tên không được để trống"),
    phone: z.string().min(1, "Số điện thoại không được để trống"),
    address: z.string().min(1, "Địa chỉ không được để trống"),
    district: z.string().min(1, "Quận/huyện không được để trống"),
    city: z.string().min(1, "Thành phố không được để trống")
  }),
  note: z.string().optional(),
  paymentID: z.string().optional(),
});


export type Order = z.infer<typeof orderSchema>;

export const reviewSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  dishId: z.string(),
  orderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  images: z.array(z.string()).optional(),
  isVerifiedPurchase: z.boolean()
});

export type Review = z.infer<typeof reviewSchema>;

export const testimonialSchema = z.object({
  _id: z.string(),
  userName: z.string(),
  userAvatar: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  createdAt: z.string().or(z.date())
});

export type Testimonial = z.infer<typeof testimonialSchema>;

export const userSchema = z.object({
  _id: z.string(),
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["customer", "admin"]),
  isVerified: z.boolean(),
  address: z.array(z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  })).optional(),
});

export const registerSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z.string().optional()
});

// Schema cho form đăng nhập
export const loginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống")
});

// User profile schema
export const userProfileSchema = z.object({
  _id: z.string(),
  user: z.string().or(z.object({ _id: z.string(), email: z.string() })),
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ").optional(),
  phone: z.string().optional(),
  imageUrl: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dob: z.string().or(z.date()).optional(),
  bio: z.string().optional(),
  address: z.array(z.any()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export type User = z.infer<typeof userSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;



export interface IOrderItem {
  dishId: string
  quantity: number
  price: number
}
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
export interface IOrder {
  _id?: string
  userId?: string
  orderItems: IOrderItem[]
  totalAmount: number
  notes?: string
  status: OrderStatus
  createdAt?: Date
  updatedAt?: Date
  paymentID?: string
  address: IAddress
} 





export enum PaymentMethod {
  COD = 'cod',
  BANK = 'bank',
  CARD = 'card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface IPayment {
  _id: string
  orderId: string
  amount: number
  method: string
  status: string
}


 