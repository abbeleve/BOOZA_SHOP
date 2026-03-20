export enum OrderStatus {
    Accepted = 'ACCEPTED',
    Cooking = 'COOKING',
    Delivering = 'DELIVERING',
    Completed = 'COMPLETED',
    Cancelled = 'CANCELLED',
}

export const statusColors: Record<OrderStatus, string> = {
    [OrderStatus.Accepted]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.Cooking]: 'bg-blue-100 text-blue-800',
    [OrderStatus.Delivering]: 'bg-orange-100 text-orange-800',
    [OrderStatus.Completed]: 'bg-green-100 text-green-800',
    [OrderStatus.Cancelled]: 'bg-red-100 text-red-800',
};

export const statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.Accepted]: 'Ожидает подтверждения',
    [OrderStatus.Cooking]: 'В обработке',
    [OrderStatus.Delivering]: 'Доставляется',
    [OrderStatus.Completed]: 'Выполнен',
    [OrderStatus.Cancelled]: 'Отменён',
};

export const activeStatuses: OrderStatus[] = [
    OrderStatus.Accepted,
    OrderStatus.Cooking,
    OrderStatus.Delivering,
];