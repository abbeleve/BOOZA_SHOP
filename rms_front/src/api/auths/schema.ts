export type User = {
    id: string;
    username: string;
    address?: string;
    email: string;
    phone: string;
    role: 'user' | 'admin' | 'staff';
};

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    token_type?: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}
