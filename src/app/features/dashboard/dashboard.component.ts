import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import {
  MatButtonModule
} from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardDataService } from '../../core/services/dashboard-data.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { DashboardDataset, Kpi } from '@domain';
import { DashboardViewState } from '../../types';
import { buildAggregationChart, buildTimeseriesChart } from './utils/chart-options.builder';
import dayjs from 'dayjs';

const DEFAULT_RANGE_DAYS = 7;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    ThemeToggleComponent,
    KpiCardComponent,
    ChartCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly dashboardDataService = inject(DashboardDataService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly filtersForm = this.fb.nonNullable.group({
    startDate: [this.buildInitialStart(), Validators.required],
    endDate: [dayjs().toDate(), Validators.required]
  });

  protected readonly state = signal<DashboardViewState>({
    dataset: null,
    loading: false,
    error: null
  });

  protected readonly hasData = computed(() => !!this.state().dataset);

  protected readonly kpis = computed<Kpi[]>(() => {
    const dataset = this.state().dataset;
    return dataset ? this.dashboardDataService.calculateKpis(dataset.points) : [];
  });

  protected readonly lineChartOptions = computed(() => {
    const dataset = this.state().dataset;
    return dataset ? buildTimeseriesChart(dataset) : null;
  });

  protected readonly barChartOptions = computed(() => {
    const dataset = this.state().dataset;
    return dataset ? buildAggregationChart(dataset) : null;
  });


  constructor() {
    this.filtersForm.valueChanges.pipe(skip(1), takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (this.filtersForm.invalid) {
        return;
      }

      const startDate = value.startDate ?? this.buildInitialStart();
      const endDate = value.endDate ?? dayjs().toDate();

      if (dayjs(startDate).isAfter(endDate)) {
        this.filtersForm.controls.startDate.setErrors({ range: true });
        return;
      } else if (this.filtersForm.controls.startDate.hasError('range')) {
        this.filtersForm.controls.startDate.setErrors(null);
      }

      this.loadDataset();
    });

    this.loadDataset();
  }

  protected handleRetry(): void {
    this.loadDataset();
  }

  private buildInitialStart(): Date {
    return dayjs().subtract(DEFAULT_RANGE_DAYS, 'day').toDate();
  }

  private loadDataset(): void {
    if (this.filtersForm.invalid) {
      return;
    }

    const { startDate, endDate } = this.filtersForm.getRawValue();

    if (!startDate || !endDate) {
      return;
    }

    this.state.update((current) => ({ ...current, loading: true, error: null }));

    this.dashboardDataService
      .loadDataset({
        dataSource: 'open-meteo',
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD')
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dataset) => {
          this.state.set({
            dataset,
            loading: false,
            error: null,
            lastUpdated: new Date().toISOString()
          });
        },
        error: (error: Error) => {
          this.state.set({
            dataset: null,
            loading: false,
            error: error.message
          });
        }
      });
  }
}


