import apiClient from '../client';
import type {
    DashboardAnalyticsResponse,
    DetailedAnalyticsResponse,
    PeriodStats,
    MostPopularItemResponse
} from './schema';

export const analyticsApi = {
    getDashboardAnalytics: async (): Promise<DashboardAnalyticsResponse> => {
        const response = await apiClient.get<DashboardAnalyticsResponse>('/api/analytics/dashboard');
        return response.data;
    },

    getDetailedAnalytics: async (): Promise<DetailedAnalyticsResponse> => {
        const response = await apiClient.get<DetailedAnalyticsResponse>('/api/analytics/detailed');
        return response.data;
    },

    getPeriodStatistics: async (startDate: string, endDate: string): Promise<PeriodStats> => {
        const response = await apiClient.get<PeriodStats>('/api/analytics/period', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    },

    getSummaryAnalytics: async () => {
        const response = await apiClient.get('/api/analytics/summary');
        return response.data;
    },

    getMostPopularItem: async (): Promise<MostPopularItemResponse> => {
        const response = await apiClient.get<MostPopularItemResponse>('/api/analytics/most-popular');
        return response.data;
    },
};
