import { Component, Input } from '@angular/core';
import { RootService } from '../../../@shared/services/root.service';

@Component({
    selector: 'app-widget-domains',
    templateUrl: './widget-domains.component.html',
    styleUrls: ['./widget-domains.component.scss']
})
export class WidgetDomainsComponent {
    @Input() location: 'blog'|'shop' = 'blog';
    @Input() domains: any[] = [];

    constructor(
        public root: RootService,
    ) { }

}
