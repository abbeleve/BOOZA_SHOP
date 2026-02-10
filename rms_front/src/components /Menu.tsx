import ProductCard from "@/components /base/products/ProductCard";

interface MenuProps {
    categories: string[];
    products?: Array<{
        id: string;
        imageUrl: string;
        title: string;
        description: string;
        price: string;
    }>;
}

function Menu({categories, products = []}: MenuProps) {
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
                            imageUrl={product.imageUrl}
                            title={product.title}
                            description={product.description}
                            price={product.price}
                            loading={false}
                        />
                    ))
                ) : (
                    // Заглушка для демонстрации
                    <>
                        <ProductCard imageUrl="https://via.placeholder.com/400x300" title="Буузы 20 шт." description="Рыба текст Рыба текст Рыба текст Рыба текст Рыба текст" price="1000 Р" loading={false} />
                        <ProductCard imageUrl="https://via.placeholder.com/400x300" title="Очень острая американская пицца" description="Пикантная пицца с острыми специями и сыром" price="1200 Р" loading={false} />
                        <ProductCard imageUrl="https://via.placeholder.com/400x300" title="Салат Цезарь" description="Классический салат с курицей и пармезаном" price="500 Р" loading={false} />
                        <ProductCard imageUrl="https://via.placeholder.com/400x300" title="Паста Карбонара" description="Итальянская паста с беконом и сыром" price="800 Р" loading={false} />
                        <ProductCard imageUrl="https://via.placeholder.com/400x300" title="Суп Рамен" description="Японский суп с лапшой и мясом" price="600 Р" loading={false} />
                        <ProductCard imageUrl="https://via.placeholder.com/400x300" title="Десерт Тирамису" description="Классический итальянский десерт" price="400 Р" loading={false} />
                    </>
                )}
            </div>
        </section>
    );
}

export default Menu;