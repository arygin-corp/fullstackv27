import { NavigationLink } from '../app/@shared/interfaces/navigation-link';
import { NavigationLink2 } from '../app/@shared/interfaces/navigation-link2';

export const navigation: NavigationLink[] = [
    { label: 'Home', url: '/' },
    { label: 'Categories', url: '/' },
    { label: 'Products', url: '/' },
    { label: 'Pages', url: '/' },
    { label: 'Elements', url: '/' },
    { label: 'Newsroom', url: 'pages/newsroom' },
    { label: 'About Us', url: 'pages/about-us' }
];

export const navigation2: NavigationLink2[] = [
    { label: 'New Product Releases', url: 'marketplace/new-releases' },
    { label: 'Request New Feature', url: 'form/feature-request' }
];
