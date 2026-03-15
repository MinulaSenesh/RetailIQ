// src/components/charts/DonutChart.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DonutChartProps {
    data: Array<{ name: string; value: number; color: string }>;
    height?: number;
    centerLabel?: string;
}

export default function DonutChart({ data, height = 260, centerLabel }: DonutChartProps) {
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="75%"
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number, name: string) => [
                        `${((value / total) * 100).toFixed(1)}%`,
                        name,
                    ]}
                    contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "hsl(var(--card-foreground))",
                    }}
                    itemStyle={{ color: "hsl(var(--card-foreground))" }}
                />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px" }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
