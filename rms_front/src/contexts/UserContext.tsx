import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
    useCallback,
} from 'react';
import apiClient from "@/api/client";
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { 
    User, 
    AuthResponse, 
    AuthContextType, 
    RegisterRequest,
    RefreshTokenRequest 
} from '@/api/auths/schema';

const UserContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'booza_access_token';
const REFRESH_TOKEN_KEY = 'booza_refresh_token';

// Настройка axios
apiClient.defaults.headers.common['Content-Type'] = 'application/json';

// Интерцептор запроса: добавляет access token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Интерцептор ответа: авто-refresh при 401
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        const requestUrl = originalRequest.url || '';
        if (
            requestUrl.includes('/api/auth/login') ||
            requestUrl.includes('/api/auth/register') ||
            requestUrl.includes('/api/auth/refresh')
        ) {
            return Promise.reject(error);
        }
        
        // Если 401 и запрос ещё не повторялся
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Если уже идёт refresh — ждём его завершения
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    (originalRequest as any).headers = {
                        ...(originalRequest as any).headers,
                        Authorization: `Bearer ${token}`,
                    };
                    return apiClient(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }
            
            isRefreshing = true;
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            
            if (!refreshToken) {
                // Нет refresh token — разлогиниваем
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                delete apiClient.defaults.headers.common['Authorization'];
                isRefreshing = false;
                processQueue(new Error('No refresh token'));
                window.location.href = '/login';
                return Promise.reject(error);
            }
            
            try {
                // Пытаемся получить новый access token
                const { data } = await apiClient.post<AuthResponse>('/api/auth/refresh', {
                    refresh_token: refreshToken,
                } as RefreshTokenRequest);
                
                const newAccessToken = data.access_token;
                
                // Сохраняем новый токен
                localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                
                // Повторяем запросы из очереди
                processQueue(null, newAccessToken);
                
                return apiClient(originalRequest);
                
            } catch (refreshError) {
                // Refresh не удался — чистим всё и редиректим на логин
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                delete apiClient.defaults.headers.common['Authorization'];
                processQueue(refreshError as Error);
                window.location.href = '/login';
                return Promise.reject(refreshError);
                
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Валидация токена при старте
    const validateToken = useCallback(async (storedToken: string) => {
        try {
            const { data } = await apiClient.get<User>('/api/auth/me', {
                headers: { Authorization: `Bearer ${storedToken}` },
            });
            setUser(data);
            setToken(storedToken);
        } catch {
            // Токен невалиден — чистим
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            delete apiClient.defaults.headers.common['Authorization'];
        }
    }, []);

    // Инициализация
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
            const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
            
            if (storedToken && storedRefresh) {
                setToken(storedToken);
                setRefreshToken(storedRefresh);
                await validateToken(storedToken);
            }
            setIsLoading(false);
        };
        initAuth();
    }, [validateToken]);

    // Вход
    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const { data } = await apiClient.post<AuthResponse>('/api/auth/login', {
                username,
                password,
            });
            
            if (!data.access_token || !data.refresh_token) {
                throw new Error('Токены не получены от сервера');
            }
            
            // Сохраняем оба токена
            setToken(data.access_token);
            setRefreshToken(data.refresh_token);
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
            
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
            
            // Загружаем данные пользователя
            await refreshUser();
            
        } catch (err: any) {
            const message = err.response?.data?.detail || 'Ошибка авторизации';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Регистрация
    const register = async (registerData: RegisterRequest) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const { data } = await apiClient.post<AuthResponse>('/api/auth/register', registerData);
            
            if (!data.access_token || !data.refresh_token) {
                throw new Error('Токены не получены от сервера');
            }
            
            setToken(data.access_token);
            setRefreshToken(data.refresh_token);
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
            
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
            
            await refreshUser();
            
        } catch (err: any) {
            const message = err.response?.data?.detail || 'Ошибка регистрации';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Обновление access token
    const refreshAccessToken = useCallback(async () => {
        const currentRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!currentRefresh) throw new Error('No refresh token');
        
        const { data } = await apiClient.post<AuthResponse>('/api/auth/refresh', {
            refresh_token: currentRefresh,
        } as RefreshTokenRequest);
        
        if (data.access_token) {
            setToken(data.access_token);
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        }
    }, []);

    // Выход
    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        delete apiClient.defaults.headers.common['Authorization'];
    }, []);

    // Загрузка данных пользователя
    const refreshUser = useCallback(async () => {
        const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!currentToken) return;
        
        try {
            const { data } = await apiClient.get<User>('/api/auth/me');
            setUser(data);
        } catch {
            logout();
        }
    }, [logout]);

    const clearError = useCallback(() => setError(null), []);

    const value: AuthContextType = {
        user,
        token,
        refreshToken,
        login,
        register,
        logout,
        refreshUser,
        refreshAccessToken,
        isLoading,
        error,
        clearError,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}