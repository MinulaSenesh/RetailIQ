// src/types/index.ts — All TypeScript interfaces matching API DTOs

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    error?: string;
    timestamp: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export interface User {
    userId: number;
    username: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "ANALYST" | "CUSTOMER";
}

export interface Customer {
    customerId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    city?: string;
    country: string;
    createdAt: string;
    segment?: string;
    rfmScore?: number;
    avatarUrl?: string;
}

export interface Category {
    categoryId: number;
    name: string;
}

export interface Product {
    productId: number;
    productName: string;
    category: Category;
    sku: string;
    unitPrice: number;
    costPrice: number;
    stockQuantity: number;
    active: boolean;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    itemId: number;
    product: Product;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface Order {
    orderId: number;
    customer: Customer;
    orderDate: string;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
    totalAmount: number;
    discountAmount: number;
    paymentMethod?: string;
    region?: string;
    items?: OrderItem[];
}

export interface KpiData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCustomers: number;
    revenueGrowthPercent: number;
    orderGrowthPercent: number;
    customerGrowthPercent: number;
    averageOrderValueGrowthPercent: number;
}

export interface SalesTrend {
    period: string;
    revenue: number;
    orderCount: number;
}

export interface CustomerSegment {
    segment: string;
    count: number;
    percentage: number;
}

export interface ProductPerformance {
    productId: number;
    productName: string;
    sku: string;
    category: string;
    totalRevenue: number;
    unitsSold: number;
    grossMargin: number;
    marginPercent: number;
}

export interface ForecastPoint {
    date: string;
    predicted: number;
    lower_bound: number;
    upper_bound: number;
}

export interface ForecastData {
    predictions: ForecastPoint[];
    mae: number;
    rmse: number;
    r2: number;
    days_forecasted: number;
}

export interface RfmSegment {
    segment: string;
    count: number;
    percentage: number;
}

export type Segment = "Champion" | "Loyal" | "Potential Loyal" | "At Risk" | "Cannot Lose" | "Lost" | "New" | "Promising";
