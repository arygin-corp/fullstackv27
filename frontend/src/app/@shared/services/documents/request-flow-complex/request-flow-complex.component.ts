import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-request-flow-complex',
  templateUrl: './request-flow-complex.component.html',
  styleUrls: ['./request-flow-complex.component.css']
})
export class RequestFlowComplexComponent implements OnInit {
  docURL = 'assets/docs/protected/Data_Access_Request_Flow_Complex.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
