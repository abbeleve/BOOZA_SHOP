import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { orderApi } from '@/api/order/order';
import { type OrderCreate } from '@/api/order/schema';
import { usePhoneMask } from '@/hooks/usePhoneMask';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderCompleted: () => void;
}

declare global {
    interface Window {
        ymaps?: any;
    }
}

function CheckoutModal({ isOpen, onClose, onOrderCompleted }: CheckoutModalProps) {
    const { items, totalPrice, clearCart } = useCart();
    const { user } = useUser();
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [description, setDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const placemarkRef = useRef<any>(null);

    const { formatPhoneValue } = usePhoneMask();

    useEffect(() => {
        if (isOpen && user?.phone) {
            setPhone(formatPhoneValue(user.phone));
        } else if (isOpen) {
            setPhone('');
        }
    }, [isOpen, user, formatPhoneValue]);

    useEffect(() => {
        if (isOpen && mapContainerRef.current && !mapInitialized) {
            loadYandexMap();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && mapInitialized && mapInstanceRef.current) {
            const timeout = setTimeout(() => {
                mapInstanceRef.current.container.fitToViewport();
            }, 200);
            return () => clearTimeout(timeout);
        }
    }, [isOpen, mapInitialized]);

    const loadYandexMap = () => {
        if (window.ymaps) {
            window.ymaps.ready(() => {
                initMap();
            });
            return;
        }

        const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
        if (existingScript) {
            window.ymaps.ready(() => {
                initMap();
            });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;
        script.onload = () => {
            if (window.ymaps) {
                window.ymaps.ready(() => {
                    initMap();
                });
            }
        };
        script.onerror = () => {
            console.error('Failed to load Yandex Maps API script');
        };
        document.head.appendChild(script);
    };

    const initMap = () => {
        if (!mapContainerRef.current || !window.ymaps || mapInitialized) {
            return;
        }

        const map = new window.ymaps.Map(mapContainerRef.current, {
            center: [52.283, 104.20],
            zoom: 10,
            controls: ['zoomControl', 'fullscreenControl'],
        });

        map.behaviors.enable(['drag', 'scrollZoom']);

        // Клик по карте
        map.events.add('click', (e: any) => {
            const coords = e.get('coords');
            updatePlacemark(map, coords);
            geocodeCoords(coords);
        });

        // Поиск адресов
        const searchControl = new window.ymaps.control.SearchControl({
            options: {
                float: 'right',
                noPlacemark: false,
                provider: 'yandex#search',
            },
        });

        searchControl.events.add('resultselect', (e: any) => {
            const index = e.get('index');
            searchControl.getResult(index).then((result: any) => {
                const coords = result.geometry.getCoordinates();
                const address = result.getAddress();
                setDeliveryAddress(address);

                if (placemarkRef.current) {
                    map.geoObjects.remove(placemarkRef.current);
                }

                const placemark = new window.ymaps.Placemark(coords, {
                    hintContent: address,
                    balloonContent: address,
                }, {
                    preset: 'islands#redIcon',
                    draggable: true,
                });

                placemark.events.add('dragend', () => {
                    const newCoords = placemark.geometry.getCoordinates();
                    geocodeCoords(newCoords);
                });

                map.geoObjects.add(placemark);
                placemarkRef.current = placemark;
                map.setCenter(coords, 14);
            });
        });

        map.controls.add(searchControl);

        mapInstanceRef.current = map;
        setMapInitialized(true);
    };

    const updatePlacemark = (map: any, coords: number[]) => {
        if (placemarkRef.current) {
            map.geoObjects.remove(placemarkRef.current);
        }

        const placemark = new window.ymaps.Placemark(coords, {}, {
            preset: 'islands#redIcon',
            draggable: true,
        });

        placemark.events.add('dragend', () => {
            const newCoords = placemark.geometry.getCoordinates();
            geocodeCoords(newCoords);
        });

        map.geoObjects.add(placemark);
        placemarkRef.current = placemark;
    };

    const geocodeCoords = (coords: number[]) => {
        if (!window.ymaps) return;

        window.ymaps.geocode(coords).then((res: any) => {
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) {
                const address = firstGeoObject.getAddress();
                setDeliveryAddress(address);

                if (placemarkRef.current) {
                    placemarkRef.current.properties.set({
                        hintContent: address,
                        balloonContent: address,
                    });
                }
            }
        }).catch((err: any) => {
            console.error('Geocoding error:', err);
        });
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!deliveryAddress.trim()) {
            setError('Пожалуйста, укажите адрес доставки');
            setLoading(false);
            return;
        }

        if (!phone.trim()) {
            setError('Пожалуйста, укажите номер телефона');
            setLoading(false);
            return;
        }

        if (items.length === 0) {
            setError('Корзина пуста');
            setLoading(false);
            return;
        }

        // Clean phone number for API (only digits with + prefix)
        const cleanPhone = '+7' + phone.replace(/\D/g, '').slice(-10);

        const orderData: OrderCreate = {
            delivery_address: deliveryAddress,
            items: items.map((item) => ({
                menu_item_id: item.id,
                quantity: item.quantity,
            })),
            description: description.trim() || undefined,
            phone: cleanPhone,
        };

        try {
            await orderApi.createOrder(orderData);
            clearCart();
            onOrderCompleted();
            onClose();
            setDeliveryAddress('');
            setDescription('');
            setPhone('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка при создании заказа');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

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
                        <h2 className="text-lg font-bold font-main text-text-primary">Оформление заказа</h2>
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {error && (
                            <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm font-main">
                                {error}
                            </div>
                        )}

                        {/* Карта для выбора адреса */}
                        <div>
                            <label className="block text-sm font-medium font-main text-text-primary mb-2">
                                Адрес доставки *
                            </label>
                            <div
                                ref={mapContainerRef}
                                className="w-full h-64 bg-surface-base border border-surface-border rounded-lg overflow-hidden"
                            />
                            <p className="text-xs text-text-secondary font-main mt-1">
                                Кликните на карту или перетащите метку для выбора адреса
                            </p>
                        </div>

                        {/* Поле ввода адреса */}
                        <div>
                            <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                Адрес (из карты или введите вручную) *
                            </label>
                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="Например: г. Москва, ул. Ленина, д. 10"
                                required
                            />
                        </div>

                        {/* Номер телефона */}
                        <div>
                            <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                Номер телефона *
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    const formatted = formatPhoneValue(e.target.value);
                                    setPhone(formatted);
                                }}
                                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="+7 (___) ___-__-__"
                                required
                            />
                        </div>

                        {/* Комментарий к заказу */}
                        <div>
                            <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                Комментарий к заказу
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                placeholder="Например: домофон не работает, позвоните заранее"
                            />
                        </div>

                        {/* Состав заказа */}
                        <div className="border-t border-surface-border pt-4">
                            <h3 className="text-sm font-bold font-main text-text-primary mb-3">Состав заказа</h3>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <span className="text-text-primary font-main">
                                            {item.title} × {item.quantity}
                                        </span>
                                        <span className="text-text-secondary font-main">
                                            {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-surface-border">
                                <span className="font-bold font-main text-text-primary">Итого:</span>
                                <span className="text-xl font-bold text-accent font-main">
                                    {totalPrice.toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-surface-base border border-surface-border text-text-primary rounded-lg font-main hover:bg-surface-hover transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !deliveryAddress.trim() || !phone.trim()}
                                className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg font-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Создание...' : 'Подтвердить заказ'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CheckoutModal;
