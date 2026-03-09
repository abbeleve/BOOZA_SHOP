export type { User } from '@/api/auths/schema';


export type MenuItem = {
    menuId: number;
    foodName: string;
    price: number;
    categoryId: number;
    description?: string;
    imageUrl?: string;
    isAvailable: boolean;
    preparationTime: string;
    categoryName?: string;
}

export type Category = {
    categoryId: number;
    name: string;
}