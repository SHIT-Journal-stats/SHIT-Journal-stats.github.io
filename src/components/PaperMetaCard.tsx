import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PaperMeta } from "@/types/paper";

interface PaperMetaCardProps {
  meta: PaperMeta;
}

export function PaperMetaCard({ meta }: PaperMetaCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl leading-tight">{meta.title}</CardTitle>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {meta.authors.map((author) => (
            <Badge key={author} variant="secondary" className="text-xs font-normal">
              {author}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
          <span>
            <strong className="text-foreground">Journal:</strong> {meta.journal}
          </span>
          <span>
            <strong className="text-foreground">Published:</strong> {meta.published_date}
          </span>
          <span>
            <strong className="text-foreground">DOI:</strong>{" "}
            <a
              href={`https://doi.org/${meta.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              {meta.doi}
            </a>
          </span>
        </div>
        <p className="text-muted-foreground leading-relaxed">{meta.abstract}</p>
      </CardContent>
    </Card>
  );
}
