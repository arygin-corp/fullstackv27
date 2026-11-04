import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-metadata-policy',
  templateUrl: './metadata-policy.component.html',
  styleUrls: ['./metadata-policy.component.css']
})
export class MetadataPolicyComponent implements OnInit {
  docURL = 'assets/docs/protected/TMNA_DE_Metadata_Policy.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
