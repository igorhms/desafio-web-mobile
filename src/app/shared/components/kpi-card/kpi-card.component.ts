import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Kpi } from '@domain';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent {
  @Input({ required: true }) kpi!: Kpi;
  @Input() unit = '';

  protected formatValue(): string {
    if (!this.kpi) {
      return '';
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    });

    return formatter.format(this.kpi.value);
  }
}


