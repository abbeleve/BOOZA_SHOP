import ProductCard from "@/components/base/products/ProductCard";
import { BeatLoader } from "react-spinners";
import { useCart } from "@/contexts/CartContext";

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

    // Функция для извлечения числа из строки цены (например, "1000 ₽" -> 1000)
    const parsePrice = (priceStr: string): number => {
        return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
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

            {/* Сетка продуктов */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => (
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
        </section>
    );
}

export default Menu;