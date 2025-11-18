import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Observable, catchError, from, map, of, switchMap, throwError } from 'rxjs';
import dayjs from 'dayjs';
import {
  DashboardDataset,
  DashboardFilters,
  DataPoint,
  DataSourceType,
  calculateKpis
} from '@domain';
import { OpenMeteoResponse } from '../types';


@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private readonly http = inject(HttpClient);

  loadDataset(filters: DashboardFilters): Observable<DashboardDataset> {
    const normalized = this.normalizeDates(filters);

    return this.fetchFromApi(normalized).pipe(
      switchMap((dataset) =>
        from(
          Preferences.set({
            key: this.buildStorageKey(dataset.source),
            value: JSON.stringify(dataset)
          })
        ).pipe(map(() => dataset))
      ),
      catchError((error) =>
        from(this.getCachedDataset(normalized.dataSource)).pipe(
          switchMap((cached) =>
            cached
              ? of({ ...cached, meta: { ...cached.meta, fromCache: true } })
              : throwError(() => error)
          )
        )
      )
    );
  }

  calculateKpis(points: DataPoint[]) {
    return calculateKpis(points);
  }

  private fetchFromApi(filters: DashboardFilters): Observable<DashboardDataset> {
    return this.fetchOpenMeteo(filters);
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

  private async getCachedDataset(source: DataSourceType): Promise<DashboardDataset | null> {
    const cache = await Preferences.get({ key: this.buildStorageKey(source) });
    if (!cache.value) {
      return null;
    }
    try {
      return JSON.parse(cache.value) as DashboardDataset;
    } catch {
      return null;
    }
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
      meta: { updatedAt: new Date().toISOString(), fromCache: false },
      points: points
        .filter((point) => Number.isFinite(point.value))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    };
  }

  private buildStorageKey(source: DataSourceType): string {
    return `dashboard-cache-${source}`;
  }
}


