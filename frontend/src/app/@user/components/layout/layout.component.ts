import { Component } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
    links: {label: string; url: string}[] = [
        {label: 'My Profile', url: './profile'},
        {label: 'Dashboard', url: './dashboard'},
        {label: 'Order History', url: './orders'},
        {label: 'Order Details', url: './orders/5'},
    ];

    constructor() { }
}
