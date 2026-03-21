import apiClient from '../client';
import type { User, UserUpdateRequest, UserUpdateResponse } from './schema';

export const authApi = {
    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/api/auth/me');
        return response.data;
    },

    updateProfile: async (updateData: UserUpdateRequest): Promise<UserUpdateResponse> => {
        const response = await apiClient.put<UserUpdateResponse>('/api/auth/me', updateData);
        return response.data;
    },
};
