// src/hooks/useAnalytics.ts — Custom hook for analytics data fetching
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { KpiData, SalesTrend, CustomerSegment, ProductPerformance } from "@/types";

interface DateRange { startDate: string; endDate: string; }

export function useAnalytics(filters: DateRange & { period?: string; region?: string; categoryId?: number }) {
    const [kpis, setKpis] = useState<KpiData | null>(null);
    const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
    const [segments, setSegments] = useState<CustomerSegment[]>([]);
    const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                start_date: filters.startDate,
                end_date: filters.endDate,
                period: filters.period ?? "day",
                ...(filters.region && { region: filters.region }),
                ...(filters.categoryId && { category_id: filters.categoryId }),
            };
            const [kpiRes, trendRes, segRes, prodRes] = await Promise.all([
                api.get("/analytics/kpis", { params }),
                api.get("/analytics/sales/trend", { params }),
                api.get("/analytics/customers/segments"),
                api.get("/analytics/products/top", { params: { ...params, limit: 10 } }),
            ]);
            setKpis(kpiRes.data.data);
            setSalesTrend(trendRes.data.data);
            setSegments(segRes.data.data);
            setTopProducts(prodRes.data.data);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Failed to load analytics data");
        } finally {
            setLoading(false);
        }
    }, [filters.startDate, filters.endDate, filters.period, filters.region, filters.categoryId]);

    useEffect(() => { fetch(); }, [fetch]);

    return { kpis, salesTrend, segments, topProducts, loading, error, refetch: fetch };
}
