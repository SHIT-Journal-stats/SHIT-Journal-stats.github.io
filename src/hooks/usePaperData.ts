import { useState, useEffect } from "react";
import type { PaperData } from "@/types/paper";

interface UsePaperDataResult {
  data: PaperData | null;
  loading: boolean;
  error: string | null;
}

export function usePaperData(paperId: string | undefined): UsePaperDataResult {
  const [data, setData] = useState<PaperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paperId) {
      setError("No paper ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/data/${paperId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Paper "${paperId}" not found (${res.status})`);
        return res.json();
      })
      .then((json: PaperData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [paperId]);

  return { data, loading, error };
}
