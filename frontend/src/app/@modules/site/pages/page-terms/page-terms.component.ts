import { Component, OnInit } from '@angular/core';
import { PagesService } from '../../../../@shared/services/pages.service';

@Component({
    selector: 'app-terms',
    templateUrl: './page-terms.component.html',
    styleUrls: ['./page-terms.component.scss']
})

export class PageTermsComponent implements OnInit {
  page: any;

  constructor(
    private pagesService: PagesService
  ) {}

  ngOnInit(): void {

  this.pagesService.getPage('terms-of-use').subscribe((response: any) => {
      console.log('Terms of Use Response', response);
      response.blocks.sort(
        (a: any, b: any) => a.position - b.position
      );
      this.page = response;
    });
  }
}