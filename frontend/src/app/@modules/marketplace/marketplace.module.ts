import { NgModule } from '@angular/core';

// modules (angular)
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modules (third-party)
import { CarouselModule } from 'ngx-owl-carousel-o';

// modules
import { BlocksModule } from '../blocks/blocks.module';
import { SharedModule } from '../../@shared/shared.module';
import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { WidgetsModule } from '../widgets/widgets.module';

// components
import { ProductsViewComponent } from './components/products-view/products-view.component';
import { ProductTabsComponent } from './components/product-tabs/product-tabs.component';
import { ShopSidebarComponent } from './components/shop-sidebar/shop-sidebar.component';

// pages
import { PageCartComponent } from './pages/page-cart/page-cart.component';
import { PageMarketplaceComponent } from './pages/page-marketplace/page-marketplace.component';
import { PageCheckoutComponent } from './pages/page-checkout/page-checkout.component';
import { PageCompareComponent } from './pages/page-compare/page-compare.component';
import { PageProductComponent } from './pages/page-product/page-product.component';
import { PageTrackOrderComponent } from './pages/page-track-order/page-track-order.component';
import { PageFavoritesComponent } from './pages/page-favorites/page-favorites.component';
import { ProductSidebarComponent } from './components/product-sidebar/product-sidebar.component';
import { PageOrderSuccessComponent } from './pages/page-order-success/page-order-success.component';
import { PageRequestFormComponent } from './pages/page-request-form/page-request-form.component';

@NgModule({
    declarations: [
        // components
        ProductsViewComponent,
        ProductTabsComponent,
        ShopSidebarComponent,
        // pages
        PageCartComponent,
        PageMarketplaceComponent,
        PageCheckoutComponent,
        PageCompareComponent,
        PageProductComponent,
        PageTrackOrderComponent,
        PageFavoritesComponent,
        ProductSidebarComponent,
        PageOrderSuccessComponent,
        PageRequestFormComponent,
    ],
    exports: [
        // components
        ProductsViewComponent,
        ProductTabsComponent,
        ShopSidebarComponent,
        // pages
        PageCartComponent,
        PageMarketplaceComponent,
        PageCheckoutComponent,
        PageCompareComponent,
        PageProductComponent,
        PageTrackOrderComponent,
        PageFavoritesComponent,
        ProductSidebarComponent,
        PageOrderSuccessComponent,
        PageRequestFormComponent,
    ],
    imports: [
        // modules (angular)
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        // modules (third-party)
        CarouselModule,
        // modules
        BlocksModule,
        SharedModule,
        MarketplaceRoutingModule,
        WidgetsModule,
        // TranslateModule,
    ]
})
export class MarketplaceModule { }
