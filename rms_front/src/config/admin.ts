import { type NavigationLink } from "@/types/header";

export const adminHeaderItems: NavigationLink[] = [
    { label: "Меню", link: "/admin/menu" },
    { label: "Заказы", link: "/admin/orders" },
    { label: "Персонал", link: "/admin/staff" },
    { label: "Клиенты", link: "/admin/customers" },
    { label: "Настройки", link: "/admin/settings" },
];