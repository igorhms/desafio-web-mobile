import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import dayjs from 'dayjs';
import { DashboardDataset, DashboardFilters, DataPoint, DataSourceType } from '@domain';
import { calculateKpis } from '@domain';
import { OpenMeteoResponse } from '../../types';


@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private readonly http = inject(HttpClient);

  loadDataset(filters: DashboardFilters): Observable<DashboardDataset> {
    const normalized = this.normalizeDates(filters);
    return this.fetchOpenMeteo(normalized);
  }

  calculateKpis(points: DataPoint[]) {
    return calculateKpis(points);
  }

  private fetchOpenMeteo(filters: DashboardFilters): Observable<DashboardDataset> {
    const params = new HttpParams()
      .set('latitude', '-23.55')
      .set('longitude', '-46.63')
      .set('start_date', filters.startDate)
      .set('end_date', filters.endDate)
      .set('hourly', 'temperature_2m')
      .set('timezone', 'auto');

    return this.http
      .get<OpenMeteoResponse>('https://archive-api.open-meteo.com/v1/archive', { params })
      .pipe(
        map((response) => {
          const times = response.hourly?.time ?? [];
          const values = response.hourly?.temperature_2m ?? [];
          const points = times.map((timestamp, index) => ({
            timestamp,
            value: values[index]
          }));

          return this.buildDataset('open-meteo', 'Temperatura - São Paulo', '°C', points);
        }),
        catchError(() =>
          throwError(() => new Error('Não foi possível carregar dados do Open-Meteo.'))
        )
      );
  }

  private normalizeDates(filters: DashboardFilters): DashboardFilters {
    const start = dayjs(filters.startDate);
    const end = dayjs(filters.endDate);

    if (start.isAfter(end)) {
      return this.normalizeDates({
        ...filters,
        startDate: end.subtract(7, 'day').format('YYYY-MM-DD')
      });
    }

    return {
      ...filters,
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    };
  }

  private buildDataset(
    source: DataSourceType,
    title: string,
    unit: string,
    points: DataPoint[]
  ): DashboardDataset {
    return {
      source,
      title,
      unit,
      points: points
        .filter((point) => Number.isFinite(point.value))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    };
  }
}


