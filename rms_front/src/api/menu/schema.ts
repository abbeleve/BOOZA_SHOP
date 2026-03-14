export type { User } from '@/api/auths/schema';


export type MenuItem = {
    menu_id: number;
    food_name: string;
    price: number;
    category_id: number;
    description?: string;
    image_url?: string;
    is_available: boolean;
    preparation_time: string;
    category_name?: string;
}

export type Category = {
    category_id: number;
    name: string;
}
