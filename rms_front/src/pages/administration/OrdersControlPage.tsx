import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { orderApi } from '@/api/order/order';
import { type OrderShortResponse } from '@/api/order/schema';
import AdministrationHeader from "@/components/administration/AdministraionHeader";
import { adminHeaderItems } from '@/config/main';
import Orders from "@/components/orders/Orders";
import OrdersFilter from "@/components/orders/OrdersFilter";
import { BeatLoader } from "react-spinners";
import { activeStatuses } from '@/components/orders/utils';
import { adminHeaderItems } from "@/config/admin";


function OrdersControlPage() {
    const { user } = useUser();
    const [orders, setOrders] = useState<OrderShortResponse[]>([]);
    const [filter, setFilter] = useState<string>('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAdmin = user?.is_staff || user?.role === 'admin' || user?.role === 'staff';

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const statusParam = filter !== 'ALL' ? filter : undefined;
            const data = await orderApi.getAllOrders(statusParam);
            setOrders(data);
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            setError(err.response?.data?.detail || 'Ошибка при загрузке заказов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    // Автообновление для активных заказов
    useEffect(() => {
        const hasActiveOrder = orders.some(order =>
            activeStatuses.includes(order.status as any)
        );
        if (!hasActiveOrder) {
            return;
        }
        const intervalId = setInterval(() => {
            fetchOrders();
        }, 30000);
        return () => clearInterval(intervalId);
    }, [orders]);

    // ✅ Обновление статуса заказа с перезагрузкой списка
    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            await orderApi.updateOrderStatus(orderId, newStatus);
            await fetchOrders(); // ✅ Обновляем список после изменения
        } catch (err: any) {
            console.error('Failed to update order status:', err);
            alert(err.response?.data?.detail || 'Ошибка при обновлении статуса');
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <h1 className="text-4xl font-bold font-main text-text-primary mb-4">
                    Доступ запрещён
                </h1>
                <p className="text-lg text-text-secondary font-main text-center mb-8 max-w-md">
                    Извините, у вас недостаточно прав для доступа к этой странице.
                </p>
                <a
                    href="/admin/menu"
                    className="bg-accent hover:bg-accent-hover text-text-inverse font-main font-medium py-3 px-6 rounded-lg transition-colors"
                >
                    Вернуться в админку
                </a>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AdministrationHeader items={adminHeaderItems} />
            <main className="py-10">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold font-main text-text-primary mb-2">
                            Управление заказами
                        </h1>
                        <p className="text-text-secondary font-main">
                            Просмотр и обработка всех заказов ресторана
                        </p>
                    </div>

                    <OrdersFilter
                        currentFilter={filter}
                        onFilterChange={setFilter}
                    />

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <BeatLoader color="var(--color-accent)" />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-error/10 border border-error rounded-lg text-error text-sm font-main">
                            {error}
                            <button
                                onClick={fetchOrders}
                                className="ml-4 underline hover:no-underline"
                            >
                                Повторить
                            </button>
                        </div>
                    ) : (
                        <Orders
                            orders={orders}
                            isAdmin={true}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default OrdersControlPage;