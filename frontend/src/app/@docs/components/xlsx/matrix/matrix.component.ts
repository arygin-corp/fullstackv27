import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent implements OnInit {
  docURL = 'assets/docs/protected/TMNA_DE_RACI_Matrix.xlsx';
  constructor() { }

  ngOnInit(): void {
  }

}
