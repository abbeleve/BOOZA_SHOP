import { OrderStatus, statusColors, statusLabels } from './utils';

interface OrderStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const statusKey = status as OrderStatus;
  const colorClass = statusColors[statusKey] || 'bg-gray-100 text-gray-800';
  const label = statusLabels[statusKey] || status;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClasses[size]}`}>
      {label}
    </span>
  );
}

export default OrderStatusBadge;