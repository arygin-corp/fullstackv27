import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  docURL = 'https://data.toyota.com/assets/docs/protected/FAQ.docx';
  constructor() { }

  ngOnInit(): void {
  }

}
