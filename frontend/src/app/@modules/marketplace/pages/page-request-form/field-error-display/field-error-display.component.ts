import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-field-error-display',
  templateUrl: './field-error-display.component.html',
  styleUrls: ['./field-error-display.component.css']
})
export class FieldErrorDisplayComponent {

  @Input() errorMsg: string;
  @Input() errorMsg2: string;
  @Input() displayError: boolean;
  @Input() displayError2: boolean;
}
