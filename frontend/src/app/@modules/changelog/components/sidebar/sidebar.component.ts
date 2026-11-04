import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../../../../@shared/interfaces/post';
import { posts } from '../../../../../data/blog-posts';
import { latestComments } from '../../../../../data/blog-widget-latest-comments';
import { ChangelogService } from '../../../../@shared/api/changelog.service';
import { Domain } from '../../../../@shared/interfaces/domain';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    @Input() position: 'start'|'end' = 'start';

    posts: Post[] = posts;
    domains: Domain[] = [];
    latestComments = latestComments;

    constructor(
        private changelog: ChangelogService,
    ) { }

    ngOnInit(): void {
       //this.changelog.getDomains(null, 1).subscribe(x => this.domains = x);
    }
}
