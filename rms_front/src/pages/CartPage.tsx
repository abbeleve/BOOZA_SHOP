import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Cart from "@/components/cart/Cart";
import Orders from "@/components/orders/Orders";
import { orderApi } from "@/api/order/order";
import { type OrderShortResponse } from "@/api/order/schema";
import { activeStatuses } from "@/components/orders/utils";

import { headerItems, phoneNumber, mail } from "@/config/main";
import { BeatLoader } from "react-spinners";


function CartPage() {
    const [orders, setOrders] = useState<OrderShortResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => {
        return orderApi.getMyOrders()
            .then(setOrders)
            .catch(console.error);
    };

    // Initial load
    useEffect(() => {
        fetchOrders().finally(() => setLoading(false));
    }, []);

    // Polling every 30 seconds when there are active orders
    useEffect(() => {
        const hasActiveOrder = orders.some(order => activeStatuses.includes(order.status as any));
        
        if (!hasActiveOrder) {
            return;
        }

        const intervalId = setInterval(() => {
            fetchOrders();
        }, 30000); // 30 seconds

        return () => clearInterval(intervalId);
    }, [orders]);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header items={headerItems} phoneNumber={phoneNumber} />
                <main className="grow py-10">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-text-secondary font-main">
                            <BeatLoader color="var(--color-accent)" />
                        </div>
                    </div>
                </main>
                <Footer mainLinks={headerItems} additionalLinks={[]} mail={mail} phoneNumber={phoneNumber} />
            </div>
        );
    }

    const hasActiveOrder = orders.some(order => activeStatuses.includes(order.status as any));
    const activeOrders = orders.filter(order => activeStatuses.includes(order.status as any));

    return (
        <div className="flex flex-col min-h-screen">
            <Header items={headerItems} phoneNumber={phoneNumber} />

            <main className="grow py-10">
                {hasActiveOrder ?
                    <div className="px-10">
                        <Orders orders={activeOrders} />
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
