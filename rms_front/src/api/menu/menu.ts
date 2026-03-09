import apiClient from '../client';
import { type MenuItem, type Category } from './schema';

export const menuApi = {
    getMenuItems: async (categoryId?: number): Promise<MenuItem[]> => {
        const params: Record<string, any> = { available_only: true };
        if (categoryId !== undefined) {
            params.category_id = categoryId;
        }
        const response = await apiClient.get<MenuItem[]>('/api/menu', { params });
        return response.data;
    },
};
