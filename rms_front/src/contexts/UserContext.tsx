import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
    useCallback,
} from 'react';
import axios, { AxiosError } from 'axios';
import type { User, AuthResponse, AuthContextType, RegisterRequest } from '@/api/auths/schema';

const UserContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = 'booza_auth_token';
const API_BASE = '/api';

axios.defaults.baseURL = API_BASE;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Интерцепторы (без изменений)
axios.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            delete axios.defaults.headers.common['Authorization'];
        }
        return Promise.reject(error);
    }
);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const validateToken = useCallback(async (storedToken: string) => {
        try {
            const { data } = await axios.get<User>('/api/auth/me', {
                headers: { Authorization: `Bearer ${storedToken}` },
            });
            setUser(data);
            setToken(storedToken);
        } catch {
            localStorage.removeItem(TOKEN_KEY);
            delete axios.defaults.headers.common['Authorization'];
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem(TOKEN_KEY);
            if (storedToken) await validateToken(storedToken);
            setIsLoading(false);
        };
        initAuth();
    }, [validateToken]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await axios.post<AuthResponse>('/api/auth/login', { email, password });
            if (!data.access_token) throw new Error('Токен не получен');
            
            setToken(data.access_token);
            setUser(data.user);
            localStorage.setItem(TOKEN_KEY, data.access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        } catch (err: any) {
            const message = err.response?.data?.detail || err.response?.data?.message || 'Ошибка авторизации';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data: responseData } = await axios.post<AuthResponse>('/api/auth/register', data);
            if (!responseData.access_token) throw new Error('Токен не получен');
            
            setToken(responseData.access_token);
            setUser(responseData.user);
            localStorage.setItem(TOKEN_KEY, responseData.access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${responseData.access_token}`;
        } catch (err: any) {
            const message = err.response?.data?.detail || err.response?.data?.message || 'Ошибка регистрации';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        delete axios.defaults.headers.common['Authorization'];
    }, []);
    

    const refreshUser = useCallback(async () => {
        const currentToken = localStorage.getItem(TOKEN_KEY);
        if (!currentToken) return;
        try {
            const { data } = await axios.get<User>('/api/auth/me');
            setUser(data);
        } catch {
            logout();
        }
    }, [logout]);

    const clearError = useCallback(() => setError(null), []);

    return (
        <UserContext.Provider value={{ user, token, login, register, logout, refreshUser, isLoading, error, clearError }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) throw new Error('useUser must be used within a UserProvider');
    return context;
}