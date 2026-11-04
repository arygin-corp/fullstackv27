import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RoadmapService, RoadmapMonth, RoadmapEvent } from '../../@shared/services/roadmap.service';

declare let bootstrap: any;

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

  private destroy$ = new Subject<void>();

  constructor(public roadmapService: RoadmapService) {
    this.currentYear$ = this.roadmapService.currentYear$;
    const start = 2018;
    const now = new Date().getFullYear();
    for (let y = start; y <= now + 1; y++) this.fiscalYears.push(y);
  }

  ngOnInit(): void {
    this.roadmapService.setFiscalStartYear(this.selectedFiscalYear);

    this.roadmapService.currentYear$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
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

  getMonthDateDisplay(month: RoadmapMonth): string {
    const currentYear = this.roadmapService.getCurrentYearValue();
    if (!currentYear) return '';
    const fiscalStartYear = currentYear.startDate.getFullYear();
    const fiscalStartMonth = 3; // April (0-based)
    const actualYear = month.monthIndex >= fiscalStartMonth ? fiscalStartYear : fiscalStartYear + 1;
    return `${month.monthName} ${actualYear}`;
  }

  onEditEvent(month: RoadmapMonth): void {
    this.editingMonth = month;
    this.editingEvent = { title: month.event?.title || '', description: month.event?.description || '' };
    const modal = new bootstrap.Modal(document.getElementById('editEventModal'));
    modal.show();
  }

  saveEvent(): void {
    if (this.editingMonth) {
      this.roadmapService.updateMonthEvent(this.editingMonth.monthIndex, this.editingEvent);
      const modal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
      modal.hide();
      this.editingMonth = null;
      this.editingEvent = { title: '', description: '' };
    }
  }

  trackByMonth(index: number, month: RoadmapMonth): number {
    return month.monthIndex;
  }

  trackByQuarter(index: number, quarter: any): number {
    return quarter.quarterNumber;
  }
}