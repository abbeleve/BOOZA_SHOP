// Длина строк
export const MIN_USERNAME_LENGTH = 2;
export const MIN_NAME_LENGTH = 2;
export const MIN_SURNAME_LENGTH = 2;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_PHONE_DIGITS = 10;

export const PASSWORD_RULES = {
    LOWERCASE: /[a-zа-яё]/,
    UPPERCASE: /[A-ZА-ЯЁ]/,
    DIGIT: /\d/,
    SPECIAL: /[@$!%*?&]/,
    NO_SPACES: /^\S*$/,
};

// Регулярные выражения
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_DIGITS_REGEX = /^\+?[\d\s\-\(\)]+$/;

// Сообщения об ошибках
export const ERRORS = {
    TOO_SHORT: (field: string, min: number) => 
        `${field} должно содержать минимум ${min} символов`,
    TOO_LONG: (field: string, max: number) => 
        `${field} должно содержать максимум ${max} символа`,
    PASSWORD_LOWERCASE: 'Пароль должен содержать хотя бы одну строчную букву (a-z)',
    PASSWORD_UPPERCASE: 'Пароль должен содержать хотя бы одну заглавную букву (A-Z)',
    PASSWORD_DIGIT: 'Пароль должен содержать хотя бы одну цифру (0-9)',
    PASSWORD_SPECIAL: 'Пароль должен содержать хотя бы один спецсимвол (@$!%*?&)',
    PASSWORD_NO_SPACES: 'Пароль не должен содержать пробелы',
    INVALID_EMAIL: 'Введите корректный email',
    INVALID_PHONE: 'Введите корректный номер телефона',
    PASSWORDS_MISMATCH: 'Пароли не совпадают',
    USERNAME_OR_EMAIL_REQUIRED: 'Введите username или email',
} as const;

