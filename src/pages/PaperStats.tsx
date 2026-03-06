import { useParams } from "react-router-dom";
import { usePaperData } from "@/hooks/usePaperData";
import { PaperMetaCard } from "@/components/PaperMetaCard";
import { MetricChart } from "@/components/MetricChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const METRIC_CONFIG: { key: string; title: string; type: "line" | "bar"; color: string }[] = [
  { key: "views", title: "Monthly Views", type: "line", color: "hsl(221, 83%, 53%)" },
  { key: "citations", title: "Monthly Citations", type: "bar", color: "hsl(142, 71%, 45%)" },
  { key: "downloads", title: "Monthly Downloads", type: "line", color: "hsl(262, 83%, 58%)" },
];

export default function PaperStats() {
  const { paperId } = useParams<{ paperId: string }>();
  const { data, loading, error } = usePaperData(paperId);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error ?? "Unknown error loading paper data."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PaperMetaCard meta={data.meta} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {METRIC_CONFIG.map((cfg) => {
          const metricData = data.metrics[cfg.key];
          if (!metricData) return null;
          return (
            <MetricChart
              key={cfg.key}
              title={cfg.title}
              data={metricData}
              type={cfg.type}
              color={cfg.color}
            />
          );
        })}
      </div>
    </div>
  );
}
