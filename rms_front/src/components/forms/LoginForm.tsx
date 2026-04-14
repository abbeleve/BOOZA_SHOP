import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import type { LoginRequest } from '@/api/auths/schema';
import { MAX_PASSWORD_LENGTH, MAX_EMAIL_LENGTH } from '@/constants/validation';
import { ClipLoader } from 'react-spinners';

export default function LoginForm() {
    const [form, setForm] = useState<LoginRequest>({ username: '', password: '' });
    const [errors, setErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});
    const [showPassword, setShowPassword] = useState(false);

    const fieldRefs = {
        username: useRef<HTMLInputElement>(null),
        password: useRef<HTMLInputElement>(null),
    };

    const { login, isLoading, error: contextError, clearError } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        clearError();
        return () => { clearError(); };
    }, [clearError]);

    const scrollToFirstError = useCallback(() => {
        const errorFields = Object.keys(errors);
        if (errorFields.length === 0) return;

        const fieldOrder: (keyof LoginRequest)[] = ['username', 'password'];

        for (const field of fieldOrder) {
            if (errorFields.includes(field)) {
                const ref = fieldRefs[field]?.current;
                if (ref) {
                    ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    ref.focus();
                    break;
                }
            }
        }
    }, [errors]);

    const validate = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof LoginRequest, string>> = {};

        if (!form.username || form.username.trim().length === 0) {
            newErrors.username = 'Введите username или email';
        }
        if (!form.password || form.password.length === 0) {
            newErrors.password = 'Введите пароль';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form]);

    const handleChange = useCallback((field: keyof LoginRequest) => (
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

        if (!validate()) {
            // Scroll to first error field after validation fails
            setTimeout(() => scrollToFirstError(), 100);
            return;
        }

        try {
            await login(form.username, form.password);
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

            {contextError && (
                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                    {contextError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="login-username" className="block text-text-primary font-medium mb-2">
                        Username или Email
                    </label>
                    <input
                        id="login-username"
                        ref={fieldRefs.username}
                        type="text"
                        value={form.username}
                        onChange={handleChange('username')}
                        className={inputClass('username')}
                        placeholder="username или you@example.com"
                        autoComplete="username"
                        maxLength={MAX_EMAIL_LENGTH}
                    />
                    {errors.username && <p className="mt-1 text-xs text-error">{errors.username}</p>}
                </div>

                <div>
                    <label htmlFor="login-password" className="block text-text-primary font-medium mb-2">
                        Пароль
                    </label>

                    <div className="relative">
                        <input
                            id="login-password"
                            ref={fieldRefs.password}
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange('password')}
                            className={`${inputClass('password')} pr-10`}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            maxLength={MAX_PASSWORD_LENGTH}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>

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
                    Зарегистрироваться
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