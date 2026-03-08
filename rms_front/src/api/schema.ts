export type { User } from '@/api/auths/schema';

export type MenuItem = {
    id: string,
    foodName: string,
    description?: string,
    imageUrl?: string,
    isAvailable: boolean,
    price: Number,
    preparationTime?: string,
    categoryId?: Number,
}

export type Category = {
    id: string,
    name: string,
}

export type Order = {
    createdAtDate: string,
    updatedAtDate: string,
    status: string,
    deliveryAddress?: string,
    totalAmount: number,
    userId: number,
    orderItems: OrderItem[],
}

export type OrderItem = {
    id: string,
}
