import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import type { RegisterRequest } from '@/api/auths/schema';
import { ClipLoader } from 'react-spinners';

export default function RegisterForm() {
    const [form, setForm] = useState<RegisterRequest>({
        username: '',
        email: '',
        phone: '',
        password: '',
        address: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterRequest | 'confirmPassword', string>>>({});
    
    const { register, isLoading, error: contextError, clearError } = useUser();
    const navigate = useNavigate();

    const error = contextError || errors.email;

    const validate = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof RegisterRequest | 'confirmPassword', string>> = {};
        
        if (!form.username || form.username.trim().length < 2) {
            newErrors.username = 'Имя должно содержать минимум 2 символа';
        }
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Введите корректный email';
        }
        if (!form.phone || form.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'Введите корректный номер телефона';
        }
        if (!form.password || form.password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }
        if (form.password !== confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form, confirmPassword]);

    const handleChange = useCallback((field: keyof RegisterRequest) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
            clearError();
        }
    }, [errors, clearError]);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();
        
        if (!validate()) return;
        
        try {
            await register(form);
            navigate('/');
        } catch {
            // Ошибка уже в контексте
        }
    };

    const inputClass = (field: keyof RegisterRequest | 'confirmPassword') => 
        `w-full px-4 py-3 rounded-lg border bg-surface-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
            errors[field] ? 'border-error focus:ring-error' : 'border-surface-border'
        }`;

    return (
        <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-sm border border-surface-border p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Регистрация</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Имя пользователя<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.username}
                        onChange={handleChange('username')}
                        className={inputClass('username')}
                        placeholder="Ваше имя"
                        autoComplete="name"
                    />
                    {errors.username && <p className="mt-1 text-xs text-error">{errors.username}</p>}
                </div>
                

                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Email<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        className={inputClass('email')}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                </div>

                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Телефон<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        className={inputClass('phone')}
                        placeholder="+7 (999) 000-00-00"
                        autoComplete="tel"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
                </div>

                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Пароль<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={handleChange('password')}
                        className={inputClass('password')}
                        placeholder="••••••••"
                        minLength={6}
                        autoComplete="new-password"
                    />
                    {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
                </div>

                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Подтвердите пароль<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) {
                                setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                clearError();
                            }
                        }}
                        className={inputClass('confirmPassword')}
                        placeholder="••••••••"
                        minLength={6}
                        autoComplete="new-password"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-xs text-error">{errors.confirmPassword}</p>}
                </div>

                <div>
                    <label className="block text-text-primary font-medium mb-2">Адрес</label>
                    <input
                        type="text"
                        value={form.address}
                        onChange={handleChange('address')}
                        className={inputClass('address')}
                        placeholder="г. Москва, ул. Примерная, д. 1"
                        autoComplete="street-address"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-accent-hover text-text-inverse font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                    {isLoading ? <ClipLoader size={20} color="white" /> : 'Зарегистрироваться'}
                </button>
            </form>

            <p className="mt-6 text-center text-text-secondary">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
                    Войти
                </Link>
            </p>
            <p className="mt-6 text-center text-text-secondary">
                <Link to="/" className="text-accent hover:text-accent-hover font-medium transition-colors">
                    В меню
                </Link>
            </p>
        </div>
    );
}