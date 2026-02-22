import { useCart } from "@/contexts/CartContext";


const IconTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const IconMinus = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
);
const IconPlus = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

function Cart() {
    const { items, updateQuantity, removeFromCart, totalPrice, clearCart, isLoaded } = useCart();

    if (!isLoaded) {
        return <div className="p-8 text-center">Загрузка корзины...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 5.407c.49 2.1-.787 4.093-2.86 4.093H5.99c-2.073 0-3.35-1.993-2.86-4.093l1.263-5.407a3.375 3.375 0 0 1 3.285-2.607h7.644a3.375 3.375 0 0 1 3.285 2.607Z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Корзина пуста</h2>
                <p className="text-gray-500 mt-2">Добавьте вкусные блюда из меню</p>
                <a href="/" className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                    Перейти в меню
                </a>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Ваш заказ</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <div key={item.id} className="p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
                            {/* Изображение */}
                            <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                            />
                            
                            {/* Информация */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-bold text-gray-800">{item.title}</h3>
                                <p className="text-blue-600 font-semibold">{item.displayPrice}</p>
                            </div>

                            {/* Управление количеством */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                <button 
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="p-2 hover:bg-white rounded-md transition shadow-sm text-gray-600"
                                    aria-label="Уменьшить"
                                >
                                    <IconMinus />
                                </button>
                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="p-2 hover:bg-white rounded-md transition shadow-sm text-gray-600"
                                    aria-label="Увеличить"
                                >
                                    <IconPlus />
                                </button>
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-500 hover:text-red-700 transition p-2"
                                    title="Удалить"
                                >
                                    <IconTrash />
                                </button>
                            </div>

                            {/* Итого за позицию и удаление */}
                            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 min-w-[100px]">
                                <span className="font-bold text-lg">
                                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Футер корзины */}
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <p className="text-gray-500 text-sm">Итого к оплате:</p>
                            <p className="text-3xl font-bold text-gray-900">{totalPrice.toLocaleString('ru-RU')} ₽</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={clearCart}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition"
                            >
                                Очистить
                            </button>
                            <button 
                                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                onClick={() => alert('Переход к оформлению заказа...')}
                            >
                                Оформить заказ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;