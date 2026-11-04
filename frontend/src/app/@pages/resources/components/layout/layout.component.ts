import { Component } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
    links: {label: string; url: string}[] = [
        { label: 'Resources', url: './' },
        { label: 'Brands', url: './brands' },
        { label: 'Documents', url: './docs' },
        { label: 'Policies', url: './policies' },
        { label: 'Processes', url: './processes' },
        { label: 'Media', url: './media' },
        { label: 'Mind Map', url: './mind-map' }
    ];

    constructor() { }
}
