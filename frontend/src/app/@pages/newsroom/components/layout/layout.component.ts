// layout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  selectedCategory: string = '';
  
  links = [
    { label: 'Newsroom', category: '' },
    { label: 'Updates', category: 'updates' },
    { label: 'Features', category: 'features' },
    { label: 'Trending', category: 'trending' },
    { label: 'Security', category: 'security' }
  ];

  private routerSub!: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // ✅ Sync active category with current route
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.selectedCategory = this.route.snapshot.firstChild?.params['category'] || '';
      });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    const path = category ? `/newsroom/${category}` : '/newsroom';
    this.router.navigateByUrl(path);
  }
}