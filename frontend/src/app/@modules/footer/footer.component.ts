import { Component } from '@angular/core';
import { theme } from '../../../data/theme';
import { footer } from '../../../data/footer';
import { environment } from '../../../environments/environment';
import { Link } from '../../@shared/interfaces/link';
import { BackendAccessService } from '../../@shared/services/backend-access.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    theme = theme;
    footer = footer;
    currentApplicationVersion = environment.version;
    currentYear = new Date().getFullYear();
    quickLinks: Link[] = [
        { label: 'Disclaimer', url: 'site/disclaimer' },
        { label: 'Term of Use', url: 'site/terms-use' },
        { label: 'Data Access Request', url: 'form/data-access-request' },
        { label: 'Metadata Management', url: 'https://tmna.collibra.com' },
    ];

    constructor(private backendAccess: BackendAccessService) {
        this.backendAccess.load().then(allowed => {
            if (allowed) {
                this.quickLinks = [
                    ...this.quickLinks,
                    { label: 'View Product Request', url: '/pages/product-intake' },
                ];
            }
        });
    }
}
