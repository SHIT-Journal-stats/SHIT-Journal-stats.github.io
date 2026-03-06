import { useState, useEffect } from "react";
import type {DataPoint, PaperData, PaperMeta} from "@/types/paper";

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

    Promise.all([
      fetch(`./src/meta/${paperId}.json`).then((res) => {
        if (!res.ok) throw new Error(`Meta for "${paperId}" not found (${res.status})`);
        return res.json() as Promise<PaperMeta>;
      }),
      fetch(`./src/data/${paperId}.json`).then((res) => {
        if (!res.ok) throw new Error(`Data for "${paperId}" not found (${res.status})`);
        return res.json() as Promise<DataPoint[]>;
      }),
    ])
      .then(([meta, timeseries]) => {
        setData({ meta, timeseries });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [paperId]);

  return { data, loading, error };
}
