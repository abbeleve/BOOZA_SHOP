import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Menu from "@/components/Menu";


import { type Link } from "@/types/header";


const headerItems: Link[] = [
    {label: "Меню", link: "/"},
    {label: "Доставка", link: "/"},
    {label: "О нас", link: "/"},
];

const phoneNumber: string = "8 800 555-35-35";
const mail: string = "dreamsobenatic00@mail.ru"


function MainPage() {
    return (
        <div className="flex flex-col">
            <Header items={headerItems} phoneNumber={phoneNumber}/>
            <main>
                <Menu categories={["Буузы", "Напитки", "Супы", "Салаты", "Десерты"]} loading={false} />
            </main>
            <Footer mainLinks={headerItems} additionalLinks={[]} mail={mail} phoneNumber={phoneNumber} />
        </div>
    )
}

export default MainPage;