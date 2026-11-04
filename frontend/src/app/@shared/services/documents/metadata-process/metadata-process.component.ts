import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-metadata-process',
  templateUrl: './metadata-process.component.html',
  styleUrls: ['./metadata-process.component.css']
})
export class MetadataProcessComponent implements OnInit {
  docURL = 'assets/docs/protected/TMNA_DE_Metadata_Policy.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
