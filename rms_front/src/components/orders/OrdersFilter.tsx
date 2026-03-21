import { OrderStatus, statusLabels } from './utils';

interface OrdersFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

function OrdersFilter({ currentFilter, onFilterChange }: OrdersFilterProps) {
  const filters = [
    { value: 'ALL', label: 'Все' },
    { value: OrderStatus.Accepted, label: statusLabels[OrderStatus.Accepted] },
    { value: OrderStatus.Cooking, label: statusLabels[OrderStatus.Cooking] },
    { value: OrderStatus.Delivering, label: statusLabels[OrderStatus.Delivering] },
    { value: OrderStatus.Completed, label: statusLabels[OrderStatus.Completed] },
    { value: OrderStatus.Cancelled, label: statusLabels[OrderStatus.Cancelled] },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentFilter === filter.value
              ? 'bg-accent text-text-inverse'
              : 'bg-surface-base text-text-primary border border-surface-border hover:bg-surface-hover'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default OrdersFilter;