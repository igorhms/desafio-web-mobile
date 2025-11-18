import { DashboardDataset } from '@domain';

/**
 * Tipos relacionados ao estado do dashboard na aplicação mobile
 */

export interface DashboardState {
  dataset: DashboardDataset | null;
  loading: boolean;
  error: string | null;
  cacheMessage: string | null;
}

