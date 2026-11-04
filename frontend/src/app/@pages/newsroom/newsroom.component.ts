// newsroom.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { Newsroom } from 'src/app/@shared/interfaces/newsroom';
import { NewsroomService } from 'src/app/@shared/services/newsroom.service';

@Component({
  selector: 'app-newsroom',
  templateUrl: './newsroom.component.html',
  styleUrls: ['./newsroom.component.scss']
})

export class NewsroomComponent implements OnInit, OnDestroy {
  newsroom: Newsroom[] = [];
  filtered: Newsroom[] = [];
  category: string = '';
  
  private routeSub!: Subscription;

  constructor(
    private newsroomService: NewsroomService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.newsroom = this.newsroomService.getNewsroom();
    
    // ✅ Read category from route params instead of @Input
    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.category = params.get('category') || '';
      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  applyFilter(): void {
    if (!this.category) {
      this.filtered = this.newsroom;
    } else {
      this.filtered = this.newsroom.filter(
        post => post.category === this.category
      );
    }
  }
}