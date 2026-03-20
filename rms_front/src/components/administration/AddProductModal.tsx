import { useState, useEffect, useRef } from 'react';
import { menuApi, categoriesApi } from '@/api/menu/menu';
import { type Category } from '@/api/menu/schema';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductAdded: () => void;
}

function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
    const [formData, setFormData] = useState({
        food_name: '',
        price: '',
        category_id: '',
        description: '',
        is_available: true,
        preparation_time_minutes: 15,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadCategories = async () => {
        try {
            const cats = await categoriesApi.getCategories();
            setCategories(cats);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Разрешены только JPG, PNG и WebP изображения');
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('Размер файла не должен превышать 5MB');
                return;
            }
            setImageFile(file);
            setError(null);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formPayload = new FormData();
        formPayload.append('food_name', formData.food_name);
        formPayload.append('price', formData.price);
        formPayload.append('category_id', formData.category_id);
        if (formData.description) {
            formPayload.append('description', formData.description);
        }
        formPayload.append('is_available', formData.is_available.toString());
        formPayload.append('preparation_time_minutes', formData.preparation_time_minutes.toString());
        if (imageFile) {
            formPayload.append('image', imageFile);
        }

        try {
            await menuApi.createMenuItem(formPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onProductAdded();
            onClose();
            setFormData({
                food_name: '',
                price: '',
                category_id: '',
                description: '',
                is_available: true,
                preparation_time_minutes: 15,
            });
            setImageFile(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка при добавлении товара');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className='flex min-h-full items-center justify-center p-4'>
                <div className="bg-surface-card relative transform overflow-hidden rounded-lg shadow-xl transition-all sm:my-10 sm:w-full sm:max-w-lgs">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-surface-border">
                        <h2 className="text-lg font-bold font-main text-text-primary">Добавить товар</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Закрыть"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {error && (
                            <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm font-main">
                                {error}
                            </div>
                        )}

                        {/* Название товара */}
                        <div>
                            <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                Название *
                            </label>
                            <input
                                type="text"
                                name="food_name"
                                value={formData.food_name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="Например: Маргарита"
                            />
                        </div>

                        {/* Цена и категория */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                    Цена (₽) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                    placeholder="500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                    Категория *
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                >
                                    <option value="">Выберите</option>
                                    {categories.map((cat) => (
                                        <option key={cat.category_id} value={cat.category_id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Описание */}
                        <div>
                            <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                Описание
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                placeholder="Краткое описание товара"
                            />
                        </div>

                        {/* Загрузка изображения */}
                        <div>
                            <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                Изображение
                            </label>
                            <div className="flex items-center gap-4">
                                {/* Preview */}
                                {imagePreview && (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-surface-border bg-surface-base">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-1 right-1 p-1 bg-error/90 hover:bg-error text-text-inverse rounded-full transition-colors"
                                            aria-label="Удалить изображение"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {/* Upload area */}
                                <label
                                    className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                                        imagePreview
                                            ? 'border-surface-border hover:border-accent'
                                            : 'border-surface-border hover:border-accent bg-surface-base/50'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-text-secondary mb-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                                    <span className="text-sm text-text-secondary font-main">
                                        {imagePreview ? 'Заменить изображение' : 'Загрузить изображение'}
                                    </span>
                                    <span className="text-xs text-text-secondary/70 font-main mt-1">
                                        JPG, PNG, WebP (макс. 5MB)
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Время приготовления */}
                        <div>
                            <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                Время приготовления (мин)
                            </label>
                            <input
                                type="number"
                                name="preparation_time_minutes"
                                value={formData.preparation_time_minutes}
                                onChange={handleChange}
                                min="1"
                                max="180"
                                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>

                        {/* Доступность */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_available"
                                id="is_available"
                                checked={formData.is_available}
                                onChange={handleChange}
                                className="w-4 h-4 text-accent border-surface-border rounded focus:ring-accent"
                            />
                            <label htmlFor="is_available" className="text-sm font-medium font-main text-text-primary">
                                Товар доступен для заказа
                            </label>
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-surface-base border border-surface-border text-text-primary rounded-lg font-main hover:bg-surface-hover transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg font-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Добавление...' : 'Добавить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddProductModal;
