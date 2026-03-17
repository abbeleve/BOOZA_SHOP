export interface OrderItemCreate {
    menu_item_id: number;
    quantity: number;
}

export interface OrderCreate {
    delivery_address: string;
    items: OrderItemCreate[];
    description?: string;
}

export interface OrderItemResponse {
    order_food_id: number;
    menu_item_id: number;
    food_name: string;
    quantity: number;
    price_per_item: number;
    total: number;
    image_url: string | null;
}

export interface OrderResponse {
    order_id: number;
    status: string;
    create_datetime: string;
    end_datetime: string | null;
    delivery_address: string;
    total_amount: number;
    description: string | null;
    items: OrderItemResponse[];
}

export interface OrderShortResponse {
    order_id: number;
    status: string;
    create_datetime: string;
    total_amount: number;
    delivery_address: string;
    items_count: number;
}
