import { Component, Input } from '@angular/core';
import { Domain } from '../../../@shared/interfaces/domain';
import { RootService } from '../../../@shared/services/root.service';

@Component({
    selector: 'app-block-domains',
    templateUrl: './block-domains.component.html',
    styleUrls: ['./block-domains.component.scss']
})
export class BlockDomainsComponent {
    @Input() header = '';
    @Input() layout: 'classic'|'compact' = 'classic';
    @Input() domains: Domain[] = [];

    constructor(
        public root: RootService,
    ) { }
}
