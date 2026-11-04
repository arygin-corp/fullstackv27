import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-access-request-process-flow',
  templateUrl: './data-access-request-process-flow.component.html',
  styleUrls: ['./data-access-request-process-flow.component.css']
})
export class DataAccessRequestProcessFlowComponent implements OnInit {
  docURL = 'assets/docs/protected/Data_Access_Request_Process_Flow.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
