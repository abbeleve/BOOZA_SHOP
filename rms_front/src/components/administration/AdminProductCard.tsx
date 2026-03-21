interface AdminProductCardProps {
    id: number;
    imageUrl: string;
    title: string;
    description: string;
    price: string;
    categoryName?: string;
    isAvailable: boolean;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

function AdminProductCard({
    imageUrl,
    title,
    description,
    price,
    categoryName,
    isAvailable,
    id,
    onEdit,
    onDelete
}: AdminProductCardProps) {

    const handleEdit = () => {
        if (onEdit) {
            onEdit(id);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(id);
        }
    };

    return (
        <div className="flex flex-col md:flex-row w-full border border-surface-border bg-surface-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Изображение */}
            <div className="md:w-[50%] h-48 md:h-auto relative bg-surface-base">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/test_food_images/booza.png';
                    }}
                />
            </div>

            {/* Контент */}
            <div className="flex flex-col justify-between gap-2 p-4 w-full md:w-[50%]">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-base md:text-lg font-bold font-main text-text-primary">{title}</span>
                        {!isAvailable && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-surface-base border border-surface-border rounded text-text-secondary">
                                Недоступен
                            </span>
                        )}
                    </div>

                    {categoryName && (
                        <p className="text-xs text-text-secondary mt-1 font-main">
                            Категория: {categoryName}
                        </p>
                    )}

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

                    <div className="flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="p-2 bg-surface-base hover:bg-accent text-text-primary hover:text-text-inverse transition-colors rounded-lg"
                            aria-label="Редактировать"
                            title="Редактировать"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 bg-surface-base hover:bg-error text-text-primary hover:text-text-inverse transition-colors rounded-lg"
                            aria-label="Удалить"
                            title="Удалить"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminProductCard;
