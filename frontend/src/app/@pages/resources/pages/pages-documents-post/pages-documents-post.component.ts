import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-pages-documents-post',
  templateUrl: './pages-documents-post.component.html',
  styleUrls: ['./pages-documents-post.component.scss']
})
export class PagesDocumentsPostComponent implements OnInit {
  jsonDocs: any;

  constructor(
    private httpClient: HttpClient
  ) { 

  }

  ngOnInit(): void {
    this.httpClient.get("assets/resources/json/docs/doc.json").subscribe(data =>{
      this.jsonDocs = data;
    })
  }

}
