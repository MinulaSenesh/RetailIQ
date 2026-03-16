// src/pages/DashboardPage.tsx
import { useState } from "react";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import KPICard from "@/components/dashboard/KPICard";
import AreaTrendChart from "@/components/charts/AreaTrendChart";
import DonutChart from "@/components/charts/DonutChart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatNumber, getSegmentChartColor } from "@/lib/formatters";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/shared/DateRangePicker";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "@/lib/api";

type Period = "day" | "week" | "month";

const SEED_SPARK = [
    { value: 30 }, { value: 45 }, { value: 38 }, { value: 55 }, { value: 48 }, { value: 62 }, { value: 58 },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const isViewer = user?.role === "VIEWER";
    const [period, setPeriod] = useState<Period>("day");
    
    // Default to last 30 days
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date()
    });

    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : startDate;

    const { kpis, salesTrend, segments, topProducts, loading } = useAnalytics({
        startDate,
        endDate,
        period,
    });

    const handleExport = async (type: "sales" | "products", format: "csv" | "pdf") => {
        try {
            const endpoint = format === "pdf" ? `/reports/export/${type}/pdf` : `/reports/export/${type}`;
            const response = await api.get(endpoint, {
                params: { start_date: startDate, end_date: endDate },
                responseType: 'blob'
            });
            
            const mimeType = format === "pdf" ? 'application/pdf' : 'text/csv;charset=utf-8;';
            const blob = new Blob([response.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_export_${startDate}_to_${endDate}.${format}`);
            document.body.appendChild(link);
            link.click();
            
            // Note: Intentionally NOT calling link.parentNode.removeChild(link)
            // or window.URL.revokeObjectURL(url) to prevent "File not found"
            // errors in Chrome/Edge during the "Save As" dialogue.
        } catch (error) {
            console.error(`Failed to export ${type} as ${format}`, error);
        }
    };

    const categoryDonutData = segments.length > 0
        ? segments.map(s => ({ name: s.segment, value: s.count, color: getSegmentChartColor(s.segment) }))
        : [
            { name: "Electronics", value: 35, color: "#3b82f6" },
            { name: "Clothing", value: 28, color: "#8b5cf6" },
            { name: "Food", value: 22, color: "#10b981" },
            { name: "Other", value: 15, color: "#f59e0b" },
        ];

    return (
        <div className="space-y-6">
            {isViewer && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm">
                    <div className="bg-blue-500 rounded-full p-1">
                        <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-400">Preview Mode</p>
                        <p className="text-xs text-blue-400/70">You are viewing this dashboard as a member of the community. All administrative actions are disabled.</p>
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-1">Analytics overview</p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <div className="flex gap-2">
                        <div className="flex rounded-md shadow-sm" role="group">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-r-none border-r-0" 
                                onClick={() => handleExport("sales", "csv")}
                                disabled={isViewer}
                            >
                                <FileText className="mr-2 h-4 w-4" /> Sales CSV
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-l-none" 
                                onClick={() => handleExport("sales", "pdf")}
                                disabled={isViewer}
                            >
                                PDF
                            </Button>
                        </div>
                        <div className="flex rounded-md shadow-sm" role="group">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-r-none border-r-0" 
                                onClick={() => handleExport("products", "csv")}
                                disabled={isViewer}
                            >
                                <Download className="mr-2 h-4 w-4" /> Products CSV
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-l-none" 
                                onClick={() => handleExport("products", "pdf")}
                                disabled={isViewer}
                            >
                                PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <KPICard
                    title="Total Revenue"
                    value={kpis?.totalRevenue ?? 0}
                    format="currency"
                    growthPercent={kpis?.revenueGrowthPercent ?? 0}
                    sparklineData={SEED_SPARK}
                    icon={<DollarSign className="w-4 h-4" />}
                    loading={loading}
                />
                <KPICard
                    title="Total Orders"
                    value={kpis?.totalOrders ?? 0}
                    growthPercent={kpis?.orderGrowthPercent ?? 0}
                    sparklineData={SEED_SPARK}
                    icon={<ShoppingCart className="w-4 h-4" />}
                    loading={loading}
                />
                <KPICard
                    title="Avg Order Value"
                    value={kpis?.averageOrderValue ?? 0}
                    format="currency"
                    growthPercent={kpis?.averageOrderValueGrowthPercent ?? 0}
                    sparklineData={SEED_SPARK}
                    icon={<TrendingUp className="w-4 h-4" />}
                    loading={loading}
                />
                <KPICard
                    title="Active Customers"
                    value={kpis?.totalCustomers ?? 0}
                    growthPercent={kpis?.customerGrowthPercent ?? 0}
                    sparklineData={SEED_SPARK}
                    icon={<Users className="w-4 h-4" />}
                    loading={loading}
                />
            </div>

            {/* Revenue Trend */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Revenue Trend</CardTitle>
                    <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
                        <TabsList className="h-8">
                            <TabsTrigger value="day" className="text-xs px-3 h-7">Daily</TabsTrigger>
                            <TabsTrigger value="week" className="text-xs px-3 h-7">Weekly</TabsTrigger>
                            <TabsTrigger value="month" className="text-xs px-3 h-7">Monthly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="w-full h-[280px]" />
                    ) : (
                        <AreaTrendChart data={salesTrend.map(d => ({ period: d.period, revenue: d.revenue, orderCount: d.orderCount }))} />
                    )}
                </CardContent>
            </Card>

            {/* Bottom row: Donut + Segments Bar + Top Products */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                {/* Segments Donut */}
                <Card>
                    <CardHeader><CardTitle className="text-lg">Customer Segments</CardTitle></CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="w-full h-[260px]" /> : <DonutChart data={categoryDonutData} />}
                    </CardContent>
                </Card>

                {/* Segment Bar Chart */}
                <Card>
                    <CardHeader><CardTitle className="text-lg">Segment Distribution</CardTitle></CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="w-full h-[260px]" /> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={segments} layout="vertical" margin={{ left: 16, right: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="segment" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--card-foreground))", fontSize: "12px", borderRadius: "8px", border: "1px solid hsl(var(--border))" }} itemStyle={{ color: "hsl(var(--card-foreground))" }} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Top Products Table */}
                <Card>
                    <CardHeader><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
                    <CardContent className="px-0">
                        {loading ? (
                            <div className="space-y-2 px-6">
                                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="w-full h-8" />)}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs uppercase tracking-wider pl-6">Product</TableHead>
                                        <TableHead className="text-xs uppercase tracking-wider text-right pr-6">Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.slice(0, 5).map((p) => (
                                        <TableRow key={p.productId}>
                                            <TableCell className="pl-6">
                                                <div>
                                                    <p className="text-sm font-medium truncate max-w-[140px]">{p.productName}</p>
                                                    <p className="text-xs text-muted-foreground">{p.category}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-mono pr-6">{formatCurrency(p.totalRevenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
