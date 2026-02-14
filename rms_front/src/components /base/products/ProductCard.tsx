interface ProductCardProps {
    imageUrl: string,
    title: string,
    description: string,
    price: string,
    loading: boolean,
}

function ProductCard({imageUrl, title, description, price, loading=false}: ProductCardProps) {
    return (
        <div className="flex flex-col md:flex-row w-full border rounded-xl border-gray-100 overflow-hidden">
            {/* Изображение - 50-60% высоты на мобильных, фиксированная ширина на десктопе */}
            <div className="md:w-[50%] h-48 md:h-auto relative">
                {loading ? (
                    <div className="bg-gray-300 w-full h-full animate-pulse"></div>
                ) : (
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = '/placeholder-food.jpg';
                        }}
                    />
                )}
            </div>
            
            {/* Контент */}
            <div className="flex flex-col justify-between gap-2 p-4 w-full md:w-[50%]">
                <div>
                    <span className="text-base md:text-lg font-bold">{title}</span>
                    {description && (
                        <p className="text-sm md:text-base text-gray-600 mt-1">{description}</p>
                    )}
                </div>
                <div className="flex flex-row justify-between items-center">
                    <span className="text-lg md:text-xl font-bold text-gray-800">{price}</span>
                    <button 
                        className="px-4 md:px-5 py-1 md:py-2 bg-blue-500 hover:bg-blue-600 transition-colors rounded-lg md:rounded-xl"
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