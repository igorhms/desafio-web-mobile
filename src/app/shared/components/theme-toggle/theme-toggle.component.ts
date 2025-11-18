import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button mat-stroked-button type="button" class="theme-toggle" (click)="handleToggle()"
      [attr.aria-label]="theme() === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'">
      <mat-icon>{{ theme() === 'dark' ? 'dark_mode' : 'light_mode' }}</mat-icon>
      {{ theme() === 'dark' ? 'Escuro' : 'Claro' }}
    </button>
  `,
  styles: [
    `
      .theme-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border-color: var(--border);
        color: var(--text-primary);
      }

      :host-context([data-theme='dark']) .theme-toggle {
        border-color: var(--text-muted);
        color: var(--text-primary);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  protected readonly theme = this.themeService.theme;

  protected handleToggle(): void {
    this.themeService.toggle();
  }
}


