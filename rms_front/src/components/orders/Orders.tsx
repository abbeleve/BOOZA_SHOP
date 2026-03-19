import { useState, useEffect } from 'react';
import { orderApi } from '@/api/order/order';
import { type OrderShortResponse, type OrderResponse } from '@/api/order/schema';
import { BeatLoader } from 'react-spinners';
import { OrderStatus, statusColors, statusLabels } from './utils';

interface OrderModalProps {
    orderId: number | null;
    onClose: () => void;
}

function OrderModal({ orderId, onClose }: OrderModalProps) {
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (orderId) {
            setLoading(true);
            orderApi.getOrder(orderId)
                .then(setOrder)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [orderId]);

    if (!orderId) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-surface-card relative transform overflow-hidden rounded-lg shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-surface-border">
                        <h2 className="text-lg font-bold font-main text-text-primary">
                            Заказ #{orderId}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Закрыть"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <BeatLoader color="var(--color-accent)" />
                            </div>
                        ) : order ? (
                            <div className="space-y-4">
                                {/* Status and Date */}
                                <div className="flex justify-between items-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status as OrderStatus] || 'bg-gray-100 text-gray-800'}`}>
                                        {statusLabels[order.status as OrderStatus] || order.status}
                                    </span>
                                    <span className="text-sm text-text-secondary font-main">
                                        {new Date(order.create_datetime).toLocaleString('ru-RU')}
                                    </span>
                                </div>

                                {/* Address */}
                                <div>
                                    <p className="text-sm text-text-secondary font-main mb-1">Адрес доставки</p>
                                    <p className="text-text-primary font-main">{order.delivery_address}</p>
                                </div>

                                {/* Description */}
                                {order.description && (
                                    <div>
                                        <p className="text-sm text-text-secondary font-main mb-1">Комментарий</p>
                                        <p className="text-text-primary font-main">{order.description}</p>
                                    </div>
                                )}

                                {/* Items */}
                                <div className="border-t border-surface-border pt-4">
                                    <h3 className="text-sm font-bold font-main text-text-primary mb-3">Состав заказа</h3>
                                    <div className="space-y-3">
                                        {order.items.map((item) => (
                                            <div key={item.order_food_id} className="flex gap-3">
                                                {item.image_url && (
                                                    <img
                                                        src={'/api' + item.image_url}
                                                        alt={item.food_name}
                                                        className="w-16 h-16 object-cover rounded-lg bg-surface-base"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-text-primary font-main">{item.food_name}</p>
                                                    <p className="text-sm text-text-secondary font-main">
                                                        {item.quantity} шт. × {item.price_per_item} ₽
                                                    </p>
                                                </div>
                                                <p className="font-bold text-text-primary font-main">
                                                    {item.total} ₽
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="border-t border-surface-border pt-4 flex justify-between items-center">
                                    <span className="font-bold font-main text-text-primary">Итого:</span>
                                    <span className="text-xl font-bold text-accent font-main">
                                        {order.total_amount} ₽
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-text-secondary py-8">Ошибка загрузки заказа</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface OrdersProps {
    orders: OrderShortResponse[];
}

function Orders({ orders }: OrdersProps) {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold font-main text-text-primary">Мои заказы</h1>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                    <div className="bg-surface-border p-4 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-text-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-text-primary font-main">У вас пока нет заказов</h2>
                    <p className="text-text-secondary mt-2 font-main">Оформите первый заказ в корзине</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.order_id}
                            className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedOrderId(order.order_id)}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-bold text-text-primary font-main">
                                            Заказ #{order.order_id}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary font-main mb-1">
                                        {new Date(order.create_datetime).toLocaleString('ru-RU')}
                                    </p>
                                    <p className="text-sm text-text-primary font-main">
                                        {order.delivery_address}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-center md:text-right">
                                        <p className="text-sm text-text-secondary font-main">
                                            {order.items_count} {order.items_count === 1 ? 'товар' : order.items_count < 5 ? 'товара' : 'товаров'}
                                        </p>
                                        <p className="text-xl font-bold text-accent font-main">
                                            {order.total_amount} ₽
                                        </p>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-text-secondary">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <OrderModal
                orderId={selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
            />
        </div>
    );
}

export default Orders;
