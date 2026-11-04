import { Link } from './link';
import { Menu } from './menu';
import { Megamenu } from './megamenu';

export interface NavigationLink2 extends Link {
    menu?: Menu|Megamenu;
}
