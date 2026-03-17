// src/lib/api.ts
import axios from "axios";
import { getAccessToken } from "@/context/AuthContext";

const api = axios.create({
    // Use Vite proxy in development, absolute URL in production
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle token refresh or logout on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Logic for token refresh would go here
            // For now, clear session and redirect to login if refresh fails
            console.error("Unauthorized access, redirecting to login...");
            window.sessionStorage.removeItem("accessToken");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
