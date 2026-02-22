import { type Link } from "@/types/header";
import Logo from "./Logo";
import { useCart } from "@/contexts/CartContext";

interface HeaderProps {
    items: Link[];
    phoneNumber: string;
}

function Header({ items, phoneNumber }: HeaderProps) {
    const { totalCount } = useCart();

    return (
        <header className="flex flex-col md:flex-row md:gap-10 px-4 md:px-10 pt-5 pb-4">
            <div className="">
                <Logo />
            </div>
            <div className="flex flex-col md:flex-row md:justify-between w-full">
                {/* Навигация */}
                <div className="flex flex-row justify-center gap-3 py-2">
                    {items.map((item, index) => (
                        <a 
                            key={index} 
                            href={item.link}
                            className="text-text-primary hover:text-accent transition-colors font-main font-medium"
                        >
                            {item.label}
                        </a>
                    ))}
                    <div className="md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </div>
                </div>

                {/* Контакты и корзина */}
                <div className="flex flex-row justify-center items-center gap-5">
                    <span className="text-text-primary font-main font-medium">{phoneNumber}</span>
                    <a href="/cart" className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-text-primary hover:text-accent transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                        {totalCount > 0 && (                    
                            <span className="absolute -top-2 -right-2 bg-error text-text-inverse text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-main">
                                {totalCount > 99 ? '99+' : totalCount}
                            </span>
                        )}
                    </a>
                </div>
            </div>
        </header>
    );
}

export default Header;