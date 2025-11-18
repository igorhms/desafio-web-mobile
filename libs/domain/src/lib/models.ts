export type DataSourceType = 'open-meteo' | 'exchange-rate' | 'coindesk';

export interface DashboardFilters {
  startDate: string;
  endDate: string;
  dataSource: DataSourceType;
}

export interface DataPoint {
  timestamp: string;
  value: number;
  category?: string;
}

export interface DatasetMeta extends Record<string, string | number | boolean | undefined> {
  fromCache?: boolean;
  updatedAt?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface DashboardDataset {
  source: DataSourceType;
  title: string;
  unit: string;
  points: DataPoint[];
  meta?: DatasetMeta;
}

export interface Kpi {
  id: 'average' | 'max' | 'min' | 'variation';
  label: string;
  value: number;
  suffix?: string;
  helperText?: string;
  trend?: 'up' | 'down' | 'flat';
}


