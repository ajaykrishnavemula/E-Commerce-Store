// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  images: string[];
  rating: number;
  numReviews: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  _id: string;
  user: string | User;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  page: number;
  pages: number;
  total: number;
}

// Review Types
export interface Review {
  _id: string;
  user: string | User;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  page: number;
  pages: number;
  total: number;
}

// Wishlist Types
export interface Wishlist {
  _id: string;
  user: string;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface PaymentIntent {
  clientSecret: string;
  amount: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms?: boolean;
}

export interface CheckoutFormData {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

// Admin Types
export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  topProducts: Product[];
}


