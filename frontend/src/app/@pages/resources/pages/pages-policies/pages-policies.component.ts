import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-pages-policies',
  templateUrl: './pages-policies.component.html',
  styleUrls: ['./pages-policies.component.scss']
})
export class PagesPoliciesComponent implements OnInit {
jsonPolicies: any;

  constructor(
    private httpClient: HttpClient
  ) { 

  }

  ngOnInit(): void {
    this.httpClient.get("assets/resources/json/docs/policies.json").subscribe(data =>{
      this.jsonPolicies = data;
    })
  }
}