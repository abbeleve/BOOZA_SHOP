import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Cart from "@/components/cart/Cart";
import Orders from "@/components/orders/Orders";
import { orderApi } from "@/api/order/order";
import { type OrderShortResponse } from "@/api/order/schema";

import { headerItems, phoneNumber, mail } from "@/config/main";


function CartPage() {
    const [orders, setOrders] = useState<OrderShortResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderApi.getMyOrders()
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header items={headerItems} phoneNumber={phoneNumber} />
                <main className="py-10">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-text-secondary font-main">Загрузка...</div>
                    </div>
                </main>
                <Footer mainLinks={headerItems} additionalLinks={[]} mail={mail} phoneNumber={phoneNumber} />
            </div>
        );
    }

    const activeStatuses = ['PENDING', 'PROCESSING', 'PREPARRING', 'DELIVERING'];
    const hasActiveOrder = orders.some(order => activeStatuses.includes(order.status));

    return (
        <div className="flex flex-col min-h-screen">
            <Header items={headerItems} phoneNumber={phoneNumber} />

            <main className="py-10">
                {hasActiveOrder ? 
                    <div className="px-10">
                        <Orders orders={orders} />
                    </div>
                : 
                    <Cart />
                }
            </main>

            <Footer mainLinks={headerItems} additionalLinks={[]} mail={mail} phoneNumber={phoneNumber} />
        </div>
    )
}

export default CartPage;
