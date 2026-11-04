import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mind-map',
  templateUrl: './mind-map.component.html',
  styleUrls: ['./mind-map.component.css']
})
export class MindMapComponent implements OnInit {
  docURL = 'assets/docs/protected/MindMap_Security_Roles--Data_And_Functions_0.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
