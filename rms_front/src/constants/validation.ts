// Длина строк
export const MIN_USERNAME_LENGTH = 2;
export const MIN_NAME_LENGTH = 2;
export const MIN_SURNAME_LENGTH = 2;
export const MIN_PASSWORD_LENGTH = 6;
export const MIN_PHONE_DIGITS = 10;

// Регулярные выражения
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_DIGITS_REGEX = /^\+?[\d\s\-\(\)]+$/;

// Сообщения об ошибках
export const ERRORS = {
    TOO_SHORT: (field: string, min: number) => 
        `${field} должно содержать минимум ${min} символа`,
    INVALID_EMAIL: 'Введите корректный email',
    INVALID_PHONE: 'Введите корректный номер телефона',
    PASSWORDS_MISMATCH: 'Пароли не совпадают',
    USERNAME_OR_EMAIL_REQUIRED: 'Введите username или email',
} as const;

