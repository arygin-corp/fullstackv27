import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-quality-policy',
  templateUrl: './data-quality-policy.component.html',
  styleUrls: ['./data-quality-policy.component.css']
})
export class DataQualityPolicyComponent implements OnInit {
  docURL = 'assets/docs/protected/TMNA_DE_Data_Quality_Policy.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
