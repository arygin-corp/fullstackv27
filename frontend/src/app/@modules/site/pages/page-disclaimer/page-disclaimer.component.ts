import { Component, OnInit } from '@angular/core';
import { PagesService } from '../../../../@shared/services/pages.service';

@Component({
  selector: 'app-page-disclaimer',
  templateUrl: './page-disclaimer.component.html',
  styleUrls: ['./page-disclaimer.component.scss']
})

export class PageDisclaimerComponent implements OnInit {
  page: any;

  constructor(
    private pagesService: PagesService
  ) {}

  ngOnInit(): void {

  this.pagesService.getPage('disclaimer').subscribe((response: any) => {
      console.log('Disclaimer Response', response);
      response.blocks.sort(
        (a: any, b: any) => a.position - b.position
      );
      this.page = response;
    });
  }
}