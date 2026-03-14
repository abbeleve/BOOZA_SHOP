import ProductCard from "@/components/base/products/ProductCard";
import { BeatLoader } from "react-spinners";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface MenuProps {
    categories: string[];
    products?: Array<{
        id: string | number;
        imageUrl: string;
        title: string;
        category: string;
        description: string;
        price: string;
    }>;
    loading: boolean;
}

function Menu({ categories, products = [], loading }: MenuProps) {
    const { addToCart } = useCart();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Функция для извлечения числа из строки цены (например, "1000 ₽" -> 1000)
    const parsePrice = (priceStr: string): number => {
        return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    };

    // Группировка продуктов по категориям
    const productsByCategory = categories.reduce((acc, category) => {
        acc[category] = products.filter((product) => product.category === category);
        return acc;
    }, {} as Record<string, typeof products>);

    // Обработчик клика по категории
    const handleCategoryClick = (category: string) => {
        setActiveCategory(category);
        const element = document.getElementById(`category-${category}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    if (loading) {
        return (
            <section className="flex justify-center items-center mx-auto px-4 py-12 bg-background">
                <BeatLoader color="var(--color-accent)" />
            </section>
        );
    }

    return (
        <section className="container mx-auto px-4 py-6 bg-background">

            {/* Категории */}
            <section className="flex flex-row flex-wrap gap-2 mb-8 sticky top-0 z-10 bg-background py-4">
                {categories.map((category, index) => (
                    <button
                        key={index}
                        onClick={() => handleCategoryClick(category)}
                        className={`bg-accent-light hover:bg-accent hover:text-text-inverse transition-colors px-5 py-2 rounded-full text-sm font-main font-medium text-text-primary ${
                            activeCategory === category ? "bg-accent text-text-inverse" : ""
                        }`}
                    >
                        <span>{category}</span>
                    </button>
                ))}
            </section>

            {/* Продукты по категориям */}
            {categories.map((category) => (
                <div
                    key={category}
                    id={`category-${category}`}
                    className="mb-12 scroll-mt-24"
                >
                    <h2 className="text-2xl font-main font-bold text-text-primary mb-6">
                        {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {productsByCategory[category]?.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={typeof product.id === 'string' ? parseInt(product.id) : product.id}
                                imageUrl={product.imageUrl}
                                title={product.title}
                                description={product.description}
                                price={product.price}
                                priceValue={parsePrice(product.price)}
                                loading={false}
                                onAddToCart={addToCart}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}

export default Menu;