import { useState, useEffect } from 'react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Menu from "@/components/Menu";
import { headerItems, phoneNumber, mail } from "@/config/main";
import { menuApi } from "@/api/menu/menu";
import { type MenuItem } from '@/api/menu/schema';


function MainPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const items = await menuApi.getMenuItems();
                setMenuItems(items);

                const uniqueCategoryNames = Array.from(
                    new Set(items.filter(item => item.category_name).map(item => item.category_name!))
                );
                setCategories(uniqueCategoryNames);
            } catch (error) {
                console.error('Failed to fetch menu data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header items={headerItems} phoneNumber={phoneNumber}/>
            <main className="grow">
                <Menu
                    categories={categories}
                    products={menuItems.map(item => ({
                        id: item.menu_id,
                        imageUrl: "/api" + item.image_url || '/test_food_images/booza.png',
                        title: item.food_name,
                        category: item.category_name || '',
                        description: item.description || '',
                        price: `${item.price} ₽`,
                    }))}
                    loading={loading}
                />
            </main>
            <Footer mainLinks={headerItems} additionalLinks={[]} mail={mail} phoneNumber={phoneNumber} />
        </div>
    )
}

export default MainPage;