/**
 * Tipos relacionados a KPIs (Key Performance Indicators)
 */

export interface Kpi {
  id: 'average' | 'max' | 'min' | 'variation';
  label: string;
  value: number;
  suffix?: string;
  helperText?: string;
  trend?: 'up' | 'down' | 'flat';
}

