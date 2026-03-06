import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DataPoint } from "@/types/paper";
import { useMemo } from "react";

interface MetricChartProps {
  title: string;
  data: DataPoint[];
  dataKey: string;
  color: string;
}

function formatTs(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/** Simple linear regression returning [slope, intercept] */
function linearRegression(points: { x: number; y: number }[]): [number, number] {
  const n = points.length;
  if (n === 0) return [0, 0];
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
    sxy += p.x * p.y;
    sxx += p.x * p.x;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return [0, sy / n];
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return [slope, intercept];
}

export function MetricChart({ title, data, dataKey, color }: MetricChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ts: d.ts,
      value: d[dataKey] as number,
    }));
  }, [data, dataKey]);

  const trendData = useMemo(() => {
    if (chartData.length < 2) return [];
    const points = chartData.map((d) => ({ x: d.ts, y: d.value }));
    const [slope, intercept] = linearRegression(points);
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    return [
      { ts: first.ts, trend: slope * first.ts + intercept },
      { ts: last.ts, trend: slope * last.ts + intercept },
    ];
  }, [chartData]);

  const allData = useMemo(() => {
    const trendMap = new Map(trendData.map((t) => [t.ts, t.trend]));
    return chartData.map((d) => ({
      ...d,
      trend: trendMap.get(d.ts) ?? null,
    }));
  }, [chartData, trendData]);

  // Merge trend endpoints into allData for composed chart
  const composedData = useMemo(() => {
    if (trendData.length < 2) return chartData.map((d) => ({ ...d, trend: undefined as number | undefined }));
    const [start, end] = trendData;
    return chartData.map((d, i) => ({
      ...d,
      trend: i === 0 ? start.trend : i === chartData.length - 1 ? end.trend : undefined as number | undefined,
    }));
  }, [chartData, trendData]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={composedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="ts"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickFormatter={formatTs}
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
              />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                labelFormatter={(val) => formatTs(val as number)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                }}
              />
              <Scatter
                dataKey="value"
                fill={color}
                name={title}
                r={3}
              />
              <Line
                dataKey="trend"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                connectNulls
                name="Trend"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
