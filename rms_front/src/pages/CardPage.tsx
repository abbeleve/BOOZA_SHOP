import Footer from "@/components /Footer";
import Header from "@/components /Header";
import Menu from "@/components /Menu";

import { headerItems, phoneNumber, mail } from "@/config/main";


function MainPage() {
    return (
        <div className="flex flex-col">
            <Header items={headerItems} phoneNumber={phoneNumber}/>
            <Menu categories={["Буузы", "Напитки", "Супы", "Салаты", "Десерты"]} loading={false} />
            <Footer mainLinks={headerItems} additionalLinks={[]} mail={mail} phoneNumber={phoneNumber} />
        </div>
    )
}

export default MainPage;