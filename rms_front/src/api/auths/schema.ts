// Пользователь (ответ от /me)
export type User = {
    user_id: string;
    username: string;
    name: string;
    surname: string;
    patronymic?: string;
    email: string;
    phone: string;
    address?: string;
    is_staff: boolean;
    role?: 'user' | 'admin' | 'staff' | null;
};

// Запрос на вход
export interface LoginRequest {
    username: string;  //  Может быть username или email
    password: string;
}

// Запрос на регистрацию
export interface RegisterRequest {
    username: string;
    password: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    patronymic?: string;
    address?: string;
}

// Ответ авторизации
export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;     //  время жизни в секундах
    // user нет в ответе — нужно отдельно запрашивать /me
}

// Запрос на refresh
export interface RefreshTokenRequest {
    refresh_token: string;
}

// Контекст
export interface AuthContextType {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}
