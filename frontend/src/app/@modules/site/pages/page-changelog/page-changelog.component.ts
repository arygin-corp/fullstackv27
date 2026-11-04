import { Component, OnInit } from '@angular/core';
import { ChangelogService } from '../../../../@shared/services/changelog.service';
import { Changelog} from '../../../../@shared/interfaces/changelog';

@Component({
    selector: 'app-page-changelog',
    templateUrl: './page-changelog.component.html',
    styleUrls: ['./page-changelog.component.scss']
})

export class PageChangelogComponent implements OnInit {
  profile:any;
  changelogs: Changelog[] = [];
  loading = true;
  error = '';

  constructor(
    private changelogService: ChangelogService,
  ) { }

  ngOnInit(): void {
    this.loadChangelogs();
    setTimeout(() => {
      this.loading = false;
    }, 5000); // 5 seconds
  }

  loadChangelogs(): void {
    this.loading = true;

    this.changelogService.getChangelogs().subscribe({
      next: (response) => {
        this.changelogs = response;
        this.loading = false;
      },

      error: (error) => {
        console.error(error);
        this.error ='Unable to load changelog releases.';
        this.loading = false;
      }
    });
  }

  scrollToRelease(id: number): void {
    const element = document.getElementById(`release-${id}`);

    if (!element) {
      return;
    }

    const yOffset = -116;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({top: y, behavior: 'smooth'});
  }
}