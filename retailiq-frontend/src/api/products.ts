import api from "@/lib/api";
import { Product } from "@/types";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse {
    content: Product[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const productService = {
    getAll: async (page = 0, size = 10) => {
        const { data } = await api.get<ApiResponse<PaginatedResponse>>(`/products?page=${page}&size=${size}`);
        return data;
    },
    getById: async (id: number) => {
        const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
        return data;
    },
    create: async (product: Partial<Product>) => {
        const { data } = await api.post<ApiResponse<Product>>("/products", product);
        return data;
    },
    update: async (id: number, product: Partial<Product>) => {
        const { data } = await api.put<ApiResponse<Product>>(`/products/${id}`, product);
        return data;
    },
    delete: async (id: number) => {
        const { data } = await api.delete<ApiResponse<void>>(`/products/${id}`);
        return data;
    },
};
