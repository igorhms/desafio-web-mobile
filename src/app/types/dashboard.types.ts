import { DashboardDataset } from '@domain';

/**
 * Tipos relacionados ao estado do dashboard na aplicação web
 */

export interface DashboardViewState {
  dataset: DashboardDataset | null;
  loading: boolean;
  error?: string | null;
  lastUpdated?: string;
}

