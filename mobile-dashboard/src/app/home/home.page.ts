import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RefresherCustomEvent } from '@ionic/angular';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import {
  DashboardDataset,
  DashboardFilters,
  Kpi
} from '@domain';
import { DashboardDataService } from '../services/dashboard-data.service';
import {
  buildAggregationChart,
  buildDistributionChart,
  buildTimeseriesChart
} from '../utils/chart-options';

interface DashboardState {
  dataset: DashboardDataset | null;
  loading: boolean;
  error: string | null;
  cacheMessage: string | null;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {
  private readonly fb = inject(FormBuilder);
  private readonly dashboardDataService = inject(DashboardDataService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly filtersForm = this.fb.nonNullable.group({
    startDate: [dayjs().subtract(7, 'day').toISOString(), Validators.required],
    endDate: [dayjs().toISOString(), Validators.required]
  });

  protected isStartDatePickerOpen = false;
  protected isEndDatePickerOpen = false;

  protected readonly state = signal<DashboardState>({
    dataset: null,
    loading: false,
    error: null,
    cacheMessage: null
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

  protected readonly pieChartOptions = computed(() => {
    const dataset = this.state().dataset;
    return dataset ? buildDistributionChart(dataset) : null;
  });

  ionViewWillEnter(): void {
    this.loadDataset();
  }

  protected applyFilters(): void {
    this.loadDataset();
  }

  protected handleRefresh(event: RefresherCustomEvent): void {
    this.loadDataset(event);
  }

  private loadDataset(event?: RefresherCustomEvent): void {
    if (this.filtersForm.invalid) {
      return;
    }

    const filters = this.buildFilters();

    if (!filters) {
      return;
    }

    this.state.update((current) => ({
      ...current,
      loading: true,
      error: null,
      cacheMessage: null
    }));

    this.dashboardDataService
      .loadDataset(filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dataset) => {
          this.state.set({
            dataset,
            loading: false,
            error: null,
            cacheMessage: dataset.meta?.fromCache ? 'Modo offline: exibindo dados em cache' : null
          });
          event?.target.complete();
        },
        error: (error: Error) => {
          this.state.set({
            dataset: null,
            loading: false,
            error: error.message,
            cacheMessage: null
          });
          event?.target.complete();
        }
      });
  }

  protected formatDate(dateValue: string | null | undefined): string {
    if (!dateValue) {
      return '';
    }
    return dayjs(dateValue).locale('pt-br').format('DD/MM/YYYY');
  }

  protected formatDateForPicker(dateValue: string | null | undefined): string {
    if (!dateValue) {
      return '';
    }
    // ion-datetime espera formato ISO string (YYYY-MM-DD)
    return dayjs(dateValue).format('YYYY-MM-DD');
  }

  protected openStartDatePicker(): void {
    this.isStartDatePickerOpen = true;
  }

  protected closeStartDatePicker(event?: any): void {
    this.isStartDatePickerOpen = false;
  }

  protected openEndDatePicker(): void {
    this.isEndDatePickerOpen = true;
  }

  protected closeEndDatePicker(event?: any): void {
    this.isEndDatePickerOpen = false;
  }

  protected onStartDateChange(event: any): void {
    const selectedDate = event.detail.value;
    if (selectedDate) {
      this.filtersForm.patchValue({ startDate: selectedDate });
      // Valida se a data inicial não é maior que a final
      const endDate = this.filtersForm.get('endDate')?.value;
      if (endDate && dayjs(selectedDate).isAfter(endDate)) {
        this.filtersForm.controls.startDate.setErrors({ range: true });
      } else {
        this.filtersForm.controls.startDate.setErrors(null);
      }
    }
    this.closeStartDatePicker();
  }

  protected onEndDateChange(event: any): void {
    const selectedDate = event.detail.value;
    if (selectedDate) {
      this.filtersForm.patchValue({ endDate: selectedDate });
      // Valida se a data final não é menor que a inicial
      const startDate = this.filtersForm.get('startDate')?.value;
      if (startDate && dayjs(selectedDate).isBefore(startDate)) {
        this.filtersForm.controls.endDate.setErrors({ range: true });
      } else {
        this.filtersForm.controls.endDate.setErrors(null);
      }
    }
    this.closeEndDatePicker();
  }

  private buildFilters(): DashboardFilters | null {
    const { startDate, endDate } = this.filtersForm.getRawValue();

    if (!startDate || !endDate) {
      return null;
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (start.isAfter(end)) {
      this.filtersForm.controls.startDate.setErrors({ range: true });
      return null;
    }

    return {
      dataSource: 'open-meteo',
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    };
  }
}

