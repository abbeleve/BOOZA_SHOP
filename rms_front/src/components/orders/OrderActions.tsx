import { OrderStatus, getNextStatuses, actionLabels } from './utils';

interface OrderActionsProps {
  orderId: number;
  currentStatus: string;
  onStatusChange: (orderId: number, newStatus: string) => Promise<void>;
}

function OrderActions({ orderId, currentStatus, onStatusChange }: OrderActionsProps) {
  const statusKey = currentStatus as OrderStatus;
  const availableStatuses = getNextStatuses[statusKey] || [];

  if (availableStatuses.length === 0) {
    return (
      <div className="mt-3 text-sm text-text-secondary font-main">
        Статус нельзя изменить
      </div>
    );
  }

  const handleClick = async (newStatus: OrderStatus) => {
    if (confirm(`Изменить статус заказа на "${actionLabels[newStatus]}"?`)) {
      await onStatusChange(orderId, newStatus);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {availableStatuses.map((status) => (
        <button
          key={status}
          onClick={() => handleClick(status)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            status === OrderStatus.Cancelled
              ? 'bg-error text-text-inverse hover:bg-error/80'
              : 'bg-accent text-text-inverse hover:bg-accent-hover'
          }`}
        >
          {actionLabels[status]}
        </button>
      ))}
    </div>
  );
}

export default OrderActions;