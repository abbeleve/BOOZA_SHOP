interface ProductCardProps {
    id: number;
    imageUrl: string;
    title: string;
    description: string;
    price: string; // Для отображения (например "500 ₽")
    priceValue: number; // Для расчетов (например 500)
    loading: boolean;
    onAddToCart?: (product: { id: number; title: string; price: number; displayPrice: string; imageUrl: string }) => void;
}

function ProductCard({
    imageUrl,
    title,
    description,
    price,
    priceValue,
    id,
    loading = false,
    onAddToCart
}: ProductCardProps) {
    
    const handleAddClick = () => {
        if (onAddToCart) {
            onAddToCart({
                id,
                title,
                price: priceValue,
                displayPrice: price,
                imageUrl
            });
        }
    };

    return (
        // Контейнер: используем surface-card для фона и surface-border для границ
        <div className="flex flex-col md:flex-row w-full border border-surface-border bg-surface-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            
            {/* Изображение */}
            <div className="md:w-[50%] h-48 md:h-auto relative bg-surface-base">
                {loading ? (
                    <div className="bg-surface-border/50 w-full h-full animate-pulse"></div>
                ) : (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/test_food_images/booza.png';
                        }}
                    />
                )}
            </div>

            {/* Контент */}
            <div className="flex flex-col justify-between gap-2 p-4 w-full md:w-[50%]">
                <div>
                    <span className="text-base md:text-lg font-bold font-main text-text-primary">{title}</span>
                    
                    {description && (
                        <p className="text-sm md:text-base text-text-secondary mt-1 font-main">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex flex-row justify-between items-center">
                    <span className="text-lg md:text-xl font-bold text-text-primary font-main">
                        {price}
                    </span>
                    
                    <button
                        onClick={handleAddClick}
                        className="px-4 md:px-5 py-1 md:py-2 bg-accent hover:bg-accent-hover text-text-inverse transition-colors rounded-lg md:rounded-xl flex items-center gap-2 font-main"
                        aria-label="Добавить в корзину"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 md:size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>                
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;