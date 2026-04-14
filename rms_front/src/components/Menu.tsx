import ProductCard from "@/components/base/products/ProductCard";
import { BeatLoader } from "react-spinners";
import { useCart } from "@/contexts/CartContext";
import { useState, useMemo } from "react";

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
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const query = searchQuery.toLowerCase();
        return products.filter((product) =>
            product.title.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const parsePrice = (priceStr: string): number => {
        return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    };

    const productsByCategory = categories.reduce((acc, category) => {
        acc[category] = filteredProducts.filter((product) => product.category === category);
        return acc;
    }, {} as Record<string, typeof filteredProducts>);

    const visibleCategories = searchQuery.trim()
        ? categories.filter((category) => productsByCategory[category].length > 0)
        : categories;

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

            {/* Поисковая строка */}
            <div className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="Поиск по названию или описанию..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-text-primary placeholder:text-gray-400 font-main text-sm"
                />
                <button
                    onClick={handleSearch}
                    className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg font-main text-sm font-medium transition-colors"
                >
                    Найти
                </button>
            </div>

            {/* Категории */}
            <section className="flex flex-row flex-wrap gap-2 mb-8 lg:sticky lg:top-0 z-10 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4 lg:-mx-4 lg:px-4">
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
            {visibleCategories.length > 0 ? (
                visibleCategories.map((category) => (
                <div
                    key={category}
                    id={`category-${category}`}
                    className="mb-12 scroll-mt-24 px-2"
                >
                    <h2 className="text-3xl font-main font-bold text-text-primary mb-6">
                        {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
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
                ))
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg font-main">Ничего не найдено по запросу "{searchQuery}"</p>
                </div>
            )}
        </section>
    );
}

export default Menu;
