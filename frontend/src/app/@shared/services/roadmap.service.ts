import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RoadmapEvent {
  id?: string;
  title: string;
  description?: string;
}

export interface RoadmapMonth {
  monthIndex: number;
  monthName: string;
  event?: RoadmapEvent;
  extraEvents?: RoadmapEvent[];
}

export interface RoadmapQuarter {
  quarterNumber: number;
  months: RoadmapMonth[];
}

export interface RoadmapYear {
  startDate: Date;
  quarters: RoadmapQuarter[];
}

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  currentYear$ = new BehaviorSubject<RoadmapYear>(this.buildFiscalYear(new Date(2018, 3, 1)));

  getCurrentYearValue(): RoadmapYear {
    return this.currentYear$.value;
  }

  setFiscalStartYear(year: number): void {
    const startDate = new Date(year, 3, 1); // April 1 of provided year
    this.currentYear$.next(this.buildFiscalYear(startDate));
  }

  updateMonthEvent(monthIndex: number, event: RoadmapEvent): void {
    const year = this.getCurrentYearValue();
    for (const quarter of year.quarters) {
      for (const month of quarter.months) {
        if (month.monthIndex === monthIndex) {
          month.event = { title: event.title, description: event.description };
          this.currentYear$.next({ ...year });
          return;
        }
      }
    }
  }

  updateExtraEvent(monthIndex: number, eventId: string, event: RoadmapEvent): void {
    const year = this.getCurrentYearValue();
    for (const quarter of year.quarters) {
      for (const month of quarter.months) {
        if (month.monthIndex !== monthIndex) {
          continue;
        }
        month.extraEvents = (month.extraEvents || []).map(item => item.id === eventId
          ? { ...item, title: event.title, description: event.description }
          : item);
        this.currentYear$.next({ ...year });
        return;
      }
    }
  }

  moveEvent(fromMonthIndex: number, extraId: string | null, toMonthIndex: number, event: RoadmapEvent): void {
    const year = this.getCurrentYearValue();
    let source: RoadmapMonth | null = null;
    let destination: RoadmapMonth | null = null;
    for (const quarter of year.quarters) {
      for (const month of quarter.months) {
        if (month.monthIndex === fromMonthIndex) {
          source = month;
        }
        if (month.monthIndex === toMonthIndex) {
          destination = month;
        }
      }
    }
    if (!source || !destination) {
      return;
    }
    if (extraId) {
      source.extraEvents = (source.extraEvents || []).filter(item => item.id !== extraId);
    } else if (source.event?.title) {
      const extras = source.extraEvents || [];
      const promoted = extras[0];
      source.event = promoted ? { title: promoted.title, description: promoted.description, id: promoted.id } : undefined;
      source.extraEvents = extras.slice(1);
    }
    const next = { title: event.title, description: event.description, id: extraId || undefined };
    if (!destination.event?.title) {
      destination.event = { title: next.title, description: next.description };
    } else {
      destination.extraEvents = [...(destination.extraEvents || []), { ...next, id: next.id || `event-${Date.now()}` }];
    }
    this.currentYear$.next({ ...year });
  }

  addEvent(quarterNumber: number, monthIndex: number, event: RoadmapEvent): void {
    const year = this.getCurrentYearValue();
    for (const quarter of year.quarters) {
      if (quarter.quarterNumber !== quarterNumber) {
        continue;
      }
      for (const month of quarter.months) {
        if (month.monthIndex !== monthIndex) {
          continue;
        }
        const next = { title: event.title, description: event.description };
        if (!month.event?.title) {
          month.event = next;
        } else {
          month.extraEvents = [...(month.extraEvents || []), { ...next, id: `event-${Date.now()}` }];
        }
        this.currentYear$.next({ ...year });
        return;
      }
    }
  }

  private buildFiscalYear(referenceDate: Date): RoadmapYear {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const fiscalStartYear = referenceDate.getFullYear();
    const startDate = new Date(fiscalStartYear, 3, 1); // April 1
    const monthsOrder = [3,4,5,6,7,8,9,10,11,0,1,2]; // Apr..Mar
    const quarters: RoadmapQuarter[] = [];
    for (let q = 0; q < 4; q++) {
      const months: RoadmapMonth[] = [];
      for (let m = 0; m < 3; m++) {
        const idx = monthsOrder[q * 3 + m];
        months.push({
          monthIndex: idx,
          monthName: monthNames[idx],
          event: this.sampleEventFor(idx, fiscalStartYear)
        });
      }
      quarters.push({ quarterNumber: q + 1, months });
    }
    return { startDate, quarters };
  }

  private sampleEventFor(monthIndex: number, fiscalYear: number): RoadmapEvent | undefined {
    const map: { [k: number]: RoadmapEvent } = {
      3: { title: `FY${fiscalYear} Kickoff`, description: 'Planning & kickoff.' },
      6: { title: `Q2 Milestone`, description: 'Deliver Q2 baseline.' },
      9: { title: `Q3 Release`, description: 'Public release.' },
      0: { title: `Q4 Wrap-up`, description: 'Stabilization & retrospective.' }
    };
    return map[monthIndex];
  }
}