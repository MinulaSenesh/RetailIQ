// src/components/charts/AreaTrendChart.tsx
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface AreaTrendChartProps {
    data: Array<{ period: string; revenue: number; orderCount?: number }>;
    height?: number;
}

export default function AreaTrendChart({ data, height = 280 }: AreaTrendChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    interval="preserveStartEnd"
                />
                <YAxis
                    tickFormatter={(v) => `LKR ${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                />
                <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "hsl(var(--card-foreground))",
                    }}
                    itemStyle={{ color: "hsl(var(--card-foreground))" }}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#revGradient)"
                    dot={false}
                    activeDot={{ r: 4 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
