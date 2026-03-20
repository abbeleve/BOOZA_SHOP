import apiClient from '../client';
import { type OrderCreate, type OrderResponse, type OrderShortResponse } from './schema';

export const orderApi = {
    createOrder: async (orderData: OrderCreate): Promise<OrderResponse> => {
        const response = await apiClient.post<OrderResponse>('/api/orders/', orderData);
        return response.data;
    },

    getMyOrders: async (statusFilter?: string): Promise<OrderShortResponse[]> => {
        const params: Record<string, string> = {};
        if (statusFilter) {
            params.status = statusFilter;
        }
        const response = await apiClient.get<OrderShortResponse[]>('/api/orders/my', { params });
        return response.data;
    },

    getOrder: async (orderId: number): Promise<OrderResponse> => {
        const response = await apiClient.get<OrderResponse>(`/api/orders/${orderId}`);
        return response.data;
    },
};
