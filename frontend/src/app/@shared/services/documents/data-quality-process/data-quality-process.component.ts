import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-quality-process',
  templateUrl: './data-quality-process.component.html',
  styleUrls: ['./data-quality-process.component.css']
})
export class DataQualityProcessComponent implements OnInit {
  docURL = 'assets/docs/protected/TMNA_DE_Data_Quality_Policy.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
