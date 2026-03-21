import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import AdministrationHeader from "@/components/administration/AdministraionHeader";
import { analyticsApi } from '@/api/analytics/analytics';
import { adminHeaderItems } from '@/config/main';
import type {
    DetailedAnalyticsResponse,
    DailyStats,
    TopMenuItem,
    CategoryRevenue
} from '@/api/analytics/schema';
import { BeatLoader } from 'react-spinners';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Legend
} from 'recharts';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    }).format(value);
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function AnalyticsPage() {
    const { user, isLoading } = useUser();
    const [analytics, setAnalytics] = useState<DetailedAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await analyticsApi.getDetailedAnalytics();
                setAnalytics(data);
            } catch (err: any) {
                const message = err.response?.data?.detail || 'Ошибка при загрузке аналитики';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading || loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <AdministrationHeader items={adminHeaderItems} />
                <main className="flex-1 flex items-center justify-center">
                    <BeatLoader color="var(--color-accent)" />
                </main>
            </div>
        );
    }

    if (!user || !user.is_staff) {
        return <Navigate to="/access-denied" replace />;
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen">
                <AdministrationHeader items={adminHeaderItems} />
                <main className="container mx-auto px-4 py-8">
                    <div className="bg-error/10 border border-error rounded-lg p-4 text-error">
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    if (!analytics) {
        return null;
    }

    // Prepare data for charts
    const dailyChartData = analytics.daily_dynamics.map((day: DailyStats) => ({
        date: formatDate(day.date),
        orders: day.orders_count,
        revenue: day.revenue / 100 // Convert to rubles
    }));

    const categoryChartData = analytics.revenue_by_category?.map((cat: CategoryRevenue, index: number) => ({
        name: cat.category_name,
        value: cat.revenue / 100,
        fill: COLORS[index % COLORS.length]
    })) || [];

    const topItemsData = analytics.top_menu_items.slice(0, 5).map((item: TopMenuItem) => ({
        name: item.food_name,
        quantity: item.total_quantity
    }));

    return (
        <div className="flex flex-col min-h-screen">
            <AdministrationHeader items={adminHeaderItems} />

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold font-main text-text-primary mb-2">Аналитика</h1>
                    <p className="text-text-secondary font-main">Обзор показателей вашего ресторана</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Today Orders */}
                    <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium font-main text-text-secondary">Заказы сегодня</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold font-main text-text-primary">{analytics.today.orders_count}</p>
                        <p className="text-xs text-text-secondary mt-1">
                            За месяц: {analytics.month.orders_count}
                        </p>
                    </div>

                    {/* Today Revenue */}
                    <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium font-main text-text-secondary">Выручка сегодня</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold font-main text-text-primary">
                            {formatCurrency(analytics.today.total_revenue / 100)}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                            За месяц: {formatCurrency(analytics.month.total_revenue / 100)}
                        </p>
                    </div>

                    {/* Average Check */}
                    <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium font-main text-text-secondary">Средний чек</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold font-main text-text-primary">
                            {formatCurrency(analytics.today.average_order_value / 100)}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                            За месяц: {formatCurrency(analytics.month.average_order_value / 100)}
                        </p>
                    </div>

                    {/* Completed Orders */}
                    <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium font-main text-text-secondary">Выполнено заказов</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold font-main text-text-primary">{analytics.month.completed_orders}</p>
                        <p className="text-xs text-text-secondary mt-1">
                            Отменено: {analytics.month.cancelled_orders}
                        </p>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Daily Revenue Dynamics */}
                    <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                        <h2 className="text-lg font-bold font-main text-text-primary mb-4">Динамика выручки</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${value}₽`} />
                                <Tooltip
                                    formatter={(value: any) => [`${value}₽`, 'Выручка']}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4ECDC4"
                                    strokeWidth={2}
                                    dot={{ fill: '#4ECDC4', strokeWidth: 2 }}
                                    name="Выручка"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Daily Orders Dynamics */}
                    <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                        <h2 className="text-lg font-bold font-main text-text-primary mb-4">Динамика заказов</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="orders" fill="#FF6B6B" radius={[4, 4, 0, 0]} name="Заказы" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Revenue by Category */}
                    {categoryChartData.length > 0 && (
                        <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                            <h2 className="text-lg font-bold font-main text-text-primary mb-4">Выручка по категориям</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        dataKey="value"
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [formatCurrency(value), 'Выручка']}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Top Menu Items */}
                    <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                        <h2 className="text-lg font-bold font-main text-text-primary mb-4">Топ популярных блюд</h2>
                        {topItemsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topItemsData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                                    <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} width={120} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="quantity" fill="#45B7D1" radius={[0, 4, 4, 0]} name="Продано шт." />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-75 text-text-secondary font-main">
                                Нет данных о продажах
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Menu Items Table */}
                <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                    <h2 className="text-lg font-bold font-main text-text-primary mb-4">Детальный топ блюд</h2>
                    {analytics.top_menu_items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium font-main text-text-secondary">#</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium font-main text-text-secondary">Блюдо</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium font-main text-text-secondary">Цена</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium font-main text-text-secondary">Продано шт.</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium font-main text-text-secondary">Заказов</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.top_menu_items.map((item, index) => (
                                        <tr key={item.menu_item_id} className="border-b border-surface-border last:border-0">
                                            <td className="py-3 px-4 text-sm font-main text-text-primary">{index + 1}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {item.image_url && (
                                                        <img
                                                            src={`/api${item.image_url}`}
                                                            alt={item.food_name}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <span className="text-sm font-main text-text-primary">{item.food_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-main text-text-primary">
                                                {formatCurrency(item.price / 100)}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm font-main text-text-primary">{item.total_quantity}</td>
                                            <td className="py-3 px-4 text-center text-sm font-main text-text-primary">{item.orders_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-text-secondary font-main">
                            Нет данных о продажах
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AnalyticsPage;
