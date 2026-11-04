import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { BrowserModule } from '@angular/platform-browser';

// modules (angular)
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// modules
import { SharedModule } from '../../@shared/shared.module';
import { AvatarModule } from 'ngx-avatar';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

// components
import { AccountMenuComponent } from './components/account-menu/account-menu.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { DropcartComponent } from './components/dropcart/dropcart.component';
import { HeaderComponent } from './header.component';
import { IndicatorComponent } from './components/indicator/indicator.component';
import { LinksComponent } from './components/links/links.component';
import { MegamenuComponent } from './components/megamenu/megamenu.component';
import { MenuComponent } from './components/menu/menu.component';
import { NavComponent } from './components/nav/nav.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { DropproductComponent } from './components/dropproduct/dropproduct.component';

export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient);
}

@NgModule({
    declarations: [
        // components
        AccountMenuComponent,
        DepartmentsComponent,
        DropcartComponent,
        HeaderComponent,
        IndicatorComponent,
        LinksComponent,
        MegamenuComponent,
        MenuComponent,
        NavComponent,
        TopbarComponent,
        LanguageSwitcherComponent,
        DropproductComponent
    ],
    exports: [
        // components
        HeaderComponent,
        DropcartComponent,
        LanguageSwitcherComponent,
        AccountMenuComponent,
        DropproductComponent
    ],
    imports: [
        BrowserModule,
        // modules (angular)
        CommonModule,
        RouterModule,
        // modules
        SharedModule,
        AvatarModule,
        ReactiveFormsModule,
        NgSelectModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
            },
            defaultLanguage: "en"
        })
    ]
})
export class HeaderModule { }
