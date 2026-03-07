import { useMemo, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { DataPoint } from "@/types/paper";

interface MetricConfig {
  key: string;
  title: string;
  color: string;
}

interface UnifiedChartProps {
  data: DataPoint[];
  metrics: MetricConfig[];
}

function formatTs(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/** Cubic spline interpolation – returns a function that evaluates the spline */
function cubicSpline(points: { x: number; y: number }[]): (x: number) => number {
  const n = points.length;
  if (n === 0) return () => 0;
  if (n === 1) return () => points[0].y;
  if (n === 2) {
    const slope = (points[1].y - points[0].y) / (points[1].x - points[0].x);
    return (x: number) => points[0].y + slope * (x - points[0].x);
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  // Build tridiagonal system for natural cubic spline
  const h: number[] = [];
  for (let i = 0; i < n - 1; i++) h.push(xs[i + 1] - xs[i]);

  const alpha: number[] = [0];
  for (let i = 1; i < n - 1; i++) {
    alpha.push((3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1]));
  }

  const l = new Array(n).fill(1);
  const mu = new Array(n).fill(0);
  const z = new Array(n).fill(0);

  for (let i = 1; i < n - 1; i++) {
    l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  const c = new Array(n).fill(0);
  const b = new Array(n).fill(0);
  const d = new Array(n).fill(0);

  for (let j = n - 2; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (ys[j + 1] - ys[j]) / h[j] - (h[j] * (c[j + 1] + 2 * c[j])) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  return (x: number) => {
    // Find the right interval
    let i = n - 2;
    for (let k = 0; k < n - 1; k++) {
      if (x <= xs[k + 1]) { i = k; break; }
    }
    const dx = x - xs[i];
    return ys[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
  };
}

export function UnifiedChart({ data, metrics }: UnifiedChartProps) {
  // Visibility state: each metric has dots + curve toggles
  const [visibility, setVisibility] = useState<Record<string, { dots: boolean; curve: boolean }>>(() => {
    const init: Record<string, { dots: boolean; curve: boolean }> = {};
    for (const m of metrics) init[m.key] = { dots: true, curve: true };
    return init;
  });

  const toggle = useCallback((key: string, kind: "dots" | "curve") => {
    setVisibility((prev) => ({
      ...prev,
      [key]: { ...prev[key], [kind]: !prev[key][kind] },
    }));
  }, []);

  // Build chart data with spline curves
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Generate spline interpolation sample points
    const SAMPLES = 80;
    const tsMin = data[0].ts;
    const tsMax = data[data.length - 1].ts;
    const step = (tsMax - tsMin) / (SAMPLES - 1);
    const sampleTs = Array.from({ length: SAMPLES }, (_, i) => tsMin + i * step);

    // Build spline for each metric
    const splines: Record<string, (x: number) => number> = {};
    for (const m of metrics) {
      const pts = data
        .map((d) => ({ x: d.ts, y: d[m.key] as number }))
        .filter((p) => p.y !== undefined && p.y !== null);
      splines[m.key] = cubicSpline(pts);
    }

    // Create sample rows for spline curves
    const splineRows = sampleTs.map((ts) => {
      const row: Record<string, number | null> = { ts };
      for (const m of metrics) {
        row[`${m.key}_curve`] = splines[m.key](ts);
        row[m.key] = null; // no dot at interpolated points
      }
      return row;
    });

    // Create data-point rows for scatter dots
    const dataRows = data.map((d) => {
      const row: Record<string, number | null> = { ts: d.ts };
      for (const m of metrics) {
        row[m.key] = d[m.key] as number;
        row[`${m.key}_curve`] = null; // no curve at data points (handled by spline rows)
      }
      return row;
    });

    // Merge and sort by ts
    return [...splineRows, ...dataRows].sort((a, b) => (a.ts as number) - (b.ts as number));
  }, [data, metrics]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Metrics Over Time</CardTitle>
        <div className="flex flex-wrap gap-4 pt-2">
          {metrics.map((m) => (
            <div key={m.key} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="text-sm font-medium">{m.title}</span>
              <div className="flex items-center gap-1">
                <Checkbox
                  id={`${m.key}-dots`}
                  checked={visibility[m.key]?.dots}
                  onCheckedChange={() => toggle(m.key, "dots")}
                />
                <Label htmlFor={`${m.key}-dots`} className="text-xs text-muted-foreground cursor-pointer">Dots</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id={`${m.key}-curve`}
                  checked={visibility[m.key]?.curve}
                  onCheckedChange={() => toggle(m.key, "curve")}
                />
                <Label htmlFor={`${m.key}-curve`} className="text-xs text-muted-foreground cursor-pointer">Curve</Label>
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: 12 }}
              />
              {metrics.map((m) => (
                visibility[m.key]?.dots && (
                  <Scatter
                    key={`${m.key}-dots`}
                    dataKey={m.key}
                    fill={m.color}
                    name={`${m.title}`}
                    r={3}
                  />
                )
              ))}
              {metrics.map((m) => (
                visibility[m.key]?.curve && (
                  <Line
                    key={`${m.key}-curve`}
                    dataKey={`${m.key}_curve`}
                    stroke={m.color}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    name={`${m.title} (fit)`}
                  />
                )
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
