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
