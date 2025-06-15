export interface User {
    id: string;
    username: string;
    isAdmin: boolean;
    isNikita: boolean;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface Round {
    id: string;
    startTime: string;
    endTime: string;
    status?: 'Активен' | 'Cooldown' | 'Завершен';
    leader?: string;
}

export interface TapResponse {
    tap: number;
    score: number;
}

export interface TapRequest {
    round_id: number;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    error: string | null;
}
