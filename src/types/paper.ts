export interface PaperMeta {
  manuscript_title: string;
  [key: string]: unknown;
}

export interface DataPoint {
  ts: number;
  score_weighted: number;
  score: number;
  rated_count: number;
  [key: string]: number;
}

export interface PaperData {
  meta: PaperMeta;
  timeseries: DataPoint[];
}
