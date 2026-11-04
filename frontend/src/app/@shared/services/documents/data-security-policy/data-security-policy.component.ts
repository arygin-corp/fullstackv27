import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-security-policy',
  templateUrl: './data-security-policy.component.html',
  styleUrls: ['./data-security-policy.component.css']
})
export class DataSecurityPolicyComponent implements OnInit {
  docURL = 'assets/docs/protected/TMNA_DE_Data_Security_Process_0.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
