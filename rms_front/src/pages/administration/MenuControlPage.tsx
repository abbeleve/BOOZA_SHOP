import { useState, useEffect } from 'react';
import AdministrationHeader from "@/components/administration/AdministraionHeader";
import { adminHeaderItems } from '@/config/main';
import AddProductCard from "@/components/administration/AddProductCard";
import AddProductModal from "@/components/administration/AddProductModal";
import EditProductModal from "@/components/administration/EditProductModal";
import AddCategoryModal from "@/components/administration/AddCategoryModal";
import AdminProductCard from "@/components/administration/AdminProductCard";
import { menuApi, categoriesApi } from "@/api/menu/menu";
import { type MenuItem, type Category } from '@/api/menu/schema';
import { BeatLoader } from "react-spinners";
import { adminHeaderItems } from "@/config/admin";


function MenuControlPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [categoryError, setCategoryError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const [items, cats] = await Promise.all([
                menuApi.getMenuItems(),
                categoriesApi.getCategories(),
            ]);
            setMenuItems(items);
            setCategories(cats);
        } catch (error) {
            console.error('Failed to fetch menu data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleProductAdded = () => {
        loadData();
    };

    const handleProductUpdated = () => {
        loadData();
    };

    const handleCategoryAdded = () => {
        setCategoryError(null);
        loadData();
    };

    const handleDeleteCategory = async (categoryId: number) => {
        const categoryItems = menuItems.filter((item) => item.category_id === categoryId);
        
        if (categoryItems.length > 0) {
            setCategoryError(`Невозможно удалить категорию. В ней находится товаров: ${categoryItems.length}. Сначала удалите или переместите товары.`);
            return;
        }
        
        if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
            return;
        }
        try {
            await categoriesApi.deleteCategory(categoryId);
            setCategoryError(null);
            await loadData();
            if (activeCategory === categoryId) {
                setActiveCategory(null);
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
            setCategoryError('Ошибка при удалении категории');
        }
    };

    const handleEdit = (id: number) => {
        setEditingProductId(id);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
            return;
        }
        try {
            await menuApi.deleteMenuItem(id);
            await loadData();
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const handleCategoryClick = (categoryId: number) => {
        setActiveCategory(categoryId);
        setCategoryError(null);
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
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

                    {/* Category Error */}
                    {categoryError && (
                        <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg text-error text-sm font-main flex items-center justify-between">
                            <span>{categoryError}</span>
                            <button
                                onClick={() => setCategoryError(null)}
                                className="p-1 hover:bg-error/20 rounded-full transition-colors"
                                aria-label="Закрыть"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Categories */}
                    {categories.length > 0 && (
                        <section className="flex flex-row flex-wrap gap-2 mb-8 lg:sticky lg:top-0 z-10 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4 lg:-mx-6 lg:px-6">
                            {categories.map((category) => (
                                <div
                                    key={category.category_id}
                                    className={`flex items-center gap-1 bg-accent-light hover:bg-accent hover:text-text-inverse transition-colors px-5 py-2 rounded-full text-sm font-main font-medium text-text-primary ${
                                        activeCategory === category.category_id ? "bg-accent text-text-inverse" : ""
                                    }`}
                                >
                                    <button
                                        onClick={() => handleCategoryClick(category.category_id)}
                                        className="flex items-center gap-1"
                                    >
                                        <span>{category.name}</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.category_id)}
                                        className="p-0.5 hover:bg-error/20 hover:text-error rounded-full transition-colors"
                                        aria-label="Удалить категорию"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setCategoryError(null);
                                    setIsAddCategoryModalOpen(true);
                                }}
                                className="bg-surface-base border border-dashed transition-colors px-5 py-2 rounded-full text-sm font-main font-medium text-text-primary flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span>Категория</span>
                            </button>
                        </section>
                    )}

                    {/* Products by Category */}
                    {loading ? (
                        <section className="flex justify-center items-center py-12">
                            <BeatLoader color="var(--color-accent)" />
                        </section>
                    ) : (
                        <div className="space-y-10 px-2">
                            <AddProductCard onClick={() => setIsAddModalOpen(true)} />

                            {categories.map((category) => {
                                const categoryItems = menuItems.filter(
                                    (item) => item.category_id === category.category_id
                                );

                                if (categoryItems.length === 0) return null;

                                return (
                                    <section
                                        key={category.category_id}
                                        id={`category-${category.category_id}`}
                                        className="scroll-mt-24"
                                    >
                                        <h2 className="text-xl font-bold font-main text-text-primary mb-4">
                                            {category.name}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {/* Existing Products */}
                                            {categoryItems.map((item) => (
                                                <AdminProductCard
                                                    key={item.menu_id}
                                                    id={item.menu_id}
                                                    imageUrl={'/api' + item.image_url || '/test_food_images/booza.png'}
                                                    title={item.food_name}
                                                    description={item.description || ''}
                                                    price={`${item.price} ₽`}
                                                    categoryName={item.category_name}
                                                    isAvailable={item.is_available}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}

                            {/* Items without category */}
                            {menuItems.some((item) => !item.category_id) && (
                                <section>
                                    <h2 className="text-xl font-bold font-main text-text-primary mb-4">
                                        Без категории
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {menuItems
                                            .filter((item) => !item.category_id)
                                            .map((item) => (
                                                <AdminProductCard
                                                    key={item.menu_id}
                                                    id={item.menu_id}
                                                    imageUrl={'/api' + item.image_url || '/test_food_images/booza.png'}
                                                    title={item.food_name}
                                                    description={item.description || ''}
                                                    price={`${item.price} ₽`}
                                                    categoryName={item.category_name}
                                                    isAvailable={item.is_available}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onProductAdded={handleProductAdded}
            />

            {/* Edit Product Modal */}
            <EditProductModal
                isOpen={isEditModalOpen}
                productId={editingProductId}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingProductId(null);
                }}
                onProductUpdated={handleProductUpdated}
            />

            {/* Add Category Modal */}
            <AddCategoryModal
                isOpen={isAddCategoryModalOpen}
                onClose={() => setIsAddCategoryModalOpen(false)}
                onCategoryAdded={handleCategoryAdded}
            />
        </div>
    )
}

export default MenuControlPage;