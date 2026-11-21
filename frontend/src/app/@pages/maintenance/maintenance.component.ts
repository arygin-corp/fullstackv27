import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaintenanceService } from './maintenance.service';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  hours = '00';
  minutes = '00';
  seconds = '00';
  year = new Date().getFullYear();
  private timer = 0;

  constructor(public maintenance: MaintenanceService) {}

  ngOnInit(): void {
    document.body.style.background = '#363636';
    this.maintenance.refresh();
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    document.body.style.background = '';
    window.clearInterval(this.timer);
  }

  private tick(): void {
    const ends = this.maintenance.status?.endsAt || Date.now();
    const remain = Math.max(0, Math.floor((ends - Date.now()) / 1000));
    this.hours = String(Math.floor(remain / 3600)).padStart(2, '0');
    this.minutes = String(Math.floor((remain % 3600) / 60)).padStart(2, '0');
    this.seconds = String(remain % 60).padStart(2, '0');
  }
}
