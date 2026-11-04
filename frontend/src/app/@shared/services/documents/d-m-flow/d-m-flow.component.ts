import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-d-m-flow',
  templateUrl: './d-m-flow.component.html',
  styleUrls: ['./d-m-flow.component.css']
})
export class DMFlowComponent implements OnInit {
  docURL = 'assets/docs/protected/Data_Products_to_DM_Flow_As_Is.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
