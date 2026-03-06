import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaperMeta } from "@/types/paper";

const LABEL_MAP: Record<string, string> = {
  manuscript_title: "Title",
  author_name: "Author",
  institution: "Institution",
  discipline: "Discipline",
  status: "Status",
  viscosity: "Viscosity",
  zone: "Zone",
  created_at: "Created",
  screened_at: "Screened",
  promoted_to_septic_at: "Promoted to Septic",
  promoted_to_stone_at: "Promoted to Stone",
  co_authors: "Co-authors",
  special_issue: "Special Issue",
  solicited_topic: "Solicited Topic",
  social_media: "Social Media",
  comment_count: "Comments",
  unique_commenters: "Unique Commenters",
  latrine_recency: "Latrine Recency",
};

const HIDDEN_KEYS = new Set([
  "user_id",
  "screened_by",
  "screening_notes",
  "hidden",
  "hidden_by",
  "hidden_at",
  "discipline_user_edited",
  "latrine_sort_key",
]);

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length === 0 ? "—" : value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleString();
  }
  return String(value);
}

interface PaperMetaCardProps {
  meta: PaperMeta;
}

export function PaperMetaCard({ meta }: PaperMetaCardProps) {
  const title = meta.manuscript_title ?? "Untitled";
  const entries = Object.entries(meta).filter(
    ([key]) => key !== "manuscript_title" && !HIDDEN_KEYS.has(key)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm">
          {entries.map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <dt className="font-medium text-foreground shrink-0">
                {LABEL_MAP[key] ?? key}:
              </dt>
              <dd className="text-muted-foreground break-all">
                {formatValue(value)}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
