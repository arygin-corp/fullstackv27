import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MaintenanceStatus {
  active: boolean;
  tone: string;
  label: string;
  endsAt: number;
  headline: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  active = false;
  status: MaintenanceStatus | null = null;
  private timer = 0;

  constructor(private http: HttpClient, private router: Router) {}

  check(): Observable<MaintenanceStatus> {
    if (this.isPreview()) {
      const status = this.previewStatus();
      this.apply(status);
      return of(status);
    }
    return this.http.get<MaintenanceStatus>(`${environment.apiUrl}/api/maintenance/`).pipe(
      tap((status) => this.apply(status))
    );
  }

  watch(): void {
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => {
      this.check().subscribe({ error: () => undefined });
    }, 3000);
  }

  refresh(): void {
    this.check().subscribe({ error: () => undefined });
  }

  private isPreview(): boolean {
    return new URLSearchParams(window.location.search).get('preview') === '1';
  }

  private previewStatus(): MaintenanceStatus {
    const tone = new URLSearchParams(window.location.search).get('tone') || 'deploy';
    const labels: Record<string, string> = {
      deploy: 'Deploying 26.11.20',
      quick: 'Quick Fix',
      low: 'Low Complexity',
      medium: 'Medium Complexity',
      high: 'High Complexity'
    };
    const hours: Record<string, number> = { deploy: 1, quick: 1, low: 2, medium: 3, high: 5 };
    return {
      active: true,
      tone,
      label: labels[tone] || labels.deploy,
      endsAt: Date.now() + (hours[tone] || 1) * 60 * 60 * 1000,
      headline: "We'll be back.",
      message: 'The website is down for maintenance. Check back later.'
    };
  }

  private apply(status: MaintenanceStatus): void {
    this.status = status;
    this.active = !!status.active;
    const onPage = this.router.url.split('?')[0] === '/maintenance';
    if (this.active && !onPage) {
      this.router.navigateByUrl('/maintenance');
    } else if (!this.active && onPage) {
      this.router.navigateByUrl('/');
    }
  }
}
