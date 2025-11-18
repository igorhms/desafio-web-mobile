import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import { DashboardDataset, buildDailyAggregation } from '@domain';

const isBrowser = typeof window !== 'undefined';

const getColor = (token: string, fallback: string) => {
  if (!isBrowser) {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(token);
  return value?.trim() || fallback;
};

const round = (value: number, digits = 2) => {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
};

export const buildTimeseriesChart = (dataset: DashboardDataset): EChartsOption => {
  const labels = dataset.points.map((point) =>
    dayjs(point.timestamp).format(dataset.source === 'open-meteo' ? 'DD/MM HH:mm' : 'DD/MM')
  );

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 24, right: 16, top: 40, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLabel: { color: getColor('--text-muted', '#94a3b8') }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: `{value} ${dataset.unit}`, color: getColor('--text-muted', '#94a3b8') },
      splitLine: { lineStyle: { color: getColor('--border', '#e2e8f0') } }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: getColor('--accent', '#6366f1') },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99,102,241,0.35)' },
              { offset: 1, color: 'rgba(99,102,241,0.05)' }
            ]
          }
        },
        data: dataset.points.map((point) => round(point.value))
      }
    ]
  };
};

export const buildAggregationChart = (dataset: DashboardDataset): EChartsOption => {
  const aggregation = buildDailyAggregation(dataset.points);

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 24, right: 16, top: 32, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: aggregation.labels,
      axisLabel: { color: getColor('--text-muted', '#94a3b8') }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: `{value} ${dataset.unit}`, color: getColor('--text-muted', '#94a3b8') },
      splitLine: { lineStyle: { color: getColor('--border', '#e2e8f0') } }
    },
    series: [
      {
        type: 'bar',
        data: aggregation.values,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: getColor('--accent', '#6366f1')
        }
      }
    ]
  };
};



