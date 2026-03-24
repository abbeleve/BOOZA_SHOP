import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import type { RegisterRequest } from '@/api/auths/schema';
import { ClipLoader } from 'react-spinners';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { 
    MIN_USERNAME_LENGTH,
    MIN_NAME_LENGTH,
    MIN_SURNAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    MIN_PHONE_DIGITS,
    EMAIL_REGEX,
    ERRORS
} from '@/constants/validation';

export default function RegisterForm() {
    const [form, setForm] = useState<RegisterRequest>({
        username: '',
        password: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        patronymic: '',
        address: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterRequest | 'confirmPassword', string>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { register, isLoading, error: contextError, clearError } = useUser();
    const navigate = useNavigate();
    const phoneMask = usePhoneMask(form.phone);

    const error = contextError || errors.username;

    const validate = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof RegisterRequest | 'confirmPassword', string>> = {};
        
        if (!form.username || form.username.trim().length < MIN_USERNAME_LENGTH) {
            newErrors.username = ERRORS.TOO_SHORT('Username', MIN_USERNAME_LENGTH);
        }
        if (!form.name || form.name.trim().length < MIN_NAME_LENGTH) {
            newErrors.name = ERRORS.TOO_SHORT('Имя', MIN_NAME_LENGTH);
        }
        if (!form.surname || form.surname.trim().length < MIN_SURNAME_LENGTH) {
            newErrors.surname = ERRORS.TOO_SHORT('Фамилия', MIN_SURNAME_LENGTH);
        }
        if (!form.email || !EMAIL_REGEX.test(form.email)) {
            newErrors.email = ERRORS.INVALID_EMAIL;
        }
        if (!form.phone || form.phone.replace(/\D/g, '').length < MIN_PHONE_DIGITS) {
            newErrors.phone = ERRORS.INVALID_PHONE;
        }
        if (!form.password || form.password.length < MIN_PASSWORD_LENGTH) {
            newErrors.password = ERRORS.TOO_SHORT('Пароль', MIN_PASSWORD_LENGTH);
        }
        if (form.password !== confirmPassword) {
            newErrors.confirmPassword = ERRORS.PASSWORDS_MISMATCH;
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
            await register({
                ...form,
                phone: phoneMask.getRawValue(), // +79991234567
            });
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
                {/* Username */}
                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Username<span className="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.username}
                        onChange={handleChange('username')}
                        className={inputClass('username')}
                        placeholder="login123"
                        autoComplete="username"
                        minLength={3}
                    />
                    {errors.username && <p className="mt-1 text-xs text-error">{errors.username}</p>}
                </div>

                {/* Имя + Фамилия в одну строку на десктопе */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-text-primary font-medium mb-2">
                            Имя<span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={handleChange('name')}
                            className={inputClass('name')}
                            placeholder="Иван"
                            autoComplete="given-name"
                        />
                        {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-text-primary font-medium mb-2">
                            Фамилия<span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.surname}
                            onChange={handleChange('surname')}
                            className={inputClass('surname')}
                            placeholder="Иванов"
                            autoComplete="family-name"
                        />
                        {errors.surname && <p className="mt-1 text-xs text-error">{errors.surname}</p>}
                    </div>
                </div>

                {/* Отчество */}
                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Отчество
                    </label>
                    <input
                        type="text"
                        value={form.patronymic}
                        onChange={handleChange('patronymic')}
                        className={inputClass('patronymic')}
                        placeholder="Иванович"
                        autoComplete="additional-name"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Email<span className="text-error">*</span>
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        className={inputClass('email')}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                    {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
                </div>

                {/* Телефон с маской */}
                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Телефон<span className="text-error">*</span>
                    </label>
                    <input
                        type="tel"
                        value={phoneMask.value}
                        onChange={(e) => {
                            phoneMask.onChange(e);
                            handleChange('phone')(e);
                        }}
                        className={inputClass('phone')}
                        placeholder="+7 (999) 000-00-00"
                        autoComplete="tel"
                        maxLength={18}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
                </div>

                {/* Пароль */}
                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Пароль<span className="text-error">*</span>
                    </label>
                    
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange('password')}
                            className={`${inputClass('password')} pr-10`}
                            placeholder="••••••••"
                            minLength={6}
                            autoComplete="new-password"
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

                {/* Подтверждение пароля */}
                <div>
                    <label className="block text-text-primary font-medium mb-2">
                        Подтвердите пароль<span className="text-error">*</span>
                    </label>
                    
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) {
                                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                    clearError();
                                }
                            }}
                            className={`${inputClass('confirmPassword')} pr-10`}
                            placeholder="••••••••"
                            minLength={6}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                            aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? (
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
                    
                    {errors.confirmPassword && <p className="mt-1 text-xs text-error">{errors.confirmPassword}</p>}
                </div>

                {/* Адрес */}
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