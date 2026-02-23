import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { ClipLoader } from 'react-spinners';

export type AuthMode = 'login' | 'register';

interface AuthFormProps {
    mode: AuthMode;
    onSuccess?: () => void;
}

interface FormData {
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
    const [form, setForm] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    
    const { login, register, isLoading, error: contextError } = useUser();
    const navigate = useNavigate();

    const isRegister = mode === 'register';

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        
        if (isRegister && (!form.name || form.name.trim().length < 2)) {
            newErrors.name = 'Имя должно содержать минимум 2 символа';
        }
        
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Введите корректный email';
        }
        
        if (!form.password || form.password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }
        
        if (isRegister && form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        // Очищаем ошибку поля при вводе
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        try {
            if (isRegister) {
                await register(form.name!, form.email, form.password);
            } else {
                await login(form.email, form.password);
            }
            onSuccess?.();
            navigate('/');
        } catch {
            // Ошибка уже установлена в контексте
        }
    };

    return (
        <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-sm border border-surface-border p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
                {isRegister ? 'Регистрация' : 'Вход в аккаунт'}
            </h2>
            
            {(contextError || errors.email) && (
                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                    {contextError || errors.email}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                    <div>
                        <label className="block text-text-primary font-medium mb-2">Имя</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={handleChange('name')}
                            className={`w-full px-4 py-3 rounded-lg border bg-surface-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                errors.name ? 'border-error focus:ring-error' : 'border-surface-border'
                            }`}
                            placeholder="Ваше имя"
                        />
                        {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
                    </div>
                )}

                <div>
                    <label className="block text-text-primary font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        className={`w-full px-4 py-3 rounded-lg border bg-surface-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                            errors.email ? 'border-error focus:ring-error' : 'border-surface-border'
                        }`}
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-text-primary font-medium mb-2">Пароль</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={handleChange('password')}
                        className={`w-full px-4 py-3 rounded-lg border bg-surface-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                            errors.password ? 'border-error focus:ring-error' : 'border-surface-border'
                        }`}
                        placeholder="••••••••"
                        minLength={6}
                    />
                    {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
                </div>

                {isRegister && (
                    <div>
                        <label className="block text-text-primary font-medium mb-2">Подтвердите пароль</label>
                        <input
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            className={`w-full px-4 py-3 rounded-lg border bg-surface-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                errors.confirmPassword ? 'border-error focus:ring-error' : 'border-surface-border'
                            }`}
                            placeholder="••••••••"
                            minLength={6}
                        />
                        {errors.confirmPassword && <p className="mt-1 text-xs text-error">{errors.confirmPassword}</p>}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-accent-hover text-text-inverse font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                    {isLoading ? (
                        <ClipLoader size={20} color="white" />
                    ) : (
                        isRegister ? 'Зарегистрироваться' : 'Войти'
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-text-secondary">
                {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
                <span className="text-accent font-medium cursor-pointer hover:underline"
                      onClick={() => navigate(isRegister ? '/login' : '/register')}>
                    {isRegister ? 'Войти' : 'Зарегистрироваться'}
                </span>
            </p>
        </div>
    );
}