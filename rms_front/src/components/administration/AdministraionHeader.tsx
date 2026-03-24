import { type NavigationLink } from "@/types/header";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import Logo from "../Logo";

interface HeaderProps {
    items: NavigationLink[];
}

function AdministrationHeader({ items }: HeaderProps) {
    const { user, logout } = useUser();
    const location = useLocation();

    return (
        <header className="flex flex-col md:flex-row md:gap-10 px-4 md:px-10 pt-5 pb-4">
            <a href="/" className="flex flex-col justify-center hover:text-accent">
                <Logo />
            </a>
            <div className="flex flex-col md:flex-row md:justify-between w-full">
                {/* Навигация */}
                <div className="flex flex-row flex-wrap justify-center gap-3 py-2">
                    {items.map((item, index) => {
                        const isActive = location.pathname === item.link;
                        return (
                            <Link
                                key={index}
                                to={item.link}
                                className={`px-4 py-2 rounded-full font-main font-medium transition-colors ${
                                    isActive
                                        ? 'bg-accent text-text-inverse'
                                        : 'bg-surface-base text-text-primary border border-surface-border hover:bg-surface-hover'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
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

export default AdministrationHeader;