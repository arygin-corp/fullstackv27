import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChangelogService } from '../../../../@shared/services/changelog.service';
import { Changelog} from '../../../../@shared/interfaces/changelog';

@Component({
    selector: 'app-page-changelog',
    templateUrl: './page-changelog.component.html',
    styleUrls: ['./page-changelog.component.scss']
})

export class PageChangelogComponent implements OnInit, AfterViewInit, OnDestroy {
  profile:any;
  changelogs: Changelog[] = [];
  loading = true;
  error = '';

  @ViewChild('versionNav') versionNav: ElementRef<HTMLElement>;

  private pinNav = () => this.placeVersionNav();

  constructor(
    private changelogService: ChangelogService,
  ) { }

  ngOnInit(): void {
    this.loadChangelogs();
    setTimeout(() => {
      this.loading = false;
    }, 5000); // 5 seconds
  }

  ngAfterViewInit(): void {
    this.placeVersionNav();
    document.body.addEventListener('scroll', this.pinNav, { passive: true });
    window.addEventListener('scroll', this.pinNav, { passive: true });
    window.addEventListener('resize', this.pinNav);
  }

  ngOnDestroy(): void {
    document.body.removeEventListener('scroll', this.pinNav);
    window.removeEventListener('scroll', this.pinNav);
    window.removeEventListener('resize', this.pinNav);
  }

  private placeVersionNav(): void {
    const nav = this.versionNav && this.versionNav.nativeElement;
    if (!nav) {
      return;
    }

    if (window.innerWidth <= 768) {
      nav.style.top = '';
      nav.style.left = '';
      nav.style.height = '';
      return;
    }

    const layout = nav.parentElement;
    const jumbo = document.querySelector('.jumbotron');
    const anchorBottom = jumbo ? jumbo.getBoundingClientRect().bottom : 0;
    const top = Math.max(16, Math.round(anchorBottom + 20));
    nav.style.left = (layout ? layout.getBoundingClientRect().left : 20) + 'px';
    nav.style.top = top + 'px';
    nav.style.height = Math.max(240, window.innerHeight - top - 16) + 'px';
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

    const current = document.body.scrollTop || window.pageYOffset || document.documentElement.scrollTop || 0;
    const itemTop = element.getBoundingClientRect().top;
    const footer = document.querySelector('.site__footer');
    const footerLimit = footer
      ? current + footer.getBoundingClientRect().top - window.innerHeight
      : Number.POSITIVE_INFINITY;
    const alignTop = current + itemTop - 96;
    const y = Math.max(0, Math.min(alignTop, footerLimit));

    document.body.scrollTo({top: y, behavior: 'smooth'});
  }
}