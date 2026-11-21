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
  loaded = false;

  constructor(
    private route: ActivatedRoute,
    private newsroomService: NewsroomService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loaded = true;
      return;
    }
    this.newsroomService.getNewsroomBySlug(slug).subscribe(post => {
      this.post = post;
      this.loaded = true;
    });
  }
}