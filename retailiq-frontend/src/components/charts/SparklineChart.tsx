// src/components/charts/SparklineChart.tsx
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface SparklineChartProps {
    data: Array<{ value: number }>;
    color?: string;
    height?: number;
}

export default function SparklineChart({ data, color = "#3b82f6", height = 36 }: SparklineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                />
                <Tooltip
                    contentStyle={{ display: "none" }}
                    cursor={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
