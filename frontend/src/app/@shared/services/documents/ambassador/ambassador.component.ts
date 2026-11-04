import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ambassador',
  templateUrl: './ambassador.component.html',
  styleUrls: ['./ambassador.component.css']
})
export class AmbassadorComponent implements OnInit {
  docURL = 'assets/docs/protected/Data_Science_Ambassadors.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
