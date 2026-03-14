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

    createMenuItem: async (item: {
        food_name: string;
        price: number;
        category_id: number;
        description?: string;
        image_url?: string;
        is_available?: boolean;
        preparation_time_minutes?: number;
    }): Promise<MenuItem> => {
        const response = await apiClient.post<MenuItem>('/api/menu', item)
        return response.data;
    },

    deleteMenuItem: async (menuId: number): Promise<void> => {
        await apiClient.delete(`/api/menu/${menuId}`);
    },
};

export const categoriesApi = {
    getCategories: async (): Promise<Category[]> => {
        const response = await apiClient.get<Category[]>('/api/food-type');
        return response.data;
    },
};
