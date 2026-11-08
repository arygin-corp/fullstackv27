import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RoadmapService, RoadmapMonth, RoadmapEvent } from '../../@shared/services/roadmap.service';
import { UserActivityService } from '../../@shared/services/user-activity.service';

@Component({
  selector: 'app-roadmap',
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss']
})
export class RoadmapComponent implements OnInit, OnDestroy {
  currentYear$: Observable<any>;
  editingMonth: RoadmapMonth | null = null;
  editingEvent: RoadmapEvent = { title: '', description: '' };

  fiscalYears: number[] = [];
  selectedFiscalYear = 2018;
  canEditRoadmap = false;
  canAddEvent = false;
  modal: 'view' | 'edit' | 'add' | null = null;
  editingExtraId: string | null = null;
  addingQuarter: { quarterNumber: number; months: RoadmapMonth[] } | null = null;
  addMonthIndex: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    public roadmapService: RoadmapService,
    private http: HttpClient,
    private activity: UserActivityService
  ) {
    this.currentYear$ = this.roadmapService.currentYear$;
    const now = new Date();
    const currentFiscalStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    this.selectedFiscalYear = currentFiscalStart;
    for (let y = 2018; y <= now.getFullYear() + 1; y++) this.fiscalYears.push(y);
  }

  ngOnInit(): void {
    this.roadmapService.setFiscalStartYear(this.selectedFiscalYear);

    this.roadmapService.currentYear$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.loadEditAccess();
  }

  private loadEditAccess(): void {
    this.activity.authorizationHeaders().then((headers) => {
      if (!headers) {
        this.canEditRoadmap = false;
        return;
      }
      this.http.get<{ can_edit_roadmap?: boolean; on_data_marketplace_team?: boolean; employee_type?: string }>(`${environment.apiUrl}/api/profiles/me/`, { headers })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile) => {
            this.canEditRoadmap = !!profile?.can_edit_roadmap;
            this.canAddEvent = !!profile?.on_data_marketplace_team && profile?.employee_type === 'employee';
            if (!this.canEditRoadmap && this.modal === 'edit') {
              this.closeModal();
            }
            if (!this.canAddEvent && this.modal === 'add') {
              this.closeModal();
            }
          },
          error: () => {
            this.canEditRoadmap = false;
            this.canAddEvent = false;
            if (this.modal === 'edit' || this.modal === 'add') {
              this.closeModal();
            }
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFiscalYearChange(year: number): void {
    this.roadmapService.setFiscalStartYear(year);
  }

  getAllMonths(): RoadmapMonth[] {
    const year = this.roadmapService.getCurrentYearValue();
    const months: RoadmapMonth[] = [];
    if (!year || !year.quarters) return months;
    for (const q of year.quarters) {
      for (const m of q.months || []) months.push(m);
    }
    return months;
  }

  quarterSpan(quarter: { months: RoadmapMonth[] }): string {
    const months = quarter?.months || [];
    if (!months.length) {
      return '';
    }
    const first = this.getMonthDateDisplay(months[0]);
    const last = this.getMonthDateDisplay(months[months.length - 1]);
    return `${first} – ${last}`;
  }

  plannedCount(): number {
    return this.getAllMonths().reduce((count, month) => {
      const extra = (month.extraEvents || []).filter(event => !!event.title).length;
      return count + (month.event?.title ? 1 : 0) + extra;
    }, 0);
  }

  isCurrentMonth(month: RoadmapMonth): boolean {
    const now = new Date();
    return month.monthIndex === now.getMonth() && this.getMonthDateDisplay(month).endsWith(String(now.getFullYear()));
  }

  getMonthDateDisplay(month: RoadmapMonth): string {
    const currentYear = this.roadmapService.getCurrentYearValue();
    if (!currentYear) return '';
    const fiscalStartYear = currentYear.startDate.getFullYear();
    const fiscalStartMonth = 3; // April (0-based)
    const actualYear = month.monthIndex >= fiscalStartMonth ? fiscalStartYear : fiscalStartYear + 1;
    return `${month.monthName} ${actualYear}`;
  }

  openView(month: RoadmapMonth, event: RoadmapEvent): void {
    this.editingMonth = month;
    this.editingExtraId = event.id || null;
    this.editingEvent = { title: event.title || '', description: event.description || '' };
    this.modal = 'view';
  }

  onEditEvent(quarter: { quarterNumber: number; months: RoadmapMonth[] }, month: RoadmapMonth, event?: RoadmapEvent): void {
    if (!this.canEditRoadmap) {
      return;
    }
    const source = event || month.event;
    this.addingQuarter = quarter;
    this.addMonthIndex = month.monthIndex;
    this.editingMonth = month;
    this.editingExtraId = source?.id || null;
    this.editingEvent = { title: source?.title || '', description: source?.description || '' };
    this.modal = 'edit';
  }

  openAdd(quarter: { quarterNumber: number; months: RoadmapMonth[] }): void {
    if (!this.canAddEvent) {
      return;
    }
    this.addingQuarter = quarter;
    this.addMonthIndex = quarter.months[0]?.monthIndex ?? null;
    this.editingMonth = null;
    this.editingExtraId = null;
    this.editingEvent = { title: '', description: '' };
    this.modal = 'add';
  }

  closeModal(): void {
    this.modal = null;
    this.editingMonth = null;
    this.editingExtraId = null;
    this.addingQuarter = null;
    this.addMonthIndex = null;
    this.editingEvent = { title: '', description: '' };
  }

  saveEvent(): void {
    if (this.modal === 'add') {
      this.saveAddedEvent();
      return;
    }
    if (!this.canEditRoadmap || !this.editingMonth || this.addMonthIndex === null || !this.editingEvent.title.trim()) {
      return;
    }
    if (this.addMonthIndex !== this.editingMonth.monthIndex) {
      this.roadmapService.moveEvent(this.editingMonth.monthIndex, this.editingExtraId, this.addMonthIndex, this.editingEvent);
    } else if (this.editingExtraId) {
      this.roadmapService.updateExtraEvent(this.editingMonth.monthIndex, this.editingExtraId, this.editingEvent);
    } else {
      this.roadmapService.updateMonthEvent(this.editingMonth.monthIndex, this.editingEvent);
    }
    this.closeModal();
  }

  private saveAddedEvent(): void {
    if (!this.canAddEvent || !this.addingQuarter || this.addMonthIndex === null || !this.editingEvent.title.trim()) {
      return;
    }
    this.roadmapService.addEvent(this.addingQuarter.quarterNumber, this.addMonthIndex, this.editingEvent);
    this.closeModal();
  }

  trackByMonth(index: number, month: RoadmapMonth): number {
    return month.monthIndex;
  }

  trackByQuarter(index: number, quarter: any): number {
    return quarter.quarterNumber;
  }
}