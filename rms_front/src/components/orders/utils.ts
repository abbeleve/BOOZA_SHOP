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
  [OrderStatus.Accepted]: 'Принят',
  [OrderStatus.Cooking]: 'Готовится',
  [OrderStatus.Delivering]: 'Доставляется',
  [OrderStatus.Completed]: 'Выполнен',
  [OrderStatus.Cancelled]: 'Отменён',
};

export const activeStatuses: OrderStatus[] = [
  OrderStatus.Accepted,
  OrderStatus.Cooking,
  OrderStatus.Delivering,
];

export const getNextStatuses: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Accepted]: [OrderStatus.Cooking, OrderStatus.Cancelled],
  [OrderStatus.Cooking]: [OrderStatus.Delivering, OrderStatus.Cancelled],
  [OrderStatus.Delivering]: [OrderStatus.Completed, OrderStatus.Cancelled],
  [OrderStatus.Completed]: [],
  [OrderStatus.Cancelled]: [],
};

export const canChangeStatus = (currentStatus: OrderStatus): boolean => {
  return getNextStatuses[currentStatus]?.length > 0;
};

export const actionLabels: Record<OrderStatus, string> = {
  [OrderStatus.Accepted]: 'Принять',
  [OrderStatus.Cooking]: 'Готовить',
  [OrderStatus.Delivering]: 'В доставку',
  [OrderStatus.Completed]: 'Завершить',
  [OrderStatus.Cancelled]: 'Отменить',
};