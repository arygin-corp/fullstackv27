import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClient, HttpClientModule, HttpClientXsrfModule } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

// modules (angular)
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

// modules (third-party)
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { RedZoomModule } from 'ngx-red-zoom';

// directives
import { ClickDirective } from './directives/click.directive';
import { CollapseContentDirective, CollapseDirective, CollapseItemDirective } from './directives/collapse.directive';
import { DepartmentsAreaDirective } from './directives/departments-area.directive';
import { DropdownDirective } from './directives/dropdown.directive';
import { FakeSlidesDirective } from './directives/fake-slides.directive';
import { OutsideTouchClickDirective } from './directives/outside-touch-click.directive';
import { OwlPreventClickDirective } from './directives/owl-prevent-click.directive';
import { TouchClickDirective } from './directives/touch-click.directive';

// components
import { AlertComponent } from './components/alert/alert.component';
import { ChatComponent } from './components/chat/chat.component';
import { IconComponent } from './components/icon/icon.component';
import { InputNumberComponent } from './components/input-number/input-number.component';
import { LoadingBarComponent } from './components/loading-bar/loading-bar.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductComponent } from './components/product/product.component';
import { QuickviewComponent } from './components/quickview/quickview.component';
import { RatingComponent } from './components/rating/rating.component';
import { SearchComponent } from './components/search/search.component';
import { ShareButtonsComponent } from './components/share-buttons/share-buttons.component';
import { SocialLinksComponent } from './components/social-links/social-links.component';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { RequestAccessComponent } from './components/product/components/request-access/request-access.component';
import { PeopleFinderComponent } from './components/people-finder/people-finder.component';
import { SuggestedAiComponent } from './components/suggested-ai/suggested-ai.component';
import { ValidationStatusComponent } from './components/validation-status/validation-status.component';
import { InteractiveAiComponent } from './components/interactive-ai/interactive-ai.component';
import { ProductGalleryComponent } from './components/product-gallery/product-gallery.component';
import { ProductPopoverComponent } from './components/product-popover/product-popover.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { UpdateAvailableComponent } from './components/update-available/update-available.component';
import { PageLoaderComponent } from './components/page-loader/page-loader.component';

// pipes
import { AbsoluteUrlPipe } from './pipes/absolute-url.pipe';
import { ColorTypePipe } from './pipes/color-type.pipe';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { AiBrainComponent } from './components/ai-brain/ai-brain.component';
import { AiBrainChatIconComponent } from './components/ai-brain-chat-icon/ai-brain-chat-icon.component';
import { EndToEndSolutionComponent } from'./components/product/end-to-end-solution/end-to-end.component';
import { ProductAssociationsComponent } from './components/product/product-associations/product-associations.component';
  
@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [
        // directives
        ClickDirective,
        CollapseContentDirective,
        CollapseDirective,
        CollapseItemDirective,
        DepartmentsAreaDirective,
        DropdownDirective,
        FakeSlidesDirective,
        OutsideTouchClickDirective,
        OwlPreventClickDirective,
        TouchClickDirective,
        // components
        AlertComponent,
        IconComponent,
        InputNumberComponent,
        LoadingBarComponent,
        PageLoaderComponent,
        PageHeaderComponent,
        PaginationComponent,
        PostCardComponent,
        ProductCardComponent,
        ProductComponent,
        QuickviewComponent,
        RatingComponent,
        SearchComponent,
        ShareButtonsComponent,
        SocialLinksComponent,
        RequestAccessComponent,
        // pipes
        AbsoluteUrlPipe,
        ColorTypePipe,
        CurrencyFormatPipe,
        HighlightPipe,
        ProductGalleryComponent,
        MultiSelectComponent,
        PeopleFinderComponent,
        ValidationStatusComponent,
        SuggestedAiComponent,
        InteractiveAiComponent,
        ProductPopoverComponent,
        ComingSoonComponent,
        ChatComponent,
        AiBrainComponent,
        AiBrainChatIconComponent,
        UpdateAvailableComponent,
        EndToEndSolutionComponent,
        ProductAssociationsComponent
    ],
    imports: [
        // modules (angular)
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        // modules (third-party)
        CarouselModule,
        ModalModule.forRoot(),
        RedZoomModule,
        TranslateModule,
        AngularMultiSelectModule,
        NgSelectModule,
        NgOptionHighlightModule,
        HttpClientModule,
        HttpClientXsrfModule.withOptions({
            cookieName: 'csrftoken',
            headerName: 'X-CSRFToken'
        })
    ],
    exports: [
        // directives
        ClickDirective,
        CollapseContentDirective,
        CollapseDirective,
        CollapseItemDirective,
        DepartmentsAreaDirective,
        DropdownDirective,
        FakeSlidesDirective,
        OutsideTouchClickDirective,
        OwlPreventClickDirective,
        TouchClickDirective,
        // components
        AlertComponent,
        ChatComponent,
        IconComponent,
        InputNumberComponent,
        LoadingBarComponent,
        PageLoaderComponent,
        PageHeaderComponent,
        PaginationComponent,
        PostCardComponent,
        ProductCardComponent,
        ProductComponent,
        QuickviewComponent,
        RatingComponent,
        SearchComponent,
        SocialLinksComponent,
        MultiSelectComponent,
        PeopleFinderComponent,
        RequestAccessComponent,
        ValidationStatusComponent,
        // pipes
        AbsoluteUrlPipe,
        ColorTypePipe,
        CurrencyFormatPipe,
        HighlightPipe,
        ShareButtonsComponent,
        SuggestedAiComponent,
        InteractiveAiComponent,
        ProductPopoverComponent,
        ComingSoonComponent,
        UpdateAvailableComponent,
        EndToEndSolutionComponent,
        ProductAssociationsComponent
    ]
})

export class SharedModule { }
