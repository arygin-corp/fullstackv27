import { Component, OnInit } from '@angular/core';
import { VersionCheckService, UpdateInfo } from '../../services/version-check.service';

@Component({
  selector: 'app-update-available',
  templateUrl: './update-available.component.html',
  styleUrls: ['./update-available.component.scss']
})

export class UpdateAvailableComponent implements OnInit {
  updateInfo: UpdateInfo | null = null;

  constructor(
    private versionService: VersionCheckService
  ) {}

  ngOnInit(): void {
    this.versionService.updateAvailable$.subscribe((info) => {
      if (info) {
        this.updateInfo = info;
        // Prevent scrolling while modal is visible
        document.body.style.overflow = 'hidden';
      }
    });
    // For Testing
    // this.updateInfo = {
    //   currentVersion: '26.27.09',
    //   currentBuild: 'stage-build-3',
    //   newVersion: '26.27.09',
    //   newBuild: 'stage-build-4',
    //   environment: 'stage',
    //   timestamp: new Date().toISOString()
    // };
  }

  get buildNumber(): string {
    const match = this.updateInfo?.newBuild?.match(/\d+$/);
    return match?.[0] || '';
  }

  updateNow(): void {
    this.versionService.refreshApplication();
  }
}