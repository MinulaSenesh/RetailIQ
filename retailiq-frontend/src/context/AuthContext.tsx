// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

interface User {
    userId: number;
    username: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// In-memory token store (not localStorage — per spec)
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export function getAccessToken() { return _accessToken; }

// Use relative URL so Vite proxy handles routing to :8080 — avoids CORS
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const STORAGE_KEY_TOKEN = "retailiq_refresh_token";
const STORAGE_KEY_USER = "retailiq_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_USER);
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoading, setIsLoading] = useState(true); // Start as true to check session
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitializedRef = useRef(false);



    const logout = useCallback(() => {
        _accessToken = null;
        _refreshToken = null;
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
        setUser(null);
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    }, []);

    const scheduleRefresh = useCallback((expiresIn: number) => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        const refreshIn = Math.max(0, expiresIn - 60_000); // 1 min before expiry
        refreshTimerRef.current = setTimeout(async () => {
            const token = _refreshToken;
            if (!token) return;
            try {
                const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: token });
                _accessToken = data.data.accessToken;
                _refreshToken = data.data.refreshToken;
                localStorage.setItem(STORAGE_KEY_TOKEN, _refreshToken!);
                scheduleRefresh(data.data.expiresIn);
            } catch {
                logout();
            }
        }, refreshIn);
    }, [logout]);

    const registerCustomer = useCallback(async (firstName: string, lastName: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data } = await axios.post(`${API_BASE}/auth/register`, { firstName, lastName, email, password });
            const { accessToken, refreshToken, expiresIn, user: userData } = data.data;
            _accessToken = accessToken;
            _refreshToken = refreshToken;
            localStorage.setItem(STORAGE_KEY_TOKEN, refreshToken);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
            setUser(userData);
            scheduleRefresh(expiresIn);
        } finally {
            setIsLoading(false);
        }
    }, [scheduleRefresh]);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
            const { accessToken, refreshToken, expiresIn, user: userData } = data.data;
            _accessToken = accessToken;
            _refreshToken = refreshToken;
            localStorage.setItem(STORAGE_KEY_TOKEN, refreshToken);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
            setUser(userData);
            scheduleRefresh(expiresIn);
        } finally {
            setIsLoading(false);
        }
    }, [scheduleRefresh]);

    // Global Axios Interceptor to attach JWT token
    React.useLayoutEffect(() => {
        const interceptor = axios.interceptors.request.use((config) => {
            if (_accessToken && config.url && !config.url.includes("/auth/")) {
                config.headers.Authorization = `Bearer ${_accessToken}`;
            }
            return config;
        });

        return () => axios.interceptors.request.eject(interceptor);
    }, []);

    // Initial check for existing session
    useEffect(() => {
        if (isInitializedRef.current) return;
        isInitializedRef.current = true;

        const initAuth = async () => {
            const savedRefreshToken = localStorage.getItem(STORAGE_KEY_TOKEN);
            if (savedRefreshToken) {
                _refreshToken = savedRefreshToken;
                try {
                    const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: savedRefreshToken });
                    _accessToken = data.data.accessToken;
                    _refreshToken = data.data.refreshToken;
                    localStorage.setItem(STORAGE_KEY_TOKEN, _refreshToken!);
                    // Re-fetch profile to ensure user data is fresh
                    const profileRes = await axios.get(`${API_BASE}/profile`, {
                        headers: { Authorization: `Bearer ${_accessToken}` }
                    });
                    const userData = profileRes.data.data;
                    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
                    setUser(userData);
                    scheduleRefresh(data.data.expiresIn);
                } catch (e) {
                    console.error("Auth hydration failed", e);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [scheduleRefresh, logout]);

    useEffect(() => {
        return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
    }, []);

    const updateUser = useCallback((updatedUser: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...updatedUser } : null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register: registerCustomer, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
