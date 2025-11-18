import { DataPoint, Kpi, AggregatedSeries } from '../types';

const toNumber = (value: number | null | undefined): number => (Number.isFinite(value) ? Number(value) : 0);

export const sortByDate = (points: DataPoint[]): DataPoint[] =>
  [...points].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

const round = (value: number, digits = 2): number => {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
};

export const calculateKpis = (points: DataPoint[]): Kpi[] => {
  if (!points.length) {
    return [
      { id: 'average', label: 'Média', value: 0, trend: 'flat' },
      { id: 'max', label: 'Máximo', value: 0, trend: 'flat' },
      { id: 'min', label: 'Mínimo', value: 0, trend: 'flat' },
      { id: 'variation', label: 'Variação %', value: 0, helperText: 'Sem dados', trend: 'flat' }
    ];
  }

  const sorted = sortByDate(points);
  const values = sorted.map((point) => point.value);
  const total = values.reduce((acc, value) => acc + value, 0);
  const average = total / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const first = sorted.at(0)?.value ?? 0;
  const last = sorted.at(-1)?.value ?? 0;
  const variation = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100;

  const trend: Kpi['trend'] =
    variation > 0.5 ? 'up' : variation < -0.5 ? 'down' : 'flat';

  return [
    { id: 'average', label: 'Média', value: round(average, 2), trend },
    { id: 'max', label: 'Máximo', value: round(max, 2), trend },
    { id: 'min', label: 'Mínimo', value: round(min, 2), trend },
    {
      id: 'variation',
      label: 'Variação %',
      value: round(variation, 2),
      helperText: `${round(last, 2)} → ${round(first, 2)}`,
      trend
    }
  ];
};

// Re-exporta AggregatedSeries para compatibilidade
export type { AggregatedSeries };

const formatDay = (date: Date): string =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export const buildDailyAggregation = (points: DataPoint[]): AggregatedSeries => {
  const buckets = new Map<string, number[]>();

  points.forEach((point) => {
    const label = formatDay(new Date(point.timestamp));
    const next = buckets.get(label) ?? [];
    next.push(point.value);
    buckets.set(label, next);
  });

  const labels: string[] = [];
  const values: number[] = [];

  buckets.forEach((bucket, label) => {
    labels.push(label);
    const avg = bucket.reduce((acc, value) => acc + value, 0) / bucket.length;
    values.push(round(avg, 2));
  });

  return { labels, values };
};

const dayOfWeek = (date: Date): string =>
  date.toLocaleDateString('pt-BR', { weekday: 'short' });

export const buildDistribution = (points: DataPoint[]): AggregatedSeries => {
  const buckets = new Map<string, number>();

  points.forEach((point) => {
    const label = dayOfWeek(new Date(point.timestamp));
    const next = toNumber(buckets.get(label));
    buckets.set(label, round(next + point.value));
  });

  const labels: string[] = [];
  const values: number[] = [];

  buckets.forEach((value, label) => {
    labels.push(label);
    values.push(round(value, 2));
  });

  return { labels, values };
};


