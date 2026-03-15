import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Cart from "@/components/cart/Cart";

import { headerItems, phoneNumber, mail } from "@/config/main";


function CartPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header items={headerItems} phoneNumber={phoneNumber} />
            
            <main className="py-10">
                <Cart />
            </main>

            <Footer mainLinks={headerItems} additionalLinks={[]} mail={mail} phoneNumber={phoneNumber} />
        </div>
    )
}

export default CartPage;