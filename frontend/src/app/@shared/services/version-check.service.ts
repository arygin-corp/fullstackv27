// version-check.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export interface UpdateInfo {
  currentVersion: string;
  currentBuild: string;
  newVersion: string;
  newBuild: string;
  environment: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})

export class VersionCheckService {
  private currentVersionInfo: any;
  private updateDetected = false;
  private checkCount = 0;
  private updateAvailableSubject = new BehaviorSubject<UpdateInfo | null>(null);
  public updateAvailable$ = this.updateAvailableSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Starts monitoring version.json
   */
  startVersionChecking(versionUrl: string, pollingInterval = 3000): void {
    this.http.get<any>(`${versionUrl}?t=${Date.now()}`).subscribe((versionInfo) => {
      this.currentVersionInfo = versionInfo;console.log('%c[Version Check Started]', 'color:green;font-weight:bold');
      console.table(versionInfo);

      this.pollForUpdates(
        versionUrl,
        pollingInterval
      );
    });
  }

  /**
   * Polls version.json for changes
   */
  private pollForUpdates(versionUrl: string, pollingInterval: number): void {
    interval(pollingInterval).pipe(switchMap(() => this.http.get<any>(`${versionUrl}?t=${Date.now()}`)),
    catchError((error) => {
      console.error(
        '[Version Check] Error:',
        error
      );

      return of(null);
    })).subscribe((latestVersion) => {
      if (!latestVersion) {
        return;
      }

      if (this.updateDetected) {
        return;
      }

      this.checkCount++;

      // console.group(`%c[Version Check #${this.checkCount}]`, 'color:#4285f4;font-weight:bold');
      // console.log('Checked At:', new Date().toLocaleTimeString());
      // console.log('Current Version:', this.currentVersionInfo?.version);
      // console.log('Current Build:', this.currentVersionInfo?.buildId);
      // console.log('Latest Version:', latestVersion.version);
      // console.log('Latest Build:', latestVersion.buildId);

      const versionChanged = latestVersion.version !== this.currentVersionInfo.version;
      const buildChanged = latestVersion.buildId !== this.currentVersionInfo.buildId;

      // console.log('Version Changed:', versionChanged);
      // console.log('Build Changed:', buildChanged);
      // console.groupEnd();

      if (versionChanged || buildChanged) {
        // console.warn('%c[Version Check] UPDATE DETECTED!', 'color:red;font-weight:bold;font-size:14px');

        // console.table({
        //   currentVersion: this.currentVersionInfo.version,
        //   currentBuild: this.currentVersionInfo.buildId,
        //   newVersion: latestVersion.version,
        //   newBuild: latestVersion.buildId,
        //   environment: latestVersion.environment
        // });

        this.updateDetected = true;

        this.updateAvailableSubject.next({
          currentVersion: this.currentVersionInfo.version,
          currentBuild: this.currentVersionInfo.buildId,
          newVersion: latestVersion.version,
          newBuild: latestVersion.buildId,
          environment: latestVersion.environment,
          timestamp:latestVersion.timestamp
        });
      }
    });
  }

  /**
   * Reload application
   */
  public refreshApplication(): void {
    localStorage.clear();
    sessionStorage.clear();
    const url = window.location.pathname + '?reload=' + Date.now();
    window.location.href = url;
  }
}