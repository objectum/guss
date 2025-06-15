import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthContextType, User } from '../types';
import { authAPI } from '../services/api';
import { hashPassword } from '../utils/crypto';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'AUTH_ERROR'; payload: string }
    | { type: 'AUTH_LOGOUT' }
    | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START':
            return { ...state, loading: true, error: null };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        case 'AUTH_ERROR':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };
        case 'AUTH_LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Проверяем наличие токена при загрузке
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                const user: User = {
                    id: decoded.id || decoded.sub,
                    username: decoded.username,
                    isAdmin: decoded.isAdmin || false,
                    isNikita: decoded.isNikita || false,
                };
                dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
            } catch (error) {
                localStorage.removeItem('accessToken');
            }
        }
    }, []);

    const login = async (username: string, password: string) => {
        dispatch({ type: 'AUTH_START' });
        try {
            // Хэшируем пароль перед отправкой
            const hashedPassword = hashPassword(password);
            const response = await authAPI.login({ username, password: hashedPassword });
            const decoded: any = jwtDecode(response.accessToken);
            const user: User = {
                id: decoded.id || decoded.sub,
                username: decoded.username,
                isAdmin: decoded.isAdmin || false,
                isNikita: decoded.isNikita || false,
            };

            localStorage.setItem('accessToken', response.accessToken);
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: response.accessToken } });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Ошибка аутентификации';
            dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_LOGOUT' });
    };

    const contextValue: AuthContextType = {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        login,
        logout,
        loading: state.loading,
        error: state.error,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
