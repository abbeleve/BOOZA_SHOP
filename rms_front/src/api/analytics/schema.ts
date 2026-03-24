export interface DailyStats {
    date: string;
    orders_count: number;
    revenue: number;
}

export interface TopMenuItem {
    menu_item_id: number;
    food_name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    total_quantity: number;
    orders_count: number;
}

export interface CategoryRevenue {
    category_id: number;
    category_name: string;
    revenue: number;
}

export interface PeriodStats {
    orders_count: number;
    completed_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    average_order_value: number;
}

export interface DashboardAnalyticsResponse {
    today: PeriodStats;
    month: PeriodStats;
    daily_dynamics: DailyStats[];
    top_menu_items: TopMenuItem[];
}

export interface DetailedAnalyticsResponse extends DashboardAnalyticsResponse {
    revenue_by_category: CategoryRevenue[];
}

export interface PeriodStatsRequest {
    start_date: string;
    end_date: string;
}

export interface MostPopularItemResponse {
    menu_item_id: number;
    food_name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    total_quantity: number;
    orders_count: number;
}
