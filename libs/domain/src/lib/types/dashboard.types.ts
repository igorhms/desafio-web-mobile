import { DataSourceType } from './data-source.types';
import { DataPoint } from './data-point.types';
import { DatasetMeta } from './dataset-meta.types';

/**
 * Tipos relacionados ao dashboard
 */

export interface DashboardFilters {
  startDate: string;
  endDate: string;
  dataSource: DataSourceType;
}

export interface DashboardDataset {
  source: DataSourceType;
  title: string;
  unit: string;
  points: DataPoint[];
  meta?: DatasetMeta;
}

