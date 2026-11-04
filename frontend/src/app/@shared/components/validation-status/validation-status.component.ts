import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-validation-status',
  templateUrl: './validation-status.component.html',
  styleUrls: ['./validation-status.component.scss']
})
export class ValidationStatusComponent implements OnInit {
  @Input() value: any;
  @Input() label: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
