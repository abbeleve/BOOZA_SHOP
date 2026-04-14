import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BeatLoader } from "react-spinners";
import { useCart } from "@/contexts/CartContext";
import { menuApi } from "@/api/menu/menu";
import { type MenuItem } from "@/api/menu/schema";

function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const data = await menuApi.getMenuItem(parseInt(id));
                setProduct(data);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart({
                id: product.menu_id,
                title: product.food_name,
                price: product.price,
                displayPrice: `${product.price} ₽`,
                imageUrl: product.image_url ? `/api${product.image_url}` : '/test_food_images/booza.png',
            });
        }
    };

    if (loading) {
        return (
            <section className="flex justify-center items-center mx-auto px-4 py-12 bg-background">
                <BeatLoader color="var(--color-accent)" />
            </section>
        );
    }

    if (!product) {
        return (
            <section className="container mx-auto px-4 py-12 bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-main font-bold text-text-primary mb-4">Товар не найден</h1>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg font-main text-sm font-medium transition-colors"
                    >
                        К меню
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-4 py-6 bg-background">
            <div className="max-w-4xl mx-auto">
                {/* Изображение */}
                <div className="w-full h-64 md:h-96 bg-surface-base rounded-xl overflow-hidden mb-6">
                    <img
                        src={product.image_url ? `/api${product.image_url}` : '/test_food_images/booza.png'}
                        alt={product.food_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/test_food_images/booza.png';
                        }}
                    />
                </div>

                {/* Информация */}
                <div className="bg-surface-card rounded-xl p-6 md:p-8 border border-surface-border shadow-sm">
                    <h1 className="text-2xl md:text-3xl font-main font-bold text-text-primary mb-3">
                        {product.food_name}
                    </h1>

                    {product.category_name && (
                        <span className="inline-block text-xs font-main font-medium text-accent bg-accent/10 px-3 py-1 rounded-full mb-4">
                            {product.category_name}
                        </span>
                    )}

                    {product.description && (
                        <p className="text-text-secondary font-main text-base leading-relaxed mb-6">
                            {product.description}
                        </p>
                    )}

                    {/* Кнопки */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse transition-colors rounded-lg font-main font-medium flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            Добавить в корзину — {product.price} ₽
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="px-6 py-3 border border-surface-border hover:border-accent text-text-primary hover:text-accent transition-colors rounded-lg font-main font-medium"
                        >
                            К меню
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductDetailPage;
