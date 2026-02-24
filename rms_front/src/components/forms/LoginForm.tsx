import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import type { LoginRequest } from '@/api/auths/schema';
import { ClipLoader } from 'react-spinners';

export default function LoginForm() {
    const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
    const [errors, setErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});
    
    const { login, isLoading, error: contextError, clearError } = useUser();
    const navigate = useNavigate();

    const error = contextError || errors.email;

    const validate = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof LoginRequest, string>> = {};
        
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Введите корректный email';
        }
        if (!form.password || form.password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form]);

    const handleChange = useCallback((field: keyof LoginRequest) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
            clearError();
        }
    }, [errors, clearError]);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();
        
        if (!validate()) return;
        
        try {
            await login(form.email, form.password);
            navigate('/');
        } catch {
            // Ошибка уже в контексте
        }
    };

    const inputClass = (field: keyof LoginRequest) => 
        `w-full px-4 py-3 rounded-lg border bg-surface-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
            errors[field] ? 'border-error focus:ring-error' : 'border-surface-border'
        }`;

    return (
        <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-sm border border-surface-border p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Вход в аккаунт</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="login-email" className="block text-text-primary font-medium mb-2">
                        Email
                    </label>
                    <input
                        id="login-email"
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        className={inputClass('email')}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                    {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
                </div>
                

                <div>
                    <label htmlFor="login-password" className="block text-text-primary font-medium mb-2">
                        Пароль
                    </label>
                    <input
                        id="login-password"
                        type="password"
                        value={form.password}
                        onChange={handleChange('password')}
                        className={inputClass('password')}
                        placeholder="••••••••"
                        minLength={6}
                        autoComplete="current-password"
                    />
                    {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-accent-hover text-text-inverse font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? <ClipLoader size={20} color="white" /> : 'Войти'}
                </button>
            </form>

            <p className="mt-6 text-center text-text-secondary">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">
                    Регистрация
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