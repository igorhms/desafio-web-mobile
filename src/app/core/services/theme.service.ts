import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'dashboard-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = typeof window !== 'undefined';
  private readonly mediaQuery = this.isBrowser
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
  private readonly themeSignal = signal<Theme>(this.getStoredTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    effect(() => {
      this.applyTheme(this.themeSignal());
    });

    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', () => {
        if (!this.isBrowser) {
          return;
        }
        if (!localStorage.getItem(STORAGE_KEY)) {
          this.themeSignal.set(this.mediaQuery?.matches ? 'dark' : 'light');
        }
      });
    }
  }

  toggle(): void {
    const nextTheme: Theme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }

  private applyTheme(theme: Theme): void {
    this.document.documentElement.dataset['theme'] = theme;
  }

  private getStoredTheme(): Theme {
    if (this.isBrowser) {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return this.mediaQuery?.matches ? 'dark' : 'light';
  }
}


