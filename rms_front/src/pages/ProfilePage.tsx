import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import Orders from '@/components/orders/Orders';
import Header from '@/components/Header';
import { orderApi } from '@/api/order/order';
import { authApi } from '@/api/auths/auth';
import type { OrderShortResponse } from '@/api/order/schema';
import type { UserUpdateRequest } from '@/api/auths/schema';

import { headerItems, phoneNumber, mail } from "@/config/main";
import { BeatLoader } from 'react-spinners';


interface UserProfile {
    name: string;
    surname: string;
    patronymic?: string;
    email?: string;
    phone?: string;
    address?: string;
}

function ProfilePage() {
    const { user, isLoading, logout, refreshUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrderShortResponse[]>([]);
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        surname: '',
        patronymic: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        orderApi.getMyOrders()
            .then(setOrders)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name,
                surname: user.surname,
                patronymic: user.patronymic || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="p-8 text-center text-text-secondary font-main">
                <BeatLoader color="var(--color-accent)" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);

        const updateData: UserUpdateRequest = {
            name: profile.name,
            surname: profile.surname,
            patronymic: profile.patronymic || undefined,
            email: profile.email || undefined,
            phone: profile.phone || undefined,
            address: profile.address || undefined,
        };

        try {
            await authApi.updateProfile(updateData);
            await refreshUser();
            setIsEditing(false);
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Ошибка при сохранении профиля';
            setSaveError(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setProfile({
                name: user.name,
                surname: user.surname,
                patronymic: user.patronymic || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
        setSaveError(null);
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header items={headerItems} phoneNumber={phoneNumber} />

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Профиль */}
                    <div className="lg:col-span-1">
                        <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold font-main text-text-primary">Профиль</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 text-text-secondary hover:text-accent transition-colors"
                                        aria-label="Редактировать"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {saveError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-main">
                                    {saveError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium font-main text-text-secondary mb-1">
                                        Фамилия
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profile.surname}
                                            onChange={(e) => setProfile({ ...profile, surname: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                        />
                                    ) : (
                                        <p className="text-text-primary font-main">{profile.surname}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium font-main text-text-secondary mb-1">
                                        Имя
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                        />
                                    ) : (
                                        <p className="text-text-primary font-main">{profile.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium font-main text-text-secondary mb-1">
                                        Отчество
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profile.patronymic}
                                            onChange={(e) => setProfile({ ...profile, patronymic: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                        />
                                    ) : (
                                        <p className="text-text-primary font-main">{profile.patronymic || 'Не указано'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium font-main text-text-secondary mb-1">
                                        Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                        />
                                    ) : (
                                        <p className="text-text-primary font-main">{profile.email || 'Не указан'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium font-main text-text-secondary mb-1">
                                        Телефон
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                        />
                                    ) : (
                                        <p className="text-text-primary font-main">{profile.phone || 'Не указан'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium font-main text-text-secondary mb-1">
                                        Адрес
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profile.address}
                                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                            placeholder="Введите адрес доставки"
                                        />
                                    ) : (
                                        <p className="text-text-primary font-main">{profile.address || 'Не указан'}</p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg font-main transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-2 bg-surface-base border border-surface-border text-text-primary rounded-lg font-main hover:bg-surface-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Заказы */}
                    <div className="lg:col-span-2">
                        <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
                            <Orders orders={orders} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;
