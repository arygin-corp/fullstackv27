import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsroomService } from 'src/app/@shared/services/newsroom.service';
import { Newsroom } from 'src/app/@shared/interfaces/newsroom';

@Component({
  selector: 'app-page-post-details',
  templateUrl: './page-post-details.component.html',
  styleUrls: ['./page-post-details.component.scss']
})

export class PagePostDetailsComponent implements OnInit {
  post?: Newsroom;

  constructor(
    private route: ActivatedRoute,
    private newsroomService: NewsroomService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      this.post = this.newsroomService.getNewsroomBySlug(slug);
    }

    // ✅ Optional: debug
    console.log('Slug:', slug);
    console.log('Post found:', this.post);
  }
}