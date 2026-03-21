import { type NavigationLink } from "@/types/header";


export const headerItems: NavigationLink[] = [
    {label: "Меню", link: "/"},
    {label: "Доставка", link: "/"},
    {label: "О нас", link: "/"},
    {label: "Сотрудникам", link: "/admin/menu"}
];

export const adminHeaderItems: NavigationLink[] = [
    { label: "Меню", link: "/admin/menu" },
    { label: "Заказы", link: "/admin/orders" },
    { label: "Аналитика", link: "/admin/analytics" },
    { label: "Персонал", link: "/admin/staff" },
];

export const phoneNumber: string = "8 800 555-35-35";
export const mail: string = "dreamsobenatic00@mail.ru";