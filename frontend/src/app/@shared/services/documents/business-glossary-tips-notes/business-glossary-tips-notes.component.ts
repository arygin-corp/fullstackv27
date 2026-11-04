import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-business-glossary-tips-notes',
  templateUrl: './business-glossary-tips-notes.component.html',
  styleUrls: ['./business-glossary-tips-notes.component.css']
})
export class BusinessGlossaryTipsNotesComponent implements OnInit {
  docURL = 'assets/docs/protected/One_Toyota_Business_Glossary_Tips_and_Notes.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
