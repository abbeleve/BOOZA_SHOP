import { useState, useEffect } from 'react';
import AdministrationHeader from "@/components/administration/AdministraionHeader";
import AddProductCard from "@/components/administration/AddProductCard";
import AddProductModal from "@/components/administration/AddProductModal";
import AdminProductCard from "@/components/administration/AdminProductCard";
import { menuApi } from "@/api/menu/menu";
import { type MenuItem } from '@/api/menu/schema';
import { BeatLoader } from "react-spinners";

const adminHeaderItems = [
    { label: "Меню", link: "/admin/menu" },
    { label: "Заказы", link: "/admin/orders" },
    { label: "Персонал", link: "/admin/staff" },
    { label: "Настройки", link: "/admin/settings" },
];

function MenuControlPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadMenuItems = async () => {
        try {
            const items = await menuApi.getMenuItems();
            setMenuItems(items);

            const uniqueCategoryNames = Array.from(
                new Set(items.filter(item => item.categoryName).map(item => item.categoryName!))
            );
            setCategories(uniqueCategoryNames);
        } catch (error) {
            console.error('Failed to fetch menu data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenuItems();
    }, []);

    const handleProductAdded = () => {
        loadMenuItems();
    };

    const handleEdit = (id: number) => {
        console.log('Edit product:', id);
        // TODO: Implement edit functionality
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
            return;
        }
        try {
            await menuApi.deleteMenuItem(id);
            await loadMenuItems();
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <AdministrationHeader items={adminHeaderItems} />
            <main className="py-10">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold font-main text-text-primary mb-2">Управление меню</h1>
                        <p className="text-text-secondary font-main">Добавляйте и редактируйте товары вашего меню</p>
                    </div>

                    {/* Categories */}
                    {categories.length > 0 && (
                        <section className="flex flex-row flex-wrap gap-2 mb-8">
                            {categories.map((category, index) => (
                                <button
                                    key={index}
                                    className="bg-accent-light hover:bg-accent hover:text-text-inverse transition-colors px-5 py-2 rounded-full text-sm font-main font-medium text-text-primary"
                                >
                                    <span>{category}</span>
                                </button>
                            ))}
                        </section>
                    )}

                    {/* Products Grid */}
                    {loading ? (
                        <section className="flex justify-center items-center py-12">
                            <BeatLoader color="var(--color-accent)" />
                        </section>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Add Product Card - First position */}
                            <div className="min-h-[200px]">
                                <AddProductCard onClick={() => setIsModalOpen(true)} />
                            </div>

                            {/* Existing Products */}
                            {menuItems.map((item) => (
                                <div key={item.menu_id} className="min-h-[200px]">
                                    <AdminProductCard
                                        id={item.menu_id}
                                        imageUrl={item.imageUrl || '/test_food_images/booza.png'}
                                        title={item.food_name}
                                        description={item.description || ''}
                                        price={`${item.price} ₽`}
                                        categoryName={item.categoryName}
                                        isAvailable={item.isAvailable}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProductAdded={handleProductAdded}
            />
        </div>
    )
}

export default MenuControlPage;