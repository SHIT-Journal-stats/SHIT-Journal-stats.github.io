export interface MetricPoint {
  date: string;
  value: number;
}

export interface PaperMeta {
  title: string;
  authors: string[];
  journal: string;
  published_date: string;
  doi: string;
  abstract: string;
}

export interface PaperMetrics {
  views: MetricPoint[];
  citations: MetricPoint[];
  downloads: MetricPoint[];
  [key: string]: MetricPoint[];
}

export interface PaperData {
  meta: PaperMeta;
  metrics: PaperMetrics;
}
