// src/pages/AnalyticsPage.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AreaTrendChart from "@/components/charts/AreaTrendChart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency, formatNumber, getSegmentChartColor } from "@/lib/formatters";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/shared/DateRangePicker";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    ComposedChart, Area, Line, ScatterChart, Scatter, ZAxis, Legend, Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useEffect } from "react";
import type { ForecastData } from "@/types";

export default function AnalyticsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 90)),
        to: new Date()
    });

    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : startDate;

    const { salesTrend, segments, topProducts, loading } = useAnalytics({ startDate, endDate, period: "day" });

    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [use90days, setUse90days] = useState(false);

    useEffect(() => {
        setForecastLoading(true);
        api.get("/analytics/forecast", { params: { days: use90days ? 90 : 30 } })
            .then(r => setForecast(r.data.data))
            .catch(() => setForecast(null))
            .finally(() => setForecastLoading(false));
    }, [use90days]);

    const scatterData = topProducts.map(p => ({
        x: p.totalRevenue, y: p.marginPercent, z: p.unitsSold, name: p.productName,
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground text-sm mt-1">Deep-dive into sales, customers, products, and forecasting</p>
                </div>
                <div className="flex items-center space-x-2">
                    <DatePickerWithRange date={date} setDate={setDate} />
                </div>
            </div>

            <Tabs defaultValue="sales">
                <TabsList className="mb-4">
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="forecast">Forecast</TabsTrigger>
                </TabsList>

                {/* TAB 1 — SALES */}
                <TabsContent value="sales" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Revenue Trend (90 Days)</CardTitle></CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-[300px] w-full" /> : <AreaTrendChart data={salesTrend.map(d => ({ period: d.period, revenue: d.revenue }))} height={300} />}
                        </CardContent>
                    </Card>
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Order Volume</CardTitle></CardHeader>
                            <CardContent>
                                {loading ? <Skeleton className="h-[220px] w-full" /> : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={salesTrend.slice(-30)} margin={{ left: 0, right: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                            <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--card-foreground))", border: "1px solid hsl(var(--border))", fontSize: "12px", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--card-foreground))" }} />
                                            <Bar dataKey="orderCount" name="Orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Customer Segments</CardTitle></CardHeader>
                            <CardContent>
                                {loading ? <Skeleton className="h-[220px] w-full" /> : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={segments} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                                            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <YAxis type="category" dataKey="segment" tick={{ fontSize: 11 }} tickLine={false} width={100} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--card-foreground))", border: "1px solid hsl(var(--border))", fontSize: "12px", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--card-foreground))" }} />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 2 — CUSTOMERS */}
                <TabsContent value="customers" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Segment Distribution</CardTitle></CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-[280px] w-full" /> : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={segments} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis dataKey="segment" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--card-foreground))", border: "1px solid hsl(var(--border))", fontSize: "12px", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--card-foreground))" }} formatter={(v: number) => [`${v} customers`, "Count"]} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {segments.map((s, i) => (
                                                <Cell key={i} fill={getSegmentChartColor(s.segment)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Segment Summary</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Segment</TableHead>
                                        <TableHead className="text-right">Customers</TableHead>
                                        <TableHead className="text-right">Share</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {segments.map(s => (
                                        <TableRow key={s.segment}>
                                            <TableCell>
                                                <Badge style={{ backgroundColor: getSegmentChartColor(s.segment) + "20", color: getSegmentChartColor(s.segment), borderColor: getSegmentChartColor(s.segment) + "40" }} variant="outline">
                                                    {s.segment}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatNumber(s.count)}</TableCell>
                                            <TableCell className="text-right">{s.percentage.toFixed(1)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 3 — PRODUCTS */}
                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Revenue vs Margin</CardTitle></CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-[280px] w-full" /> : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis dataKey="x" name="Revenue" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "Revenue (LKR)", position: "insideBottom", offset: -4, fontSize: 11 }} />
                                        <YAxis dataKey="y" name="Margin %" unit="%" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <ZAxis dataKey="z" range={[40, 200]} name="Units Sold" />
                                        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--card-foreground))", border: "1px solid hsl(var(--border))", fontSize: "12px", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--card-foreground))" }} formatter={(v: number, name: string) => [name === "Revenue" ? formatCurrency(v) : `${v.toFixed(1)}%`, name]} />
                                        <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.7} />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Product Performance</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Units</TableHead>
                                        <TableHead className="text-right">Margin</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.map(p => (
                                        <TableRow key={p.productId}>
                                            <TableCell className="font-medium">{p.productName}</TableCell>
                                            <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                                            <TableCell className="text-right font-mono text-sm">{formatCurrency(p.totalRevenue)}</TableCell>
                                            <TableCell className="text-right">{formatNumber(p.unitsSold)}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={p.marginPercent > 30 ? "text-emerald-600" : p.marginPercent > 15 ? "text-amber-600" : "text-red-500"}>
                                                    {p.marginPercent.toFixed(1)}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 4 — FORECAST */}
                <TabsContent value="forecast" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Sales Forecast</CardTitle>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="forecast-toggle" className="text-sm">30 days</Label>
                                <Switch id="forecast-toggle" checked={use90days} onCheckedChange={setUse90days} />
                                <Label htmlFor="forecast-toggle" className="text-sm">90 days</Label>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {forecastLoading ? <Skeleton className="h-[300px] w-full" /> : forecast && forecast.predictions && forecast.predictions.length > 0 ? (
                                <>
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {forecast.mae !== undefined && <Badge variant="outline">MAE: {formatCurrency(forecast.mae)}</Badge>}
                                        {forecast.rmse !== undefined && <Badge variant="outline">RMSE: {formatCurrency(forecast.rmse)}</Badge>}
                                        {forecast.r2 !== undefined && <Badge variant={forecast.r2 > 0.7 ? "default" : "secondary"}>R²: {forecast.r2.toFixed(3)}</Badge>}
                                        <Badge variant="secondary">Model: RandomForest</Badge>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={forecast.predictions} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(forecast.predictions.length / 6)} />
                                            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--card-foreground))", border: "1px solid hsl(var(--border))", fontSize: "12px", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--card-foreground))" }} formatter={(v: number, name: string) => [formatCurrency(v), name]} />
                                            <Legend />
                                            <Area dataKey="upper_bound" fill="#3b82f620" stroke="transparent" name="Upper Bound" legendType="none" />
                                            <Area dataKey="lower_bound" fill="#ffffff" stroke="transparent" name="Confidence Band" />
                                            <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} dot={false} name="Forecast" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-sm">Insufficient data for forecasting (min 30 days required) or analytics service offline</p>
                            )}
                        </CardContent>

                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
