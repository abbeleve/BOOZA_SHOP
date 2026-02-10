import ProductCard from "@/components /base/products/ProductCard";

interface MenuProps {
    categories: string[];
}

function Menu({categories}: MenuProps) {
    return (
        <section className="flex flex-col gap-5">
            <section className="flex flex-row flex-wrap gap-2 p-5">
                {categories.map((category, index) => (
                    <button key={index} className="bg-blue-400 px-3 py-1 rounded-2xl"> 
                        <span>{category}</span>
                    </button>
                ))}
            </section>
            <div className="flex flex-col justify-center gap-5 p-5">
                <ProductCard imageUrl="." title="Буузы 20 шт." description="Рыба текст Рыба текст Рыба текст Рыба текст Рыба текст" price="1000 Р" loading={false} />
                <ProductCard imageUrl="." title="Очень острая американская пицца" description="" price="1000 Р" loading={false} />
                <ProductCard imageUrl="." title="Буузы 20 шт." description="" price="1000 Р" loading={false} />
                <ProductCard imageUrl="." title="Буузы 20 шт." description="" price="1000 Р" loading={false} />
                <ProductCard imageUrl="." title="Буузы 20 шт." description="" price="1000 Р" loading={false} />
                <ProductCard imageUrl="." title="Буузы 20 шт." description="" price="1000 Р" loading={false} />
            </div>
        </section>
    );
}

export default Menu;