import { useState, useCallback } from 'react';

export function usePhoneMask(initialValue: string = '') {
    const [value, setValue] = useState(initialValue);

    // Форматирует цифры в формат +7 (XXX) XXX-XX-XX
    const formatPhone = useCallback((raw: string): string => {
        // Удаляем всё кроме цифр
        const digits = raw.replace(/\D/g, '');
        
        // Обрабатываем пустой ввод
        if (!digits) return '';
        
        // Убираем лидирующие 8 или 7, если есть
        const cleaned = digits.replace(/^([87])?/, '');
        
        // Начинаем собирать номер
        let result = '+7';
        
        if (cleaned.length > 0) {
            result += ' (' + cleaned.slice(0, 3);
        }
        if (cleaned.length >= 3) {
            result += ') ' + cleaned.slice(3, 6);
        }
        if (cleaned.length >= 6) {
            result += '-' + cleaned.slice(6, 8);
        }
        if (cleaned.length >= 8) {
            result += '-' + cleaned.slice(8, 10);
        }
        
        return result;
    }, []);

    // Обработчик для onChange
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const formatted = formatPhone(raw);
        setValue(formatted);
        return formatted;
    }, [formatPhone]);

    // Получение "чистого" номера (только цифры) для отправки на сервер
    const getRawValue = useCallback((): string => {
        return '+7' + value.replace(/\D/g, '').slice(-10);
    }, [value]);

    // Сброс значения
    const reset = useCallback(() => setValue(''), []);

    return {
        value,
        onChange,
        getRawValue,
        reset,
        setValue: (val: string) => setValue(formatPhone(val)),
    };
}