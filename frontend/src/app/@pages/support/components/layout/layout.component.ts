import { Component } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
    links: {label: string; url: string}[] = [
        {label: 'Newsroom', url: './newsroom'},
        {label: 'Updates', url: './newsroom/updates'},
        {label: 'Features', url: './newsroom/features'},
        {label: 'Trending', url: './newsroom/trending'},
        {label: 'Security', url: './newsroom/security'},
        // {label: 'Update Details', url: './newsroom/update/details/5'},
        // {label: 'Feature Details', url: './newsroom/feature/details/5'},
        // {label: 'Trending Details', url: './newsroom/trending/details/5'},
        // {label: 'Security Details', url: './newsroom/security/details/5'},
    ];

    constructor() { }
}
