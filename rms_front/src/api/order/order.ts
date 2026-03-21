import apiClient from '../client';
import { type OrderCreate, type OrderResponse, type OrderShortResponse } from './schema';

export const orderApi = {
    createOrder: async (orderData: OrderCreate): Promise<OrderResponse> => {
        const response = await apiClient.post<OrderResponse>('/api/orders/', orderData);
        return response.data;
    },
    
    getMyOrders: async (statusFilter?: string): Promise<OrderShortResponse[]> => {
        const params: Record<string, string> = {};
        if (statusFilter && statusFilter !== 'ALL') {
            params.status_filter = statusFilter;
        }
        const response = await apiClient.get<OrderShortResponse[]>('/api/orders/my', { params });
        return response.data;
    },
    
    getOrder: async (orderId: number): Promise<OrderResponse> => {
        const response = await apiClient.get<OrderResponse>(`/api/orders/${orderId}`);
        return response.data;
    },
    
    getAllOrders: async (statusFilter?: string): Promise<OrderShortResponse[]> => {
        const params: Record<string, string> = {};
        if (statusFilter && statusFilter !== 'ALL') {
            params.status_filter = statusFilter;
        }
        const response = await apiClient.get<OrderShortResponse[]>('/api/orders/', { params });
        return response.data;
    },
    
    updateOrderStatus: async (orderId: number, status: string): Promise<OrderResponse> => {
        const response = await apiClient.patch<OrderResponse>(
            `/api/orders/${orderId}/status`,
            { status }
        );
        return response.data;
    },
    
    cancelOrder: async (orderId: number): Promise<OrderResponse> => {
        const response = await apiClient.post<OrderResponse>(`/api/orders/${orderId}/cancel`);
        return response.data;
    },
    
    completeOrder: async (orderId: number): Promise<OrderResponse> => {
        const response = await apiClient.post<OrderResponse>(`/api/orders/${orderId}/complete`);
        return response.data;
    },
};