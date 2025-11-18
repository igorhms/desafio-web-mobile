import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import {
  DashboardDataset,
  buildDailyAggregation
} from '@domain';

const isBrowser = typeof window !== 'undefined';

const color = (token: string, fallback: string) =>
  isBrowser
    ? getComputedStyle(document.documentElement).getPropertyValue(token)?.trim() || fallback
    : fallback;

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
    grid: { left: 20, right: 8, top: 30, bottom: 12, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLabel: { color: color('--ion-color-medium', '#94a3b8') }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: `{value} ${dataset.unit}`,
        color: color('--ion-color-medium', '#94a3b8')
      },
      splitLine: { lineStyle: { color: color('--ion-color-light', '#e2e8f0') } }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: color('--ion-color-primary', '#7c3aed'), width: 3 },
        areaStyle: {
          color: 'rgba(124,58,237,0.15)'
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
    grid: { left: 20, right: 8, top: 30, bottom: 12, containLabel: true },
    xAxis: {
      type: 'category',
      data: aggregation.labels,
      axisLabel: { color: color('--ion-color-medium', '#94a3b8') }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: `{value} ${dataset.unit}`,
        color: color('--ion-color-medium', '#94a3b8')
      },
      splitLine: { lineStyle: { color: color('--ion-color-light', '#e2e8f0') } }
    },
    series: [
      {
        type: 'bar',
        data: aggregation.values,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: color('--ion-color-primary', '#7c3aed')
        }
      }
    ]
  };
};



