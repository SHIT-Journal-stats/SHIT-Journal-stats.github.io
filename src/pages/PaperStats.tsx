import { useParams } from "react-router-dom";
import { usePaperData } from "@/hooks/usePaperData";
import { PaperMetaCard } from "@/components/PaperMetaCard";
import { UnifiedChart } from "@/components/UnifiedChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const METRIC_CONFIG: { key: string; title: string; color: string }[] = [
  { key: "score_weighted", title: "Weighted Score", color: "hsl(221, 83%, 53%)" },
  { key: "score", title: "Score", color: "hsl(142, 71%, 45%)" },
  { key: "rated_count", title: "Rated Count", color: "hsl(262, 83%, 58%)" },
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

      <UnifiedChart data={data.timeseries} metrics={METRIC_CONFIG} />
    </div>
  );
}
