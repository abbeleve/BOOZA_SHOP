import { type NavigationLink } from "@/types/header";
import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import Logo from "./Logo";
import { useCart } from "@/contexts/CartContext";

interface HeaderProps {
    items: NavigationLink[];
    phoneNumber: string;
}

function Header({ items, phoneNumber }: HeaderProps) {
    const { totalCount } = useCart();
    const { user, logout } = useUser();

    // Фильтруем ссылки: "Сотрудникам" только для staff/admin
    const filteredItems = items.filter(item => {
        if (item.link === "/admin/menu") {
            return user?.is_staff || user?.role === "staff" || user?.role === "admin";
        }
        return true;
    });

    return (
        <header className="flex flex-col md:flex-row md:gap-10 px-4 md:px-10 pt-5 pb-4">
            <div className="">
                <Logo />
            </div>
            <div className="flex flex-col md:flex-row md:justify-between w-full">
                {/* Навигация */}
                <div className="flex flex-row justify-center gap-3 py-2">
                    {filteredItems.map((item, index) => (
                        <Link 
                            key={index} 
                            to={item.link}
                            className="text-text-primary hover:text-accent transition-colors font-main font-medium"
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div className="md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </div>
                </div>

                {/* Контакты, корзина и авторизация */}
                <div className="flex flex-row justify-center items-center gap-3">
    
                    {/* Мобильная версия: иконки + компактно */}
                    <div className="flex sm:hidden items-center gap-2">
                        {/* Телефон: иконка + короткая кнопка */}
                        <a href={`tel:${phoneNumber}`} className="p-2 text-text-primary hover:text-accent transition-colors" title="Позвонить">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                        </a>
                        
                        {/* Корзина */}
                        <Link to="/cart" className="relative p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-primary hover:text-accent transition-colors">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            {totalCount > 0 && (                    
                                <span className="absolute -top-1.5 -right-1.5 bg-error text-text-inverse text-[10px] font-bold rounded-full min-w-[18px] h-4.5 flex items-center justify-center px-1 font-main">
                                    {totalCount > 99 ? '99+' : totalCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth: одна кнопка или иконка */}
                        {user ? (
                            <Link to="/profile" className="p-2 text-text-secondary hover:text-accent transition-colors" title="Личный кабинет">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>
                        ) : (
                            <Link to="/login" className="p-2 text-accent hover:text-accent-hover transition-colors" title="Войти">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* Десктопная версия: полный текст + кнопки */}
                    <div className="hidden sm:flex items-center gap-4">
                        <span className="text-text-primary font-main font-medium">{phoneNumber}</span>

                        <Link to="/cart" className="relative p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-primary hover:text-accent transition-colors">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            {totalCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-error text-text-inverse text-[10px] font-bold rounded-full min-w-[18px] h-4.5 flex items-center justify-center px-1 font-main">
                                    {totalCount > 99 ? '99+' : totalCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth блок */}
                        <div className="flex items-center gap-2 border-l border-surface-border pl-4 ml-2">
                            {user ? (
                                <>
                                    <Link to="/profile" className="text-text-secondary text-sm font-main hover:text-accent transition-colors">
                                        {user.username}
                                    </Link>
                                    <button onClick={logout} className="px-3 py-1.5 text-sm font-medium text-text-primary bg-surface-base hover:bg-surface-hover border border-surface-border rounded-lg transition-colors font-main">
                                        Выйти
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-text-primary bg-surface-base hover:bg-surface-hover border border-surface-border rounded-lg transition-colors font-main">
                                        Войти
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;