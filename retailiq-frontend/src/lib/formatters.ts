// src/lib/formatters.ts — Utility formatting functions

import { formatDistanceToNow, format } from "date-fns";
import type { Segment } from "@/types";

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(dateStr: string): string {
    return format(new Date(dateStr), "MMM d, yyyy");
}

export function formatRelativeDate(dateStr: string): string {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatPercent(value: number, digits = 1): string {
    const absValue = Math.abs(value);
    if (absValue < 0.1) return "0.0%";
    const sign = value > 0 ? "+" : "-";
    return `${sign}${absValue.toFixed(digits)}%`;
}

export function getSegmentColor(segment: string): string {
    const map: Record<string, string> = {
        Champion: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
        Loyal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "Potential Loyal": "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
        Promising: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
        New: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
        "At Risk": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        "Cannot Lose": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        Lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return map[segment] ?? "bg-gray-100 text-gray-800";
}

export function getStatusColor(status: string): string {
    const map: Record<string, string> = {
        Delivered: "bg-emerald-100 text-emerald-800",
        Shipped: "bg-blue-100 text-blue-800",
        Processing: "bg-amber-100 text-amber-800",
        Pending: "bg-gray-100 text-gray-800",
        Cancelled: "bg-red-100 text-red-800",
    };
    return map[status] ?? "bg-gray-100 text-gray-800";
}

export function getTrendIcon(value: number): "up" | "down" | "flat" {
    if (value > 0.5) return "up";
    if (value < -0.5) return "down";
    return "flat";
}

export function getSegmentChartColor(segment: string): string {
    const map: Record<string, string> = {
        Champion: "#10b981",
        Loyal: "#3b82f6",
        "Potential Loyal": "#0ea5e9",
        Promising: "#8b5cf6",
        New: "#14b8a6",
        "At Risk": "#f59e0b",
        "Cannot Lose": "#f97316",
        Lost: "#ef4444",
    };
    return map[segment] ?? "#6b7280";
}
