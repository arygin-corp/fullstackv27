import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-pages-processes',
  templateUrl: './pages-processes.component.html',
  styleUrls: ['./pages-processes.component.scss']
})
export class PagesProcessesComponent implements OnInit {
  jsonProcesses: any;

  constructor(
    private httpClient: HttpClient
  ) { 

  }

  ngOnInit(): void {
    this.httpClient.get("assets/resources/json/docs/processes.json").subscribe(data =>{
      this.jsonProcesses = data;
    })
  }

}
