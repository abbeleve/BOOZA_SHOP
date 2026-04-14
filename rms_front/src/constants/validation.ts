// Длина строк
export const MIN_USERNAME_LENGTH = 2;
export const MAX_USERNAME_LENGTH = 29;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 29;
export const MAX_PATRONYMIC_LENGTH = 29;
export const MIN_SURNAME_LENGTH = 2;
export const MAX_SURNAME_LENGTH = 29;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 1024;
export const MIN_PHONE_DIGITS = 10;
export const MAX_PHONE_DIGITS = 11;
export const MAX_EMAIL_LENGTH = 254;

// Регулярные выражения
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_DIGITS_REGEX = /^\+?[\d\s\-\(\)]+$/;

// Сообщения об ошибках
export const ERRORS = {
    TOO_SHORT: (field: string, min: number) =>
        `${field} должно содержать минимум ${min} символа`,
    TOO_LONG: (field: string, max: number) =>
        `${field} должно содержать не более ${max} символов`,
    INVALID_EMAIL: 'Введите корректный email',
    EMAIL_TOO_LONG: 'Email слишком длинный (макс. 254 символа)',
    INVALID_EMAIL_FORMAT: 'Email содержит недопустимые символы',
    INVALID_PHONE: 'Введите корректный номер телефона',
    PASSWORDS_MISMATCH: 'Пароли не совпадают',
    USERNAME_OR_EMAIL_REQUIRED: 'Введите username или email',
} as const;

