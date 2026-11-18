import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mind-map',
  templateUrl: './mind-map.component.html',
  styleUrls: ['./mind-map.component.css']
})
export class MindMapComponent implements OnInit {
  docURL = 'assets/docs/protected/Mind_Map.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
