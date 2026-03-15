import { useState } from 'react';
import { categoriesApi } from '@/api/menu/menu';

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryAdded: () => void;
}

function AddCategoryModal({ isOpen, onClose, onCategoryAdded }: AddCategoryModalProps) {
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!categoryName.trim()) {
            setError('Введите название категории');
            setLoading(false);
            return;
        }

        try {
            await categoriesApi.createCategory(categoryName.trim());
            onCategoryAdded();
            onClose();
            setCategoryName('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка при добавлении категории');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCategoryName('');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />
            <div className='flex min-h-full items-center justify-center p-4'>
                <div className="bg-surface-card relative transform overflow-hidden rounded-lg shadow-xl transition-all sm:my-10 sm:w-full sm:max-w-md">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-surface-border">
                        <h2 className="text-lg font-bold font-main text-text-primary">Добавить категорию</h2>
                        <button
                            onClick={handleClose}
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

                        {/* Название категории */}
                        <div>
                            <label className="block text-sm font-medium font-main text-text-primary mb-1">
                                Название категории *
                            </label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="Например: Пицца"
                                autoFocus
                            />
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
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

export default AddCategoryModal;
