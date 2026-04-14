import type { NavigationLink } from "@/types/header";
import Logo from "./Logo";

interface FooterProps {
    mainLinks: NavigationLink[];
    additionalLinks: NavigationLink[];
    mail: string,
    phoneNumber: string,
}

function Footer({ mainLinks, additionalLinks, mail, phoneNumber }: FooterProps) {
    const socialLinks = [
        { name: 'VK', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.743c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.743c.44 0 .61.203.78.678.847 2.49 2.27 4.675 2.862 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.608 2.18-3.608.119-.254.322-.491.763-.491h1.743c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
            </svg>
        )},
        { name: 'Telegram', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
        )},
    ];
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Основной контент */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">

                    {/* О кафе */}
                    <div>
                        <Logo />
                        <p className="mt-4 text-sm text-gray-400 font-main leading-relaxed">
                            Кафе Booza Shop — место, где каждый найдёт что-то вкусное.
                            Уютная атмосфера, свежие блюда и приятный сервис.
                        </p>
                        <div className="mt-6 space-y-2 text-sm">
                            <div>
                                <span className="text-gray-500">Адрес:</span>
                                <p className="text-gray-300 font-main">г. Иркутск, ул. Декабрьских Событий, д. 115</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Часы работы:</span>
                                <p className="text-gray-300 font-main">Пн–Чт: 9:00–22:00</p>
                                <p className="text-gray-300 font-main">Пт–Вс: 9:00–23:00</p>
                            </div>
                        </div>
                    </div>

                    {/* Контакты */}
                    <div>
                        <h3 className="text-lg font-bold font-main text-white mb-4">Контакты</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <span className="text-gray-500 block">Телефон:</span>
                                <a href={`tel:${phoneNumber.replace(/\D/g, '')}`} className="text-gray-300 hover:text-accent transition-colors font-main">
                                    {phoneNumber}
                                </a>
                            </li>
                            <li>
                                <span className="text-gray-500 block">Email:</span>
                                <a href={`mailto:${mail}`} className="text-gray-300 hover:text-accent transition-colors font-main break-all">
                                    {mail}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Спецпредложения */}
                    <div>
                        <h3 className="text-lg font-bold font-main text-white mb-4">Спецпредложения</h3>
                        <ul className="space-y-3">
                            <li>
                                <a className="text-gray-400 hover:text-accent transition-colors font-main text-sm">
                                    Скидки и акции
                                </a>
                            </li>
                            <li>
                                <a className="text-gray-400 hover:text-accent transition-colors font-main text-sm">
                                    Банкетные услуги
                                </a>
                            </li>
                            <li>
                                <a className="text-gray-400 hover:text-accent transition-colors font-main text-sm">
                                    Частные мероприятия
                                </a>
                            </li>
                            <li>
                                <a className="text-gray-400 hover:text-accent transition-colors font-main text-sm">
                                    Подарочные карты
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Соцсети */}
                    <div>
                        <h3 className="text-lg font-bold font-main text-white mb-4">Мы в соцсетях</h3>
                        <div className="flex gap-4 mb-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-accent text-gray-400 hover:text-white transition-all duration-200"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 font-main">
                            Подписывайтесь на наши соцсети, чтобы быть в курсе акций и новостей!
                        </p>
                    </div>
                </div>
            </div>

            {/* Нижняя линия */}
            <div className="border-t border-gray-800">
                <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 font-main">
                        © {new Date().getFullYear()} Booza Shop. Все права защищены.
                    </p>
                    <div className="flex gap-6 text-xs text-gray-500 font-main">
                        <a className="hover:text-accent transition-colors">Политика конфиденциальности</a>
                        <a className="hover:text-accent transition-colors">Пользовательское соглашение</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;