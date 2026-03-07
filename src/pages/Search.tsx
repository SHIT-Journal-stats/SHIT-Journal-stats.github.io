import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

type ReadableMap = Record<string, string>;

interface SearchResult {
  token: string;
  id: string;
  score: number;
}

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Best fuzzy score of a query word against any token word
function bestFuzzyScore(queryWord: string, tokenWords: string[]): number {
  let best = 0;
  for (const tw of tokenWords) {
    // Exact substring
    if (tw.includes(queryWord)) { best = Math.max(best, 100); continue; }
    if (queryWord.includes(tw)) { best = Math.max(best, 80); continue; }
    // Levenshtein-based (allow ~30% edit distance)
    const maxDist = Math.max(1, Math.floor(Math.max(queryWord.length, tw.length) * 0.35));
    const dist = levenshtein(queryWord, tw);
    if (dist <= maxDist) {
      best = Math.max(best, (1 - dist / Math.max(queryWord.length, tw.length)) * 70);
    }
  }
  return best;
}

function scoreMatch(token: string, queryWords: string[]): number {
  const lower = token.toLowerCase();
  const tokenWords = lower.split(/\s+/);
  const joined = queryWords.join(" ");

  // Exact match
  if (lower === joined) return 10000;

  // Ordered substring match
  if (lower.includes(joined)) return 5000;

  // Per-word fuzzy matching
  let totalScore = 0;
  let matchedCount = 0;
  for (const qw of queryWords) {
    const ws = bestFuzzyScore(qw, tokenWords);
    if (ws > 0) {
      totalScore += ws;
      matchedCount++;
    }
  }

  if (matchedCount === 0) return 0;

  // Bonus for matching all query words
  if (matchedCount === queryWords.length) totalScore += 200;
  // Scale by coverage
  totalScore *= matchedCount / queryWords.length;

  return totalScore;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [readableMap, setReadableMap] = useState<ReadableMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("./src/readable.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load readable.json");
        return r.json() as Promise<ReadableMap>;
      })
      .then(setReadableMap)
      .catch(() => setReadableMap({}))
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (!readableMap || !query.trim()) return [];
    const queryWords = query.trim().toLowerCase().split(/\s+/);

    const scored: SearchResult[] = [];
    for (const [token, id] of Object.entries(readableMap)) {
      const s = scoreMatch(token, queryWords);
      if (s > 0) scored.push({ token, id, score: s });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [readableMap, query]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            ← Home
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Search Preprints</h1>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by title, author, institution, discipline…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground text-center">Loading index…</p>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No papers match "{query.trim()}"
          </p>
        )}

        {!loading && !query.trim() && readableMap && (
          <p className="text-sm text-muted-foreground text-center">
            {Object.keys(readableMap).length} papers indexed. Start typing to search.
          </p>
        )}

        <div className="space-y-2">
          {results.map(({ token, id }) => {
            const parts = token.split(/\s+/);
            const title = parts.slice(0, 6).join(" ");
            const tags = parts.slice(6);

            return (
              <Card
                key={id}
                className="cursor-pointer transition-colors hover:bg-accent/50"
                onClick={() => navigate(`/${id}`)}
              >
                <CardContent className="flex flex-col gap-1 py-3 px-4">
                  <span className="font-medium text-foreground">{title || token}</span>
                  <span className="text-xs text-muted-foreground font-mono truncate">
                    {id}
                  </span>
                  {/*
                    tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    )*/
                  }
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
