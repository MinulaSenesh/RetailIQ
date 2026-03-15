// src/components/dashboard/KPICard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import SparklineChart from "@/components/charts/SparklineChart";
import { formatCurrency, formatNumber, formatPercent, getTrendIcon } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: number;
    format?: "currency" | "number";
    growthPercent: number;
    sparklineData: Array<{ value: number }>;
    icon: React.ReactNode;
    loading?: boolean;
}

export default function KPICard({ title, value, format = "number", growthPercent, sparklineData, icon, loading }: KPICardProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-full" />
                </CardContent>
            </Card>
        );
    }

    const trend = getTrendIcon(growthPercent);
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-blue-500";
    const sparkColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#3b82f6";
    const displayValue = format === "currency" ? formatCurrency(value) : formatNumber(value);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="text-3xl font-bold tabular-nums">{displayValue}</div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="secondary"
                        className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-0.5", trendColor)}
                    >
                        <TrendIcon className="w-3 h-3" />
                        {formatPercent(growthPercent)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">vs prev period</span>
                </div>
                <SparklineChart data={sparklineData} color={sparkColor} height={36} />
            </CardContent>
        </Card>
    );
}
