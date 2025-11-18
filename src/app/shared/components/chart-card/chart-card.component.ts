import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgxEchartsDirective],
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartCardComponent {
  @Input({ required: true }) options!: EChartsOption;
  @Input() title = '';
  @Input() subtitle = '';
}


