import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.css']
})
export class DomainsComponent implements OnInit {
  docURL = 'assets/docs/protected/TMNA_Data_Domains.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
