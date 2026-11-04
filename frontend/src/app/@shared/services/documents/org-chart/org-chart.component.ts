import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.css']
})
export class OrgChartComponent implements OnInit {
  docURL = 'assets/docs/protected/DE_Org_Chart.pdf';
  constructor() {

  }

  ngOnInit(): void {
  }

}
