import api from "@/lib/api";

export interface AuditLogUser {
    userId: number;
    username: string;
    email: string;
    role: string;
}

export interface AuditLog {
    logId: number;
    user: AuditLogUser | null;
    action: string;
    tableName: string;
    recordId: number;
    details: string;
    ipAddress: string;
    createdAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const auditService = {
    getLogs: async (page = 0, size = 100) => {
        const { data } = await api.get<ApiResponse<PageResponse<AuditLog>>>(`/audit?page=${page}&size=${size}`);
        return data;
    },
};
