import ProductCard from "@/components/base/products/ProductCard";
import { BeatLoader } from "react-spinners";
import { useCart } from "@/hooks/useCart";

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
            <section className="flex justify-center mx-auto px-4 py-6">
                <BeatLoader />
            </section>
        );
    }

    return (
        <section className="container mx-auto px-4 py-6">
            {/* Категории */}
            <section className="flex flex-row flex-wrap gap-2 mb-6">
                {categories.map((category, index) => (
                    <button
                        key={index}
                        className="bg-blue-400 hover:bg-blue-500 transition-colors px-4 py-2 rounded-full text-sm font-medium"
                    >
                        <span>{category}</span>
                    </button>
                ))}
            </section>

            {/* Сетка продуктов */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.length > 0 ? (
                    products.map((product) => (
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
                    ))
                ) : (
                    // Заглушка для демонстрации
                    <>
                        <ProductCard
                            id={1}
                            imageUrl="/public/test_food_images/booza.png"
                            title="Буузы 20 шт."
                            description="Рыба текст Рыба текст Рыба текст Рыба текст Рыба текст"
                            price="1000 ₽"
                            priceValue={1000}
                            loading={false}
                            onAddToCart={addToCart}
                        />
                        <ProductCard
                            id={2}
                            imageUrl="/public/test_food_images/booza.png"
                            title="Очень острая американская пицца"
                            description="Пикантная пицца с острыми специями и сыром"
                            price="1200 ₽"
                            priceValue={1200}
                            loading={false}
                            onAddToCart={addToCart}
                        />
                        <ProductCard
                            id={3}
                            imageUrl="/public/test_food_images/booza.png"
                            title="Салат Цезарь"
                            description="Классический салат с курицей и пармезаном"
                            price="500 ₽"
                            priceValue={500}
                            loading={false}
                            onAddToCart={addToCart}
                        />
                        <ProductCard
                            id={4}
                            imageUrl="/public/test_food_images/booza.png"
                            title="Паста Карбонара"
                            description="Итальянская паста с беконом и сыром"
                            price="800 ₽"
                            priceValue={800}
                            loading={false}
                            onAddToCart={addToCart}
                        />
                        <ProductCard
                            id={5}
                            imageUrl="/public/test_food_images/booza.png"
                            title="Суп Рамен"
                            description="Японский суп с лапшой и мясом"
                            price="600 ₽"
                            priceValue={600}
                            loading={false}
                            onAddToCart={addToCart}
                        />
                        <ProductCard
                            id={6}
                            imageUrl="/public/test_food_images/booza.png"
                            title="Десерт Тирамису"
                            description="Классический итальянский десерт"
                            price="400 ₽"
                            priceValue={400}
                            loading={false}
                            onAddToCart={addToCart}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

export default Menu;