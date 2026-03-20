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

    getMenuItem: async (menuId: number): Promise<MenuItem> => {
        const response = await apiClient.get<MenuItem>(`/api/menu/${menuId}`);
        return response.data;
    },

    createMenuItem: async (formData: FormData, config?: any): Promise<MenuItem> => {
        const response = await apiClient.post<MenuItem>('/api/menu', formData, config);
        return response.data;
    },

    updateMenuItem: async (menuId: number, formData: FormData, config?: any): Promise<MenuItem> => {
        const response = await apiClient.put<MenuItem>(`/api/menu/${menuId}`, formData, config);
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

    createCategory: async (name: string): Promise<Category> => {
        const response = await apiClient.post<Category>('/api/food-type', { name });
        return response.data;
    },

    deleteCategory: async (categoryId: number): Promise<void> => {
        await apiClient.delete(`/api/food-type/${categoryId}`);
    },
};
