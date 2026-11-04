import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-ingestion',
  templateUrl: './data-ingestion.component.html',
  styleUrls: ['./data-ingestion.component.css']
})
export class DataIngestionComponent implements OnInit {
  docURL = 'assets/docs/protected/Data_Ingestion_Request_Process_Flow.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
