import { Component } from '@angular/core';
import { toyota } from 'src/data/toyota';

@Component({
    selector: 'app-contact-us',
    templateUrl: './page-contact-us.component.html',
    styleUrls: ['./page-contact-us.component.scss']
})
export class PageContactUsComponent {
    toyota = toyota;

    constructor() { }
}
