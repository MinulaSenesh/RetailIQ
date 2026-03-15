import api from "@/lib/api";
import { Customer } from "@/types";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const customerService = {
    create: async (customer: Partial<Customer>) => {
        const { data } = await api.post<ApiResponse<Customer>>("/customers", customer);
        return data;
    },
    update: async (id: number, customer: Partial<Customer>) => {
        const { data } = await api.put<ApiResponse<Customer>>(`/customers/${id}`, customer);
        return data;
    },
    delete: async (id: number) => {
        const { data } = await api.delete<ApiResponse<void>>(`/customers/${id}`);
        return data;
    },
};
