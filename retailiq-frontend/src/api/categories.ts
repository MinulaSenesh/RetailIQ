import api from "@/lib/api";
import { Category } from "@/types";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const categoryService = {
    getAll: async () => {
        const { data } = await api.get<ApiResponse<Category[]>>("/categories");
        return data.data;
    },
    create: async (name: string) => {
        const { data } = await api.post<ApiResponse<Category>>("/categories", { name });
        return data.data;
    },
};
