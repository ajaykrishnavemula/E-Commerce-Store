import apiService from './api';
import type { Order, OrdersResponse, CheckoutFormData } from '../types';

class OrderService {
  async createOrder(orderData: CheckoutFormData): Promise<Order> {
    return await apiService.post<Order>('/orders', orderData);
  }

  async getOrders(page: number = 1, limit: number = 10): Promise<OrdersResponse> {
    return await apiService.get<OrdersResponse>('/orders', { page, limit });
  }

  async getOrder(id: string): Promise<Order> {
    return await apiService.get<Order>(`/orders/${id}`);
  }

  async cancelOrder(id: string): Promise<Order> {
    return await apiService.put<Order>(`/orders/${id}/cancel`);
  }

  // Admin methods
  async getAllOrders(page: number = 1, limit: number = 10, status?: string): Promise<OrdersResponse> {
    return await apiService.get<OrdersResponse>('/admin/orders', { page, limit, status });
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return await apiService.put<Order>(`/admin/orders/${id}/status`, { status });
  }

  async markAsDelivered(id: string): Promise<Order> {
    return await apiService.put<Order>(`/admin/orders/${id}/deliver`);
  }
}

export const orderService = new OrderService();
export default orderService;
