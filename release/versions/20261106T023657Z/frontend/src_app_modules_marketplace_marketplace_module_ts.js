"use strict";
(self["webpackChunkgdx"] = self["webpackChunkgdx"] || []).push([["src_app_modules_marketplace_marketplace_module_ts"],{

/***/ 71619:
/*!**********************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/components/product-sidebar/product-sidebar.component.ts ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProductSidebarComponent": () => (/* binding */ ProductSidebarComponent)
/* harmony export */ });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 86942);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_api_shop_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/api/shop.service */ 32053);
/* harmony import */ var _widgets_widget_domains_widget_domains_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../widgets/widget-domains/widget-domains.component */ 18496);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 36362);






const _c0 = function () {
  return [];
};

class ProductSidebarComponent {
  constructor(shop) {
    this.shop = shop;
  }

  ngOnInit() {
    this.domains$ = this.shop.getDomains(null, 1);
    this.bestsellers$ = this.shop.getBestsellers().pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.map)(x => x.slice(0, 5)));
  }

}

ProductSidebarComponent.ɵfac = function ProductSidebarComponent_Factory(t) {
  return new (t || ProductSidebarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_shared_api_shop_service__WEBPACK_IMPORTED_MODULE_0__.ShopService));
};

ProductSidebarComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
  type: ProductSidebarComponent,
  selectors: [["app-product-sidebar"]],
  decls: 4,
  vars: 4,
  consts: [[1, "block", "block-sidebar"], [1, "block-sidebar__item"], ["location", "shop", 3, "domains"]],
  template: function ProductSidebarComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "app-widget-domains", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](3, "async");
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    }

    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("domains", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](3, 1, ctx.domains$) || _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction0"](3, _c0));
    }
  },
  directives: [_widgets_widget_domains_widget_domains_component__WEBPACK_IMPORTED_MODULE_1__.WidgetDomainsComponent],
  pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.AsyncPipe],
  styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwcm9kdWN0LXNpZGViYXIuY29tcG9uZW50LnNjc3MifQ== */"]
});

/***/ }),

/***/ 62758:
/*!****************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/components/product-tabs/product-tabs.component.ts ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProductTabsComponent": () => (/* binding */ ProductTabsComponent)
/* harmony export */ });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _data_product_reviews__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../data/product-reviews */ 87506);
/* harmony import */ var _data_product_documentation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../data/product-documentation */ 75488);
/* harmony import */ var _data_intended_use__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../data/intended-use */ 62812);
/* harmony import */ var _data_whats_included__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../data/whats-included */ 54968);
/* harmony import */ var _data_product_resource__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../../data/product-resource */ 33384);
/* harmony import */ var _data_product_description__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../../data/product-description */ 8979);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_components_rating_rating_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../@shared/components/rating/rating.component */ 28081);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/forms */ 90587);
/* harmony import */ var _shared_components_pagination_pagination_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../@shared/components/pagination/pagination.component */ 19363);














function ProductTabsComponent_div_81_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](2, "app-rating");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "div", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](4, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "div", 62);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](6, "mark");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](7, "0%");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} }
function ProductTabsComponent_li_102_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "li", 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](3, "img", 66);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "div", 67);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "div", 68);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](7, "div", 69);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](8, "app-rating", 70);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](9, "div", 71);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](11, "div", 72);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const review_r3 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("src", review_r3.avatar, _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](review_r3.author);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("value", review_r3.rating);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](review_r3.text);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](review_r3.date);
} }
const _c0 = function (a0) { return { "product-tabs--layout--sidebar": a0 }; };
const _c1 = function (a0) { return { "product-tabs__item--active": a0 }; };
const _c2 = function (a0) { return { "product-tabs__pane--active": a0 }; };
const _c3 = function () { return [5, 4, 3, 2, 1]; };
class ProductTabsComponent {
    constructor(route, location, router, httpClient) {
        this.route = route;
        this.location = location;
        this.router = router;
        this.httpClient = httpClient;
        this.withSidebar = false;
        this.tab = 'description';
        this.description = _data_product_description__WEBPACK_IMPORTED_MODULE_5__.description;
        this.resource = _data_product_resource__WEBPACK_IMPORTED_MODULE_4__.resource;
        this.reviews = _data_product_reviews__WEBPACK_IMPORTED_MODULE_0__.reviews;
        this.intended = _data_intended_use__WEBPACK_IMPORTED_MODULE_2__.intended;
        this.included = _data_whats_included__WEBPACK_IMPORTED_MODULE_3__.included;
        this.documentation = _data_product_documentation__WEBPACK_IMPORTED_MODULE_1__.documentation;
        this.codec = new _angular_common_http__WEBPACK_IMPORTED_MODULE_9__.HttpUrlEncodingCodec();
        this.denodos = [];
        this.clicked = false;
        this.errorMessage = `No definition available.`;
        this.tableUrl = "";
        this.dataSetFilters = {
            showHideProps: {
                text: {
                    showButton: true,
                    showState: false,
                    show: 'Show Tables and Columns',
                    hide: 'Hide Tables and Columns'
                }
            }
        };
    }
    showTablesAndColumns(currentState) {
        if (!currentState) {
            const adgroup = this.product.adGroup || this.product.adgroup;
            if (adgroup != null) {
                this.httpClient.get(this.tableUrl).subscribe(data => this.denodos = data.elements, () => this.denodos = []);
            }
        }
    }
}
ProductTabsComponent.ɵfac = function ProductTabsComponent_Factory(t) { return new (t || ProductTabsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_10__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_common__WEBPACK_IMPORTED_MODULE_11__.Location), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_10__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_9__.HttpClient)); };
ProductTabsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdefineComponent"]({ type: ProductTabsComponent, selectors: [["app-product-tabs"]], inputs: { withSidebar: "withSidebar", product: "product", tab: "tab" }, decls: 139, vars: 49, consts: [[1, "product-tabs", 3, "ngClass"], [1, "product-tabs__list"], ["href", "#tab-resourceurl", 1, "product-tabs__item", 3, "ngClass", "click"], ["href", "#tab-tables", 1, "product-tabs__item", 3, "ngClass", "click"], ["href", "#tab-description", 1, "product-tabs__item", 3, "ngClass", "click"], ["href", "#tab-included", 1, "product-tabs__item", 3, "ngClass", "click"], ["href", "#tab-intended", 1, "product-tabs__item", 3, "ngClass", "click"], [1, "product-tabs__content"], ["id", "tab-description", 1, "product-tabs__pane", 3, "ngClass"], [1, "typography"], [2, "font-size", "18px"], ["id", "tab-resource", 1, "product-tabs__pane", 3, "ngClass"], [1, "product-tab-links", 3, "href"], ["id", "tab-tables", 1, "product-tabs__pane", 3, "ngClass"], [1, "row"], [1, "col-lg-12"], [1, "spec"], [1, "spec__section"], [1, "spec__disclaimer", "text-danger", "mt-3", 2, "font-size", "16px", "font-weight", "normal", "line-height", "1.5"], [1, "row", "py-2", 2, "border-bottom", "1px solid #ebebeb"], [1, "col-lg-5", 2, "color", "#3d464d", "font-size", "18px"], [1, "col-lg-7", 2, "color", "#3d464d", "font-size", "18px"], ["id", "tab-reviews", 1, "product-tabs__pane", 3, "ngClass"], [1, "reviews-view"], [1, "row", "mb-4"], [1, "col-lg-5", "mb-4"], [1, "ratings-wrapper"], [1, "avg-rating-container"], [1, "avg-mark", "font-weight-bolder", "ls-50"], [1, "avg-rating"], [1, "text-dark", "mb-1"], [1, "ratings-container"], ["href", "#", 1, "rating-reviews"], [1, "ratings-value", "d-flex", "align-items-center", "text-dark", "ls-25"], [1, "text-dark", "font-weight-bold"], [1, "count"], [1, "ratings-list"], ["class", "ratings-container", 4, "ngFor", "ngForOf"], [1, "col-lg-7", "mb-4"], [1, "review-form-wrapper"], [1, "title", "tab-pane-title", "font-weight-bold", "mb-1"], [1, "mb-3"], ["action", "#", "method", "POST", 1, "review-form"], [1, "rating-form", "mb-3"], ["for", "rating"], [1, "rating-stars", "ml-2"], ["cols", "30", "rows", "6", "placeholder", "Write Your Review Here...", "id", "review", 1, "form-control", "mb-3"], ["type", "submit", 1, "btn", "btn-dark"], [1, "reviews-view__list"], [1, "reviews-list"], [1, "reviews-list__content"], ["class", "reviews-list__item", 4, "ngFor", "ngForOf"], [1, "reviews-list__pagination"], [3, "current", "siblings", "total"], ["id", "tab-documentation", 1, "product-tabs__pane", 3, "ngClass"], [1, "spec__row"], [1, "spec__disclaimer"], ["id", "tab-included", 1, "product-tabs__pane", 3, "ngClass"], ["id", "tab-intended", 1, "product-tabs__pane", 3, "ngClass"], [1, "ratings-full-value", "avg-rating2"], [1, "progress-bar", "progress-bar-sm"], [2, "width", "0%"], [1, "progress-value"], [1, "reviews-list__item"], [1, "review"], [1, "review__avatar"], ["alt", "", 3, "src"], [1, "review__content"], [1, "review__author"], [1, "review__rating"], [3, "value"], [1, "review__text"], [1, "review__date"]], template: function ProductTabsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "a", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function ProductTabsComponent_Template_a_click_2_listener($event) { $event.preventDefault(); return ctx.tab = "resource"; });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](3, "Resources");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "a", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function ProductTabsComponent_Template_a_click_4_listener($event) { $event.preventDefault(); return ctx.tab = "tables"; });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](5, "Tables & Columns");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](6, "a", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function ProductTabsComponent_Template_a_click_6_listener($event) { $event.preventDefault(); return ctx.tab = "description"; });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](7, "Description");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](8, "a", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function ProductTabsComponent_Template_a_click_8_listener($event) { $event.preventDefault(); return ctx.tab = "included"; });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](9, "What's Included");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](10, "a", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function ProductTabsComponent_Template_a_click_10_listener($event) { $event.preventDefault(); return ctx.tab = "intended"; });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](11, "Intended Use");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](12, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](13, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](14, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](15, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](16, "Brief Description");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](17, "p", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](18);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](19, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](20, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](21, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](22, "Resources");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](23, "p", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](24, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](25);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](26, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](27, "a", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](28);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](29, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](30, "div", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](31, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](32, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](33, "div", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](34, "h3", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](35, "Database Scehma");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](36, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](37, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](38, "Note: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](39, " Listed below is the ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](40, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](41, "authoritative technical schema");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](42, " for this data product. These entries represent the actual ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](43, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](44, "Table Names");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](45, " and ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](46, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](47, "Column Headers");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](48, " you will interact with in the production environment. This metadata is provided to facilitate technical mapping, ETL planning, and query development. Please ensure your applications or scripts utilize these exact identifiers to maintain compatibility once access is granted. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](49, "div", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](50, "div", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](51, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](52, "Table Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](53, "div", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](54, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](55, "Column Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](56, "div", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](57, "div", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](58, "div", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](59, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](60, "div", 24);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](61, "div", 25);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](62, "div", 26);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](63, "div", 27);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](64, "h4", 28);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](65, "0.0");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](66, "div", 29);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](67, "p", 30);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](68, "Average Rating");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](69, "div", 31);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](70, "app-rating");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](71, "\u00A0\u00A0/\u00A0\u00A0 ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](72, "a", 32);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](73, "(0)Reviews");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](74, "div", 33);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](75, "span", 34);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](76, "0%");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](77, "\u00A0Recommended ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](78, "span", 35);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](79, "\u00A0(0 of 0)");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](80, "div", 36);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](81, ProductTabsComponent_div_81_Template, 8, 0, "div", 37);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](82, "div", 38);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](83, "div", 39);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](84, "h3", 40);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](85, "Submit Your Product Review");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](86, "p", 41);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](87, "Your email address will not be published. Required fields are marked *");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](88, "form", 42);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](89, "div", 43);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](90, "label", 44);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](91, "Overall Rating: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](92, "span", 45);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](93, "app-rating");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](94, "textarea", 46);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](95, "button", 47);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](96, "Submit Review");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](97, "div", 48);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](98, "h5", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](99, "Customer Reviews");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](100, "div", 49);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](101, "ol", 50);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](102, ProductTabsComponent_li_102_Template, 13, 5, "li", 51);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](103, "div", 52);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](104, "app-pagination", 53);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](105, "div", 54);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](106, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](107, "div", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](108, "h3", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](109, "Documentation");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](110, "div", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](111, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](112, "This the documentation section");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](113, "div", 56);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](114, " Information provided is based on the latest available data at the time of publication. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](115, "div", 57);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](116, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](117, "div", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](118, "h3", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](119, "What's Included");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](120, "div", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](121, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](122, "This the documentation section");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](123, "div", 56);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](124, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](125, "Disclaimer: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](126, "The information listed under \"What's Included\" describes the types of data that may be available through this product. Data availability, completeness, and applicability may vary based on the source data and the specific record or request. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](127, "div", 58);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](128, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](129, "div", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](130, "h3", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](131, "Intended Use");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](132, "div", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](133, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](134, "This the documentation section");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](135, "div", 56);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](136, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](137, "Disclaimer: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](138, "\"Intended Use\" describes the purposes for which this product and its data are designed to be used. It does not grant authorization for uses outside applicable company policies, data access requirements, or other governing requirements. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](22, _c0, ctx.withSidebar));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](24, _c1, ctx.tab === "resource"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](26, _c1, ctx.tab === "tables"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](28, _c1, ctx.tab === "description"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](30, _c1, ctx.tab === "included"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](32, _c1, ctx.tab === "intended"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](34, _c2, ctx.tab === "description"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](ctx.product.brief_desc);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](36, _c2, ctx.tab === "resource"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"]("", ctx.product.catalog, ": ");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpropertyInterpolate"]("href", ctx.product.resource_url, _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](ctx.product.name);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](38, _c2, ctx.tab === "tables"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](27);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](40, _c2, ctx.tab === "reviews"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](25);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction0"](42, _c3));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](21);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", ctx.reviews);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("current", 1)("siblings", 2)("total", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](43, _c2, ctx.tab === "documentation"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](10);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](45, _c2, ctx.tab === "included"));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](12);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](47, _c2, ctx.tab === "intended"));
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_11__.NgClass, _shared_components_rating_rating_component__WEBPACK_IMPORTED_MODULE_6__.RatingComponent, _angular_common__WEBPACK_IMPORTED_MODULE_11__.NgForOf, _angular_forms__WEBPACK_IMPORTED_MODULE_12__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_12__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.NgForm, _shared_components_pagination_pagination_component__WEBPACK_IMPORTED_MODULE_7__.PaginationComponent], styles: [".avg-mark[_ngcontent-%COMP%] {\n  font-size: 6em;\n  font-weight: 600;\n  color: #336699;\n  letter-spacing: -0.025em;\n  line-height: 1;\n  margin-bottom: 0;\n}\n\n.ls-50[_ngcontent-%COMP%] {\n  letter-spacing: -0.05em !important;\n}\n\n.font-weight-bolder[_ngcontent-%COMP%] {\n  font-weight: 700 !important;\n}\n\nh4[_ngcontent-%COMP%] {\n  font-size: 64px;\n  font-weight: 700;\n}\n\n.avg-rating[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  line-height: 1.4;\n}\n\np[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n}\n\n.tab-pane[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin-bottom: 0;\n  font-size: inherit;\n  letter-spacing: 0;\n  line-height: 2;\n}\n\n.text-dark[_ngcontent-%COMP%] {\n  color: #333 !important;\n}\n\n.mb-1[_ngcontent-%COMP%] {\n  margin-bottom: 0.5rem !important;\n}\n\n.avg-rating-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  font-size: 1rem;\n  margin-bottom: 0.2rem;\n}\n\n.avg-mark[_ngcontent-%COMP%] {\n  font-size: 6em;\n  font-weight: 600;\n  color: #cc3333;\n  letter-spacing: -0.025em;\n  line-height: 1;\n  margin-bottom: 0;\n}\n\n.avg-rating[_ngcontent-%COMP%] {\n  margin-left: 1.8rem;\n}\n\n.avg-rating[_ngcontent-%COMP%]   .ratings-container[_ngcontent-%COMP%] {\n  margin-bottom: 0.3rem;\n}\n\n.ratings-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  line-height: 1;\n  margin-bottom: 0.6rem;\n  font-size: 1.2rem;\n}\n\n.avg-rating[_ngcontent-%COMP%]   .ratings-full[_ngcontent-%COMP%] {\n  margin-right: 0.8rem;\n}\n\n.ratings-full[_ngcontent-%COMP%] {\n  cursor: pointer;\n  margin-right: 0.5rem;\n}\n\n.ratings-full[_ngcontent-%COMP%], .ratings[_ngcontent-%COMP%] {\n  position: relative;\n  font-family: \"wolmart\";\n  letter-spacing: 0.2em;\n}\n\n.ratings-full[_ngcontent-%COMP%]::before {\n  content: \"\\e986\" \"\\e986\" \"\\e986\" \"\\e986\" \"\\e986\";\n  color: rgba(0, 0, 0, 0.16);\n  white-space: nowrap;\n}\n\n.ratings[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  white-space: nowrap;\n  overflow: hidden;\n}\n\n.ratings-full[_ngcontent-%COMP%], .ratings[_ngcontent-%COMP%] {\n  position: relative;\n  font-family: \"gdx\";\n  letter-spacing: 0.2em;\n}\n\n.rating-reviews[_ngcontent-%COMP%] {\n  margin: 2px 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  text-transform: capitalize;\n  font-size: 1.2rem;\n  color: #aaa;\n}\n\n.ratings-value[_ngcontent-%COMP%] {\n  margin-bottom: 1.6rem;\n  font-size: 1.4rem;\n}\n\n.ratings-list[_ngcontent-%COMP%]   .ratings-container[_ngcontent-%COMP%] {\n  margin-bottom: 0.5rem;\n}\n\n.ratings-value[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:first-child {\n  margin-right: 2.1rem;\n  font-size: 2.5rem;\n}\n\n.text-dark[_ngcontent-%COMP%] {\n  color: #333 !important;\n}\n\n.font-weight-bold[_ngcontent-%COMP%] {\n  font-weight: 600 !important;\n}\n\n.ratings-value[_ngcontent-%COMP%]   .count[_ngcontent-%COMP%] {\n  margin-left: 0.6rem;\n  font-size: 1.2rem;\n  color: #aaa;\n}\n\n.ratings-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  line-height: 1;\n  margin-bottom: 0.6rem;\n  font-size: 1.2rem;\n}\n\n.ratings-list[_ngcontent-%COMP%]   .progress-bar[_ngcontent-%COMP%] {\n  max-width: 26rem;\n  margin-left: 1.3rem;\n  margin-bottom: 8px;\n  border-radius: 0.4rem;\n}\n\n.progress-bar.progress-bar-sm[_ngcontent-%COMP%] {\n  height: 0.8rem;\n}\n\n.progress-bar[_ngcontent-%COMP%] {\n  background-color: #eee;\n  margin-bottom: 1rem;\n  height: 1rem;\n  width: 100%;\n}\n\n.progress-bar[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: block;\n  height: 100%;\n  background-color: #999;\n}\n\n.ratings-value-text[_ngcontent-%COMP%] {\n  margin-bottom: 1.6rem;\n  font-size: 14px;\n}\n\n.avg-rating2[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  font-size: 18px;\n  line-height: 1.4;\n}\n\n.ratings-full-value[_ngcontent-%COMP%] {\n  white-space: nowrap;\n  width: 78px;\n  position: relative;\n  top: -5px;\n}\n\nmark[_ngcontent-%COMP%] {\n  padding: 0.2em;\n  background-color: #fff;\n  margin-left: 8px;\n  position: relative;\n  top: -4px;\n}\n\np[_ngcontent-%COMP%] {\n  font-size: 1rem;\n}\n\n.rating-reviews[_ngcontent-%COMP%] {\n  font-size: 1rem;\n}\n\n.product-tab-links[_ngcontent-%COMP%] {\n  color: #339bb9 !important;\n}\n\n.product-tab-links[_ngcontent-%COMP%]:hover {\n  color: #004154 !important;\n}\n\n.py-2[_ngcontent-%COMP%] {\n  padding-top: 1rem !important;\n  padding-bottom: 1rem !important;\n}\n\n.sample-data-table[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-top: 20px;\n}\n\n.sample-data-table[_ngcontent-%COMP%]   .sample-title[_ngcontent-%COMP%] {\n  font-weight: bold;\n  color: #3d464d;\n  font-size: 1.3rem;\n}\n\n.sample-data-table[_ngcontent-%COMP%]   .sample-text-link[_ngcontent-%COMP%] {\n  cursor: pointer;\n  text-decoration: none;\n  transition: color 0.15s ease-in-out;\n}\n\n.sample-data-table[_ngcontent-%COMP%]   .sample-text-link[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n\n.sample-data-table[_ngcontent-%COMP%]   .pos-absolute[_ngcontent-%COMP%] {\n  position: relative;\n}\n\n.sample-data-table[_ngcontent-%COMP%]   .close-popover[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 9;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb2R1Y3QtdGFicy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtFQUNJLGNBQUE7RUFDQSxnQkFBQTtFQUNBLGNBQUE7RUFDQSx3QkFBQTtFQUNBLGNBQUE7RUFDQSxnQkFBQTtBQUFKOztBQUVBO0VBQ0ksa0NBQUE7QUFDSjs7QUFDQTtFQUNJLDJCQUFBO0FBRUo7O0FBQUE7RUFDSSxlQUFBO0VBQ0EsZ0JBQUE7QUFHSjs7QUFBQTtFQUNJLGlCQUFBO0VBQ0EsZ0JBQUE7QUFHSjs7QUFEQTtFQUNJLGlCQUFBO0FBSUo7O0FBRkE7RUFDSSxnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsaUJBQUE7RUFDQSxjQUFBO0FBS0o7O0FBSEE7RUFDSSxzQkFBQTtBQU1KOztBQUpBO0VBQ0ksZ0NBQUE7QUFPSjs7QUFKQTtFQUdJLGFBQUE7RUFHQSxtQkFBQTtFQUNBLGVBQUE7RUFDQSxxQkFBQTtBQU9KOztBQUpBO0VBQ0ksY0FBQTtFQUNBLGdCQUFBO0VBQ0EsY0FBQTtFQUNBLHdCQUFBO0VBQ0EsY0FBQTtFQUNBLGdCQUFBO0FBT0o7O0FBSkE7RUFDSSxtQkFBQTtBQU9KOztBQUpBO0VBQ0kscUJBQUE7QUFPSjs7QUFMQTtFQUdJLGFBQUE7RUFHQSxtQkFBQTtFQUNBLGNBQUE7RUFDQSxxQkFBQTtFQUNBLGlCQUFBO0FBUUo7O0FBTEE7RUFDSSxvQkFBQTtBQVFKOztBQUxBO0VBQ0ksZUFBQTtFQUNBLG9CQUFBO0FBUUo7O0FBTkE7RUFDSSxrQkFBQTtFQUNBLHNCQUFBO0VBQ0EscUJBQUE7QUFTSjs7QUFOQTtFQUNJLGdEQUFBO0VBQ0EsMEJBQUE7RUFDQSxtQkFBQTtBQVNKOztBQU5BO0VBQ0ksa0JBQUE7RUFDQSxNQUFBO0VBQ0EsT0FBQTtFQUNBLG1CQUFBO0VBQ0EsZ0JBQUE7QUFTSjs7QUFQQTtFQUNJLGtCQUFBO0VBQ0Esa0JBQUE7RUFDQSxxQkFBQTtBQVVKOztBQVBBO0VBQ0ksYUFBQTtFQUNBLG1CQUFBO0VBQ0EsZ0JBQUE7RUFDQSx1QkFBQTtFQUNBLDBCQUFBO0VBQ0EsaUJBQUE7RUFDQSxXQUFBO0FBVUo7O0FBUEE7RUFDSSxxQkFBQTtFQUNBLGlCQUFBO0FBVUo7O0FBUEE7RUFDSSxxQkFBQTtBQVVKOztBQVBBO0VBQ0ksb0JBQUE7RUFDQSxpQkFBQTtBQVVKOztBQVBBO0VBQ0ksc0JBQUE7QUFVSjs7QUFQQTtFQUNJLDJCQUFBO0FBVUo7O0FBUEE7RUFDSSxtQkFBQTtFQUNBLGlCQUFBO0VBQ0EsV0FBQTtBQVVKOztBQVBBO0VBR0ksYUFBQTtFQUdBLG1CQUFBO0VBQ0EsY0FBQTtFQUNBLHFCQUFBO0VBQ0EsaUJBQUE7QUFVSjs7QUFQQTtFQUNJLGdCQUFBO0VBQ0EsbUJBQUE7RUFDQSxrQkFBQTtFQUNBLHFCQUFBO0FBVUo7O0FBUkE7RUFDSSxjQUFBO0FBV0o7O0FBVEE7RUFDSSxzQkFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLFdBQUE7QUFZSjs7QUFUQTtFQUNJLGNBQUE7RUFDQSxZQUFBO0VBQ0Esc0JBQUE7QUFZSjs7QUFUQTtFQUNJLHFCQUFBO0VBQ0EsZUFBQTtBQVlKOztBQVRBO0VBQ0ksZUFBQTtFQUNBLGdCQUFBO0FBWUo7O0FBVEE7RUFDSSxtQkFBQTtFQUNBLFdBQUE7RUFDQSxrQkFBQTtFQUNBLFNBQUE7QUFZSjs7QUFUQTtFQUNJLGNBQUE7RUFDQSxzQkFBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSxTQUFBO0FBWUo7O0FBVEE7RUFDSSxlQUFBO0FBWUo7O0FBVEE7RUFDSSxlQUFBO0FBWUo7O0FBVEE7RUFDSSx5QkFBQTtBQVlKOztBQVRBO0VBQ0kseUJBQUE7QUFZSjs7QUFUQTtFQUNJLDRCQUFBO0VBQ0EsK0JBQUE7QUFZSjs7QUFUQTtFQUNJLFdBQUE7RUFDQSxnQkFBQTtBQVlKOztBQVZJO0VBQ0ksaUJBQUE7RUFDQSxjQUFBO0VBQ0EsaUJBQUE7QUFZUjs7QUFUSTtFQUNJLGVBQUE7RUFDQSxxQkFBQTtFQUNBLG1DQUFBO0FBV1I7O0FBVlE7RUFBVSwwQkFBQTtBQWFsQjs7QUFWSTtFQUFnQixrQkFBQTtBQWFwQjs7QUFYSTtFQUNJLGVBQUE7RUFDQSxNQUFBO0VBQVEsT0FBQTtFQUNSLFdBQUE7RUFBYSxZQUFBO0VBQ2IsVUFBQTtBQWVSIiwiZmlsZSI6InByb2R1Y3QtdGFicy5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLmF2Zy1tYXJrIHtcbiAgICBmb250LXNpemU6IDZlbTtcbiAgICBmb250LXdlaWdodDogNjAwO1xuICAgIGNvbG9yOiAjMzM2Njk5O1xuICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMjVlbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xufVxuLmxzLTUwIHtcbiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDVlbSAhaW1wb3J0YW50O1xufVxuLmZvbnQtd2VpZ2h0LWJvbGRlciB7XG4gICAgZm9udC13ZWlnaHQ6IDcwMCAhaW1wb3J0YW50O1xufVxuaDQge1xuICAgIGZvbnQtc2l6ZTogNjRweDtcbiAgICBmb250LXdlaWdodDogNzAwO1xufSBcblxuLmF2Zy1yYXRpbmcgcCB7XG4gICAgZm9udC1zaXplOiAxLjRyZW07XG4gICAgbGluZS1oZWlnaHQ6IDEuNDtcbn1cbnAge1xuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xufVxuLnRhYi1wYW5lIHAge1xuICAgIG1hcmdpbi1ib3R0b206IDA7XG4gICAgZm9udC1zaXplOiBpbmhlcml0O1xuICAgIGxldHRlci1zcGFjaW5nOiAwO1xuICAgIGxpbmUtaGVpZ2h0OiAyO1xufVxuLnRleHQtZGFyayB7XG4gICAgY29sb3I6ICMzMzMgIWltcG9ydGFudDtcbn1cbi5tYi0xIHtcbiAgICBtYXJnaW4tYm90dG9tOiAwLjVyZW0gIWltcG9ydGFudDtcbn1cblxuLmF2Zy1yYXRpbmctY29udGFpbmVyIHtcbiAgICBkaXNwbGF5OiAtd2Via2l0LWJveDtcbiAgICBkaXNwbGF5OiAtbXMtZmxleGJveDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIC13ZWJraXQtYm94LWFsaWduOiBjZW50ZXI7XG4gICAgLW1zLWZsZXgtYWxpZ246IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGZvbnQtc2l6ZTogMXJlbTtcbiAgICBtYXJnaW4tYm90dG9tOiAwLjJyZW07XG59XG5cbi5hdmctbWFyayB7XG4gICAgZm9udC1zaXplOiA2ZW07XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICBjb2xvcjogI2NjMzMzMztcbiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDI1ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgbWFyZ2luLWJvdHRvbTogMDtcbn1cblxuLmF2Zy1yYXRpbmcge1xuICAgIG1hcmdpbi1sZWZ0OiAxLjhyZW07XG59XG5cbi5hdmctcmF0aW5nIC5yYXRpbmdzLWNvbnRhaW5lciB7XG4gICAgbWFyZ2luLWJvdHRvbTogMC4zcmVtO1xufVxuLnJhdGluZ3MtY29udGFpbmVyIHtcbiAgICBkaXNwbGF5OiAtd2Via2l0LWJveDtcbiAgICBkaXNwbGF5OiAtbXMtZmxleGJveDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIC13ZWJraXQtYm94LWFsaWduOiBjZW50ZXI7XG4gICAgLW1zLWZsZXgtYWxpZ246IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIG1hcmdpbi1ib3R0b206IDAuNnJlbTtcbiAgICBmb250LXNpemU6IDEuMnJlbTtcbn1cblxuLmF2Zy1yYXRpbmcgLnJhdGluZ3MtZnVsbCB7XG4gICAgbWFyZ2luLXJpZ2h0OiAwLjhyZW07XG59XG5cbi5yYXRpbmdzLWZ1bGwge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBtYXJnaW4tcmlnaHQ6IDAuNXJlbTtcbn1cbi5yYXRpbmdzLWZ1bGwsIC5yYXRpbmdzIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgZm9udC1mYW1pbHk6IFwid29sbWFydFwiO1xuICAgIGxldHRlci1zcGFjaW5nOiAwLjJlbTtcbn1cblxuLnJhdGluZ3MtZnVsbDo6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIu6mhlwiIFwi7qaGXCIgXCLupoZcIiBcIu6mhlwiIFwi7qaGXCI7XG4gICAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xNik7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbn1cblxuLnJhdGluZ3Mge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0b3A6IDA7XG4gICAgbGVmdDogMDtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG59XG4ucmF0aW5ncy1mdWxsLCAucmF0aW5ncyB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIGZvbnQtZmFtaWx5OiBcImdkeFwiO1xuICAgIGxldHRlci1zcGFjaW5nOiAwLjJlbTtcbn1cblxuLnJhdGluZy1yZXZpZXdzIHtcbiAgICBtYXJnaW46IDJweCAwO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTtcbiAgICBmb250LXNpemU6IDEuMnJlbTtcbiAgICBjb2xvcjogI2FhYTtcbn1cblxuLnJhdGluZ3MtdmFsdWUge1xuICAgIG1hcmdpbi1ib3R0b206IDEuNnJlbTtcbiAgICBmb250LXNpemU6IDEuNHJlbTtcbn1cblxuLnJhdGluZ3MtbGlzdCAucmF0aW5ncy1jb250YWluZXIge1xuICAgIG1hcmdpbi1ib3R0b206IDAuNXJlbTtcbn1cblxuLnJhdGluZ3MtdmFsdWUgc3BhbjpmaXJzdC1jaGlsZCB7XG4gICAgbWFyZ2luLXJpZ2h0OiAyLjFyZW07XG4gICAgZm9udC1zaXplOiAyLjVyZW07XG59XG5cbi50ZXh0LWRhcmsge1xuICAgIGNvbG9yOiAjMzMzICFpbXBvcnRhbnQ7XG59XG5cbi5mb250LXdlaWdodC1ib2xkIHtcbiAgICBmb250LXdlaWdodDogNjAwICFpbXBvcnRhbnQ7XG59XG5cbi5yYXRpbmdzLXZhbHVlIC5jb3VudCB7XG4gICAgbWFyZ2luLWxlZnQ6IDAuNnJlbTtcbiAgICBmb250LXNpemU6IDEuMnJlbTtcbiAgICBjb2xvcjogI2FhYTtcbn1cblxuLnJhdGluZ3MtY29udGFpbmVyIHtcbiAgICBkaXNwbGF5OiAtd2Via2l0LWJveDtcbiAgICBkaXNwbGF5OiAtbXMtZmxleGJveDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIC13ZWJraXQtYm94LWFsaWduOiBjZW50ZXI7XG4gICAgLW1zLWZsZXgtYWxpZ246IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIG1hcmdpbi1ib3R0b206IDAuNnJlbTtcbiAgICBmb250LXNpemU6IDEuMnJlbTtcbn1cblxuLnJhdGluZ3MtbGlzdCAucHJvZ3Jlc3MtYmFyIHtcbiAgICBtYXgtd2lkdGg6IDI2cmVtO1xuICAgIG1hcmdpbi1sZWZ0OiAxLjNyZW07XG4gICAgbWFyZ2luLWJvdHRvbTogOHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDAuNHJlbTtcbn1cbi5wcm9ncmVzcy1iYXIucHJvZ3Jlc3MtYmFyLXNtIHtcbiAgICBoZWlnaHQ6IDAuOHJlbTtcbn1cbi5wcm9ncmVzcy1iYXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNlZWU7XG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbiAgICBoZWlnaHQ6IDFyZW07XG4gICAgd2lkdGg6IDEwMCU7XG59XG5cbi5wcm9ncmVzcy1iYXIgc3BhbiB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIGJhY2tncm91bmQtY29sb3I6ICM5OTk7XG59XG5cbi5yYXRpbmdzLXZhbHVlLXRleHQge1xuICAgIG1hcmdpbi1ib3R0b206IDEuNnJlbTtcbiAgICBmb250LXNpemU6IDE0cHg7XG59XG5cbi5hdmctcmF0aW5nMiBwIHtcbiAgICBmb250LXNpemU6IDE4cHg7XG4gICAgbGluZS1oZWlnaHQ6IDEuNDtcbn1cblxuLnJhdGluZ3MtZnVsbC12YWx1ZSB7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICB3aWR0aDogNzhweDtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgdG9wOiAtNXB4O1xufVxuXG5tYXJrIHtcbiAgICBwYWRkaW5nOiAwLjJlbTtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xuICAgIG1hcmdpbi1sZWZ0OiA4cHg7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHRvcDogLTRweDtcbn1cblxucCB7XG4gICAgZm9udC1zaXplOiAxcmVtO1xufVxuXG4ucmF0aW5nLXJldmlld3Mge1xuICAgIGZvbnQtc2l6ZTogMXJlbTtcbn1cblxuLnByb2R1Y3QtdGFiLWxpbmtzIHtcbiAgICBjb2xvcjogIzMzOWJiOSAhaW1wb3J0YW50O1xufVxuXG4ucHJvZHVjdC10YWItbGlua3M6aG92ZXIge1xuICAgIGNvbG9yOiAjMDA0MTU0ICFpbXBvcnRhbnQ7XG59XG5cbi5weS0yIHtcbiAgICBwYWRkaW5nLXRvcDogMXJlbSAhaW1wb3J0YW50O1xuICAgIHBhZGRpbmctYm90dG9tOiAxcmVtICFpbXBvcnRhbnQ7XG59XG5cbi5zYW1wbGUtZGF0YS10YWJsZSB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgbWFyZ2luLXRvcDogMjBweDtcbiAgICBcbiAgICAuc2FtcGxlLXRpdGxlIHtcbiAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgIGNvbG9yOiAjM2Q0NjRkO1xuICAgICAgICBmb250LXNpemU6IDEuM3JlbTtcbiAgICB9XG5cbiAgICAuc2FtcGxlLXRleHQtbGluayB7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICB0cmFuc2l0aW9uOiBjb2xvciAwLjE1cyBlYXNlLWluLW91dDtcbiAgICAgICAgJjpob3ZlciB7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyB9XG4gICAgfVxuXG4gICAgLnBvcy1hYnNvbHV0ZSB7IHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxuXG4gICAgLmNsb3NlLXBvcG92ZXIge1xuICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgIHRvcDogMDsgbGVmdDogMDtcbiAgICAgICAgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTtcbiAgICAgICAgei1pbmRleDogOTtcbiAgICB9XG59Il19 */"] });


/***/ }),

/***/ 60052:
/*!******************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/components/products-view/products-view.component.ts ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProductsViewComponent": () => (/* binding */ ProductsViewComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ 92218);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs/operators */ 85921);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/operators */ 59151);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rxjs/operators */ 44661);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/forms */ 90587);
/* harmony import */ var _shared_api_shop_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/api/shop.service */ 32053);
/* harmony import */ var _services_shop_sidebar_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/shop-sidebar.service */ 92720);
/* harmony import */ var _services_page_marketplace_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/page-marketplace.service */ 43779);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_components_icon_icon_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/components/icon/icon.component */ 61718);
/* harmony import */ var _shared_components_product_card_product_card_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../@shared/components/product-card/product-card.component */ 15350);
/* harmony import */ var _shared_components_pagination_pagination_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../@shared/components/pagination/pagination.component */ 19363);













function ProductsViewComponent_div_3_span_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "span", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r2.filtersCount);
  }
}

function ProductsViewComponent_div_3_div_47_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](1, "app-product-card", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const product_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("product", product_r4);
  }
}

const _c0 = function (a0, a1) {
  return {
    "view-options--offcanvas--always": a0,
    "view-options--offcanvas--mobile": a1
  };
};

const _c1 = function (a0) {
  return {
    "layout-switcher__button--active": a0
  };
};

function ProductsViewComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "button", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function ProductsViewComponent_div_3_Template_button_click_4_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r6);
      const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return ctx_r5.sidebar.open();
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](5, "app-icon", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7, "Filters");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](8, ProductsViewComponent_div_3_span_8_Template, 2, 1, "span", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](9, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](11, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function ProductsViewComponent_div_3_Template_button_click_12_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r6);
      const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return ctx_r7.setViewMode("grid-4-full");
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](13, "app-icon", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "button", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function ProductsViewComponent_div_3_Template_button_click_14_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r6);
      const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return ctx_r8.setViewMode("grid-with-features");
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](15, "app-icon", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](16, "button", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function ProductsViewComponent_div_3_Template_button_click_16_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r6);
      const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return ctx_r9.setLayout("list");
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](17, "app-icon", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](18, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](20, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](21, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "label", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23, "Sort By");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](25, "select", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](26, "option", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](27, "Default");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](28, "option", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](29, "Name (A-Z)");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](30, "option", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](31, "Name (Z-A)");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](32, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](33, "label", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](34, "Show");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](35, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](36, "select", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](37, "option", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](38, "12");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](39, "option", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](40, "24");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](41, "option", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](42, "48");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](43, "option", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](44, "96");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](45, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](46, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](47, ProductsViewComponent_div_3_div_47_Template, 2, 1, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](48, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](49, "app-pagination", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction2"](13, _c0, ctx_r0.offcanvas === "always", ctx_r0.offcanvas === "mobile"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx_r0.filtersCount > 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](16, _c1, ctx_r0.grid === "grid-4-full"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](18, _c1, ctx_r0.layout === "grid-with-features"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](20, _c1, ctx_r0.layout === "list"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate3"](" Showing ", ctx_r0.pageService.from, " - ", ctx_r0.pageService.to, " of ", ctx_r0.pageService.total, " results ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵattribute"]("data-layout", ctx_r0.layout != "list" ? ctx_r0.grid : ctx_r0.layout)("data-with-features", ctx_r0.layout == "grid-with-features" ? "true" : "false");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r0.pageService.items);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("siblings", 2)("total", ctx_r0.pageService.pages);
  }
}

function ProductsViewComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2, "No matching items");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "div", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4, "Try resetting the filters");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "button", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function ProductsViewComponent_div_4_Template_button_click_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r11);
      const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return ctx_r10.resetFilters();
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](6, "Reset filters");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
}

const _c2 = function (a0) {
  return {
    "products-view--loading": a0
  };
};

class ProductsViewComponent {
  constructor(fb, shop, sidebar, pageService) {
    this.fb = fb;
    this.shop = shop;
    this.sidebar = sidebar;
    this.pageService = pageService;
    this.layout = 'grid';
    this.grid = 'grid-3-sidebar';
    this.offcanvas = 'mobile';
    this.domainSlug = null;
    this.gridChange = new _angular_core__WEBPACK_IMPORTED_MODULE_6__.EventEmitter();
    this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_7__.Subject();
    this.filtersCount = 0;
  }

  ngOnInit() {
    // -------------------------------------------------
    // Toolbar form
    // -------------------------------------------------
    this.listOptionsForm = this.fb.group({
      page: this.fb.control(this.pageService.options.page || 1),
      limit: this.fb.control(this.pageService.options.limit || 12),
      sort: this.fb.control(this.pageService.options.sort || 'default')
    }); // -------------------------------------------------
    // Pagination / limit / sorting
    // -------------------------------------------------

    this.listOptionsForm.valueChanges.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_8__.takeUntil)(this.destroy$)).subscribe(value => {
      this.pageService.updateOptions({
        page: Number(value.page || 1),
        limit: Number(value.limit || 12),
        sort: value.sort || 'default'
      });
    }); // -------------------------------------------------
    // IMPORTANT:
    // Reload products whenever options change.
    //
    // This includes filterValues coming from
    // WidgetFiltersComponent.
    // -------------------------------------------------

    this.pageService.optionsChange$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_8__.takeUntil)(this.destroy$)).subscribe(options => {
      console.log('OPTIONS CHANGED:', options);
      this.loadProducts(options);
    }); // -------------------------------------------------
    // Listen for returned product lists
    // -------------------------------------------------

    this.pageService.list$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_9__.filter)(value => value !== null), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_8__.takeUntil)(this.destroy$)).subscribe(list => {
      console.log('PRODUCT LIST UPDATED:', list);
      /*
       * Count selected filter groups.
       */

      this.filtersCount = Object.values(list.filterValues || {}).filter(value => typeof value === 'string' && value.trim() !== '').length;
      /*
       * Update toolbar without triggering
       * another product request.
       */

      this.listOptionsForm.patchValue({
        page: list.page || 1,
        limit: list.limit || 12,
        sort: list.sort || 'default'
      }, {
        emitEvent: false
      });
    }); // -------------------------------------------------
    // Initial marketplace load
    // -------------------------------------------------

    this.loadProducts(this.pageService.options);
  } // =====================================================
  // Load products
  // =====================================================


  loadProducts(options) {
    console.log('LOADING PRODUCTS WITH OPTIONS:', options);
    console.log('LOADING PRODUCTS WITH FILTERS:', options.filterValues);
    this.pageService.setIsLoading(true);
    this.shop.getShopProductsList(this.domainSlug, options).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_8__.takeUntil)(this.destroy$), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_10__.finalize)(() => {
      this.pageService.setIsLoading(false);
    })).subscribe({
      next: list => {
        console.log('PRODUCT LOAD RESULT:', list);
        console.log('PRODUCT LOAD TOTAL:', list.total);
        this.pageService.setList(list);
      },
      error: error => {
        console.error('PRODUCT LOAD ERROR:', error);
      }
    });
  } // =====================================================
  // Destroy
  // =====================================================


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  } // =====================================================
  // Layout
  // =====================================================


  setLayout(value) {
    this.layout = value;
  }

  setGrid(value) {
    this.grid = value;
  }

  setViewMode(mode) {
    if (mode === 'grid-4-full') {
      this.grid = 'grid-4-full';
      this.layout = 'grid';
    } else {
      this.grid = 'grid-3-sidebar';
      this.layout = 'grid-with-features';
    }

    this.gridChange.emit(this.grid);
  } // =====================================================
  // Filters
  // =====================================================


  resetFilters() {
    this.pageService.resetFilters();
  }

}

ProductsViewComponent.ɵfac = function ProductsViewComponent_Factory(t) {
  return new (t || ProductsViewComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_11__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_shared_api_shop_service__WEBPACK_IMPORTED_MODULE_0__.ShopService), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_shop_sidebar_service__WEBPACK_IMPORTED_MODULE_1__.ShopSidebarService), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_page_marketplace_service__WEBPACK_IMPORTED_MODULE_2__.PageMarketplaceService));
};

ProductsViewComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineComponent"]({
  type: ProductsViewComponent,
  selectors: [["app-products-view"]],
  inputs: {
    layout: "layout",
    grid: "grid",
    offcanvas: "offcanvas",
    domainSlug: "domainSlug"
  },
  outputs: {
    gridChange: "gridChange"
  },
  decls: 5,
  vars: 8,
  consts: [[1, "products-view", 3, "ngClass", "formGroup"], [1, "products-view__loader"], ["class", "products-view__content", 4, "ngIf"], ["class", "products-view__empty", 4, "ngIf"], [1, "products-view__content"], [1, "products-view__options"], [1, "view-options", 3, "ngClass"], [1, "view-options__filters-button"], ["type", "button", 1, "filters-button", 3, "click"], ["name", "filters-16", "size", "16", 1, "filters-button__icon"], [1, "filters-button__title"], ["class", "filters-button__counter", 4, "ngIf"], [1, "view-options__layout"], [1, "layout-switcher"], [1, "layout-switcher__list"], ["title", "Grid 4 Columns", "type", "button", 1, "layout-switcher__button", 3, "ngClass", "click"], ["name", "layout-grid-16x16", "size", "16"], ["title", "Grid With Features", "type", "button", 1, "layout-switcher__button", 3, "ngClass", "click"], ["name", "layout-grid-with-details-16x16", "size", "16"], ["title", "List", "type", "button", 1, "layout-switcher__button", 3, "ngClass", "click"], ["name", "layout-list-16x16", "size", "16"], [1, "view-options__legend"], [1, "view-options__divider"], [1, "view-options__control"], ["for", "view-options-sort"], ["id", "view-options-sort", "formControlName", "sort", 1, "form-control", "form-control-sm"], ["value", "default"], ["value", "name_asc"], ["value", "name_desc"], ["for", "view-options-limit"], ["id", "view-options-limit", "formControlName", "limit", 1, "form-control", "form-control-sm"], ["value", "12"], ["value", "24"], ["value", "48"], ["value", "96"], [1, "products-view__list", "products-list"], [1, "products-list__body"], ["class", "products-list__item", 4, "ngFor", "ngForOf"], [1, "products-view__pagination"], ["formControlName", "page", 3, "siblings", "total"], [1, "filters-button__counter"], [1, "products-list__item"], [3, "product"], [1, "products-view__empty"], [1, "products-view__empty-title"], [1, "products-view__empty-subtitle"], ["type", "button", 1, "btn", "btn-primary", "btn-sm", 3, "click"]],
  template: function ProductsViewComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](1, "async");
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "div", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](3, ProductsViewComponent_div_3_Template, 50, 22, "div", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](4, ProductsViewComponent_div_4_Template, 7, 0, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    }

    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](6, _c2, _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](1, 4, ctx.pageService.isLoading$)))("formGroup", ctx.listOptionsForm);
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.pageService.items == null ? null : ctx.pageService.items.length);
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", !(ctx.pageService.items == null ? null : ctx.pageService.items.length));
    }
  },
  directives: [_angular_common__WEBPACK_IMPORTED_MODULE_12__.NgClass, _angular_forms__WEBPACK_IMPORTED_MODULE_11__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_11__.FormGroupDirective, _angular_common__WEBPACK_IMPORTED_MODULE_12__.NgIf, _shared_components_icon_icon_component__WEBPACK_IMPORTED_MODULE_3__.IconComponent, _angular_forms__WEBPACK_IMPORTED_MODULE_11__.SelectControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_11__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_11__.FormControlName, _angular_forms__WEBPACK_IMPORTED_MODULE_11__.NgSelectOption, _angular_forms__WEBPACK_IMPORTED_MODULE_11__["ɵNgSelectMultipleOption"], _angular_common__WEBPACK_IMPORTED_MODULE_12__.NgForOf, _shared_components_product_card_product_card_component__WEBPACK_IMPORTED_MODULE_4__.ProductCardComponent, _shared_components_pagination_pagination_component__WEBPACK_IMPORTED_MODULE_5__.PaginationComponent],
  pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_12__.AsyncPipe],
  styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwcm9kdWN0cy12aWV3LmNvbXBvbmVudC5zY3NzIn0= */"]
});

/***/ }),

/***/ 71589:
/*!****************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/components/shop-sidebar/shop-sidebar.component.ts ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ShopSidebarComponent": () => (/* binding */ ShopSidebarComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 92218);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ 85921);
/* harmony import */ var _shared_functions_rxjs_fromMatchMedia__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/functions/rxjs/fromMatchMedia */ 48297);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_api_shop_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/api/shop.service */ 32053);
/* harmony import */ var _services_shop_sidebar_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/shop-sidebar.service */ 92720);
/* harmony import */ var _shared_components_icon_icon_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/components/icon/icon.component */ 61718);
/* harmony import */ var _widgets_widget_filters_widget_filters_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../widgets/widget-filters/widget-filters.component */ 69767);











const _c0 = function (a0, a1, a2) { return { "block-sidebar--offcanvas--always": a0, "block-sidebar--offcanvas--mobile": a1, "block-sidebar--open": a2 }; };
class ShopSidebarComponent {
    constructor(shop, sidebar, platformId) {
        this.shop = shop;
        this.sidebar = sidebar;
        this.platformId = platformId;
        this.offcanvas = 'mobile';
        this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_5__.Subject();
        this.isOpen = false;
    }
    ngOnInit() {
        // this.bestsellers$ = this.shop.getBestsellers().pipe(map(x => x.slice(0, 5)));
        this.sidebar.isOpen$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.takeUntil)(this.destroy$)).subscribe(isOpen => {
            if (isOpen) {
                this.open();
            }
            else {
                this.close();
            }
        });
        if ((0,_angular_common__WEBPACK_IMPORTED_MODULE_7__.isPlatformBrowser)(this.platformId)) {
            (0,_shared_functions_rxjs_fromMatchMedia__WEBPACK_IMPORTED_MODULE_0__.fromMatchMedia)('(max-width: 991px)').pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.takeUntil)(this.destroy$)).subscribe(media => {
                if (this.offcanvas === 'mobile' && this.isOpen && !media.matches) {
                    this.close();
                }
            });
        }
    }
    ngOnDestroy() {
        this.close();
        this.destroy$.next();
        this.destroy$.complete();
    }
    open() {
        if ((0,_angular_common__WEBPACK_IMPORTED_MODULE_7__.isPlatformBrowser)(this.platformId)) {
            const bodyWidth = document.body.offsetWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = (document.body.offsetWidth - bodyWidth) + 'px';
        }
        this.isOpen = true;
    }
    close() {
        if ((0,_angular_common__WEBPACK_IMPORTED_MODULE_7__.isPlatformBrowser)(this.platformId)) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        this.isOpen = false;
    }
}
ShopSidebarComponent.ɵfac = function ShopSidebarComponent_Factory(t) { return new (t || ShopSidebarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_shared_api_shop_service__WEBPACK_IMPORTED_MODULE_1__.ShopService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_services_shop_sidebar_service__WEBPACK_IMPORTED_MODULE_2__.ShopSidebarService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_8__.PLATFORM_ID)); };
ShopSidebarComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdefineComponent"]({ type: ShopSidebarComponent, selectors: [["app-shop-sidebar"]], inputs: { offcanvas: "offcanvas" }, decls: 10, vars: 6, consts: [[1, "block", "block-sidebar", 3, "ngClass"], [1, "block-sidebar__backdrop", 3, "click"], [1, "block-sidebar__body"], [1, "block-sidebar__header"], [1, "block-sidebar__title"], ["type", "button", 1, "block-sidebar__close", 3, "click"], ["name", "cross-20", "size", "20"], [1, "block-sidebar__item"], [3, "offcanvas"]], template: function ShopSidebarComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function ShopSidebarComponent_Template_div_click_1_listener() { return ctx.sidebar.close(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](5, "Filters");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](6, "button", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function ShopSidebarComponent_Template_button_click_6_listener() { return ctx.sidebar.close(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](7, "app-icon", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](8, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](9, "app-widget-filters", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction3"](2, _c0, ctx.offcanvas === "always", ctx.offcanvas === "mobile", ctx.isOpen));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("offcanvas", ctx.offcanvas);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.NgClass, _shared_components_icon_icon_component__WEBPACK_IMPORTED_MODULE_3__.IconComponent, _widgets_widget_filters_widget_filters_component__WEBPACK_IMPORTED_MODULE_4__.WidgetFiltersComponent], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzaG9wLXNpZGViYXIuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ 31641:
/*!***************************************************************!*\
  !*** ./src/app/@modules/marketplace/guards/checkout.guard.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CheckoutGuard": () => (/* binding */ CheckoutGuard)
/* harmony export */ });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ 86942);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_cart_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../@shared/services/cart.service */ 77535);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 52816);




class CheckoutGuard {
    constructor(cart, router) {
        this.cart = cart;
        this.router = router;
    }
    canActivate() {
        return this.cart.quantity$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.map)(quantity => {
            if (quantity) {
                return true;
            }
            this.router.navigateByUrl('/cart').then();
            return false;
        }));
    }
}
CheckoutGuard.ɵfac = function CheckoutGuard_Factory(t) { return new (t || CheckoutGuard)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_shared_services_cart_service__WEBPACK_IMPORTED_MODULE_0__.CartService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__.Router)); };
CheckoutGuard.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({ token: CheckoutGuard, factory: CheckoutGuard.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 56379:
/*!********************************************************************!*\
  !*** ./src/app/@modules/marketplace/marketplace-routing.module.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MarketplaceRoutingModule": () => (/* binding */ MarketplaceRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _pages_page_marketplace_page_marketplace_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pages/page-marketplace/page-marketplace.component */ 8678);
/* harmony import */ var _pages_page_cart_page_cart_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pages/page-cart/page-cart.component */ 37913);
/* harmony import */ var _pages_page_favorites_page_favorites_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/page-favorites/page-favorites.component */ 24913);
/* harmony import */ var _pages_page_checkout_page_checkout_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/page-checkout/page-checkout.component */ 97821);
/* harmony import */ var _pages_page_compare_page_compare_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/page-compare/page-compare.component */ 10266);
/* harmony import */ var _pages_page_track_order_page_track_order_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages/page-track-order/page-track-order.component */ 32542);
/* harmony import */ var _pages_page_product_page_product_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pages/page-product/page-product.component */ 11362);
/* harmony import */ var _pages_page_order_success_page_order_success_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pages/page-order-success/page-order-success.component */ 6239);
/* harmony import */ var _pages_page_request_form_page_request_form_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./pages/page-request-form/page-request-form.component */ 97065);
/* harmony import */ var _guards_checkout_guard__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./guards/checkout.guard */ 31641);
/* harmony import */ var _resolvers_products_list_resolver_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./resolvers/products-list-resolver.service */ 80704);
/* harmony import */ var _resolvers_marketplace_resolver_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./resolvers/marketplace-resolver.service */ 71813);
/* harmony import */ var _resolvers_product_resolver_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./resolvers/product-resolver.service */ 13022);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/core */ 3184);











// Resolvers





const marketplacePageData = {
    columns: 3,
    viewMode: 'list',
    sidebarPosition: 'start'
};
const marketplacePageResolvers = {
    marketplace: _resolvers_marketplace_resolver_service__WEBPACK_IMPORTED_MODULE_11__.MarketplaceResolverService,
    products: _resolvers_products_list_resolver_service__WEBPACK_IMPORTED_MODULE_10__.ProductsListResolverService
};
const routes = [
    {
        path: '',
        pathMatch: 'full',
        component: _pages_page_marketplace_page_marketplace_component__WEBPACK_IMPORTED_MODULE_0__.PageMarketplaceComponent,
        data: marketplacePageData,
        // resolve: domainPageResolvers,
    },
    {
        path: 'user/compare',
        component: _pages_page_compare_page_compare_component__WEBPACK_IMPORTED_MODULE_4__.PageCompareComponent
    },
    {
        path: 'user/favorites',
        component: _pages_page_favorites_page_favorites_component__WEBPACK_IMPORTED_MODULE_2__.PageFavoritesComponent
    },
    {
        path: 'product/request',
        component: _pages_page_request_form_page_request_form_component__WEBPACK_IMPORTED_MODULE_8__.PageRequestFormComponent,
    },
    {
        path: 'product/:productSlug',
        component: _pages_page_product_page_product_component__WEBPACK_IMPORTED_MODULE_6__.PageProductComponent,
        data: {
            layout: 'standard',
            sidebarPosition: 'start'
        },
        resolve: {
            product: _resolvers_product_resolver_service__WEBPACK_IMPORTED_MODULE_12__.ProductResolverService
        },
    },
    {
        path: 'order',
        children: [
            { path: 'cart', component: _pages_page_cart_page_cart_component__WEBPACK_IMPORTED_MODULE_1__.PageCartComponent },
            { path: 'cart/checkout', component: _pages_page_checkout_page_checkout_component__WEBPACK_IMPORTED_MODULE_3__.PageCheckoutComponent, canActivate: [_guards_checkout_guard__WEBPACK_IMPORTED_MODULE_9__.CheckoutGuard] },
            { path: 'cart/checkout/success', component: _pages_page_order_success_page_order_success_component__WEBPACK_IMPORTED_MODULE_7__.PageOrderSuccessComponent },
            { path: 'track-request', component: _pages_page_track_order_page_track_order_component__WEBPACK_IMPORTED_MODULE_5__.PageTrackOrderComponent }
        ]
    },
    {
        path: '',
        component: _pages_page_marketplace_page_marketplace_component__WEBPACK_IMPORTED_MODULE_0__.PageMarketplaceComponent,
        data: marketplacePageData,
        resolve: marketplacePageResolvers,
    }
];
class MarketplaceRoutingModule {
}
MarketplaceRoutingModule.ɵfac = function MarketplaceRoutingModule_Factory(t) { return new (t || MarketplaceRoutingModule)(); };
MarketplaceRoutingModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_13__["ɵɵdefineNgModule"]({ type: MarketplaceRoutingModule });
MarketplaceRoutingModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_13__["ɵɵdefineInjector"]({ imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule.forChild(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_13__["ɵɵsetNgModuleScope"](MarketplaceRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule] }); })();


/***/ }),

/***/ 6621:
/*!************************************************************!*\
  !*** ./src/app/@modules/marketplace/marketplace.module.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MarketplaceModule": () => (/* binding */ MarketplaceModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/forms */ 90587);
/* harmony import */ var ngx_owl_carousel_o__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ngx-owl-carousel-o */ 37297);
/* harmony import */ var _blocks_blocks_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../blocks/blocks.module */ 65955);
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../@shared/shared.module */ 32234);
/* harmony import */ var _marketplace_routing_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./marketplace-routing.module */ 56379);
/* harmony import */ var _widgets_widgets_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../widgets/widgets.module */ 85289);
/* harmony import */ var _components_products_view_products_view_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/products-view/products-view.component */ 60052);
/* harmony import */ var _components_product_tabs_product_tabs_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/product-tabs/product-tabs.component */ 62758);
/* harmony import */ var _components_shop_sidebar_shop_sidebar_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/shop-sidebar/shop-sidebar.component */ 71589);
/* harmony import */ var _pages_page_cart_page_cart_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pages/page-cart/page-cart.component */ 37913);
/* harmony import */ var _pages_page_marketplace_page_marketplace_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./pages/page-marketplace/page-marketplace.component */ 8678);
/* harmony import */ var _pages_page_checkout_page_checkout_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./pages/page-checkout/page-checkout.component */ 97821);
/* harmony import */ var _pages_page_compare_page_compare_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./pages/page-compare/page-compare.component */ 10266);
/* harmony import */ var _pages_page_product_page_product_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./pages/page-product/page-product.component */ 11362);
/* harmony import */ var _pages_page_track_order_page_track_order_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./pages/page-track-order/page-track-order.component */ 32542);
/* harmony import */ var _pages_page_favorites_page_favorites_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./pages/page-favorites/page-favorites.component */ 24913);
/* harmony import */ var _components_product_sidebar_product_sidebar_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./components/product-sidebar/product-sidebar.component */ 71619);
/* harmony import */ var _pages_page_order_success_page_order_success_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./pages/page-order-success/page-order-success.component */ 6239);
/* harmony import */ var _pages_page_request_form_page_request_form_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./pages/page-request-form/page-request-form.component */ 97065);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/core */ 3184);
// modules (angular)


// modules (third-party)

// modules




// components



// pages











class MarketplaceModule {
}
MarketplaceModule.ɵfac = function MarketplaceModule_Factory(t) { return new (t || MarketplaceModule)(); };
MarketplaceModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_17__["ɵɵdefineNgModule"]({ type: MarketplaceModule });
MarketplaceModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_17__["ɵɵdefineInjector"]({ imports: [[
            // modules (angular)
            _angular_common__WEBPACK_IMPORTED_MODULE_18__.CommonModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_19__.FormsModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_19__.ReactiveFormsModule,
            // modules (third-party)
            ngx_owl_carousel_o__WEBPACK_IMPORTED_MODULE_20__.CarouselModule,
            // modules
            _blocks_blocks_module__WEBPACK_IMPORTED_MODULE_0__.BlocksModule,
            _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule,
            _marketplace_routing_module__WEBPACK_IMPORTED_MODULE_2__.MarketplaceRoutingModule,
            _widgets_widgets_module__WEBPACK_IMPORTED_MODULE_3__.WidgetsModule,
            // TranslateModule,
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_17__["ɵɵsetNgModuleScope"](MarketplaceModule, { declarations: [
        // components
        _components_products_view_products_view_component__WEBPACK_IMPORTED_MODULE_4__.ProductsViewComponent,
        _components_product_tabs_product_tabs_component__WEBPACK_IMPORTED_MODULE_5__.ProductTabsComponent,
        _components_shop_sidebar_shop_sidebar_component__WEBPACK_IMPORTED_MODULE_6__.ShopSidebarComponent,
        // pages
        _pages_page_cart_page_cart_component__WEBPACK_IMPORTED_MODULE_7__.PageCartComponent,
        _pages_page_marketplace_page_marketplace_component__WEBPACK_IMPORTED_MODULE_8__.PageMarketplaceComponent,
        _pages_page_checkout_page_checkout_component__WEBPACK_IMPORTED_MODULE_9__.PageCheckoutComponent,
        _pages_page_compare_page_compare_component__WEBPACK_IMPORTED_MODULE_10__.PageCompareComponent,
        _pages_page_product_page_product_component__WEBPACK_IMPORTED_MODULE_11__.PageProductComponent,
        _pages_page_track_order_page_track_order_component__WEBPACK_IMPORTED_MODULE_12__.PageTrackOrderComponent,
        _pages_page_favorites_page_favorites_component__WEBPACK_IMPORTED_MODULE_13__.PageFavoritesComponent,
        _components_product_sidebar_product_sidebar_component__WEBPACK_IMPORTED_MODULE_14__.ProductSidebarComponent,
        _pages_page_order_success_page_order_success_component__WEBPACK_IMPORTED_MODULE_15__.PageOrderSuccessComponent,
        _pages_page_request_form_page_request_form_component__WEBPACK_IMPORTED_MODULE_16__.PageRequestFormComponent], imports: [
        // modules (angular)
        _angular_common__WEBPACK_IMPORTED_MODULE_18__.CommonModule,
        _angular_forms__WEBPACK_IMPORTED_MODULE_19__.FormsModule,
        _angular_forms__WEBPACK_IMPORTED_MODULE_19__.ReactiveFormsModule,
        // modules (third-party)
        ngx_owl_carousel_o__WEBPACK_IMPORTED_MODULE_20__.CarouselModule,
        // modules
        _blocks_blocks_module__WEBPACK_IMPORTED_MODULE_0__.BlocksModule,
        _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule,
        _marketplace_routing_module__WEBPACK_IMPORTED_MODULE_2__.MarketplaceRoutingModule,
        _widgets_widgets_module__WEBPACK_IMPORTED_MODULE_3__.WidgetsModule], exports: [
        // components
        _components_products_view_products_view_component__WEBPACK_IMPORTED_MODULE_4__.ProductsViewComponent,
        _components_product_tabs_product_tabs_component__WEBPACK_IMPORTED_MODULE_5__.ProductTabsComponent,
        _components_shop_sidebar_shop_sidebar_component__WEBPACK_IMPORTED_MODULE_6__.ShopSidebarComponent,
        // pages
        _pages_page_cart_page_cart_component__WEBPACK_IMPORTED_MODULE_7__.PageCartComponent,
        _pages_page_marketplace_page_marketplace_component__WEBPACK_IMPORTED_MODULE_8__.PageMarketplaceComponent,
        _pages_page_checkout_page_checkout_component__WEBPACK_IMPORTED_MODULE_9__.PageCheckoutComponent,
        _pages_page_compare_page_compare_component__WEBPACK_IMPORTED_MODULE_10__.PageCompareComponent,
        _pages_page_product_page_product_component__WEBPACK_IMPORTED_MODULE_11__.PageProductComponent,
        _pages_page_track_order_page_track_order_component__WEBPACK_IMPORTED_MODULE_12__.PageTrackOrderComponent,
        _pages_page_favorites_page_favorites_component__WEBPACK_IMPORTED_MODULE_13__.PageFavoritesComponent,
        _components_product_sidebar_product_sidebar_component__WEBPACK_IMPORTED_MODULE_14__.ProductSidebarComponent,
        _pages_page_order_success_page_order_success_component__WEBPACK_IMPORTED_MODULE_15__.PageOrderSuccessComponent,
        _pages_page_request_form_page_request_form_component__WEBPACK_IMPORTED_MODULE_16__.PageRequestFormComponent] }); })();


/***/ }),

/***/ 37913:
/*!*****************************************************************************!*\
  !*** ./src/app/@modules/marketplace/pages/page-cart/page-cart.component.ts ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageCartComponent": () => (/* binding */ PageCartComponent)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/forms */ 90587);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs */ 92218);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/operators */ 85921);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rxjs/operators */ 86942);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_cart_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/services/cart.service */ 77535);
/* harmony import */ var _shared_services_root_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/services/root.service */ 36603);
/* harmony import */ var _shared_services_offcanvas_request_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../@shared/services/offcanvas-request.service */ 83977);
/* harmony import */ var _shared_services_offcanvas_dar_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/services/offcanvas-dar.service */ 50742);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_components_product_components_request_access_request_access_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../@shared/components/product/components/request-access/request-access.component */ 27969);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_pipes_currency_format_pipe__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../@shared/pipes/currency-format.pipe */ 82543);













function PageCartComponent_app_header_request_access_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](0, "app-header-request-access", 4);
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("product", ctx_r0.product);
} }
function PageCartComponent_app_header_request_access_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](0, "app-header-request-access", 4);
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("product", ctx_r1.selectedItem == null ? null : ctx_r1.selectedItem.product);
} }
function PageCartComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4, "Your shopping cart is empty!");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "a", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](7, "Continue");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("routerLink", ctx_r2.root.shop());
} }
function PageCartComponent_div_4_div_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "Products and Data Access Requests cannot be checked out together.");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3, " Remove one cart type to continue.");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} }
function PageCartComponent_div_4_div_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "Only one Data Access Request can be checked out at a time.");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} }
function PageCartComponent_div_4_div_14_tr_23_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "img", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const item_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("src", ctx_r14.getProductImage(item_r13.cartItem.product), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵsanitizeUrl"]);
} }
function PageCartComponent_div_4_div_14_tr_23_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](0, "img", 37);
} }
function PageCartComponent_div_4_div_14_tr_23_ng_container_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const item_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r13.cartItem.product.name);
} }
function PageCartComponent_div_4_div_14_tr_23_ng_template_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](0);
} if (rf & 2) {
    const item_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"]((item_r13.dar == null ? null : item_r13.dar.v_dar_platform) || "Data Access Request");
} }
function PageCartComponent_div_4_div_14_tr_23_div_9_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const status_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Completed: ", status_r26.completedForms.join(", "), "");
} }
function PageCartComponent_div_4_div_14_tr_23_div_9_div_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const status_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Still required: ", status_r26.incompleteForms.join(", "), "");
} }
function PageCartComponent_div_4_div_14_tr_23_div_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, PageCartComponent_div_4_div_14_tr_23_div_9_div_3_Template, 2, 1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](4, PageCartComponent_div_4_div_14_tr_23_div_9_div_4_Template, 2, 1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const status_r26 = ctx.ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("cart-form-status--complete", status_r26.complete);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](status_r26.complete ? "All required information completed" : "Forms need attention");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", status_r26.completedForms.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", status_r26.incompleteForms.length);
} }
function PageCartComponent_div_4_div_14_tr_23_ng_container_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const item_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r21.getProductDomain(item_r13.cartItem.product));
} }
function PageCartComponent_div_4_div_14_tr_23_span_14_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, "\u2014");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} }
function PageCartComponent_div_4_div_14_tr_23_Template(rf, ctx) { if (rf & 1) {
    const _r33 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](2, PageCartComponent_div_4_div_14_tr_23_ng_container_2_Template, 2, 1, "ng-container", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, PageCartComponent_div_4_div_14_tr_23_ng_template_3_Template, 1, 0, "ng-template", null, 31, _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](6, PageCartComponent_div_4_div_14_tr_23_ng_container_6_Template, 2, 1, "ng-container", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](7, PageCartComponent_div_4_div_14_tr_23_ng_template_7_Template, 1, 1, "ng-template", null, 32, _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](9, PageCartComponent_div_4_div_14_tr_23_div_9_Template, 5, 5, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](13, PageCartComponent_div_4_div_14_tr_23_ng_container_13_Template, 2, 1, "ng-container", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](14, PageCartComponent_div_4_div_14_tr_23_span_14_Template, 2, 0, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](15, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](19, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](21, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](22, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](23, "button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_div_14_tr_23_Template_button_click_23_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r33); const item_r13 = restoredCtx.$implicit; const ctx_r32 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3); return item_r13.type === "product" ? ctx_r32.editItem(item_r13.cartItem) : ctx_r32.editDar(item_r13.dar); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](25, "button", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_div_14_tr_23_Template_button_click_25_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r33); const item_r13 = restoredCtx.$implicit; const ctx_r34 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3); return item_r13.type === "product" ? ctx_r34.remove(item_r13.cartItem) : ctx_r34.removeDar(item_r13.dar); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](26, "\u00D7");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r13 = ctx.$implicit;
    const _r15 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵreference"](4);
    const _r18 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵreference"](8);
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", item_r13.type === "product")("ngIfElse", _r15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", item_r13.type === "product")("ngIfElse", _r18);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r12.getItemFormStatus(item_r13));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r13.type === "product" ? ctx_r12.getProductDataSteward(item_r13.cartItem.product) : (item_r13.dar == null ? null : item_r13.dar.requesting_id) === "Me" ? "Myself" : (item_r13.dar == null ? null : item_r13.dar.requestorName) || (item_r13.dar == null ? null : item_r13.dar.v_dar_objectid_reqfor) || "\u2014");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", item_r13.type === "product");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", item_r13.type === "dar");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r13.type === "product" ? ctx_r12.getProductDatatype(item_r13.cartItem.product) : (item_r13.dar == null ? null : item_r13.dar.v_dar_platform) || "\u2014");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r13.type === "product" ? ctx_r12.getProductClassification(item_r13.cartItem.product) : (item_r13.dar == null ? null : item_r13.dar.v_dar_environment) || "\u2014");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r13.type === "product" ? _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](21, 12, item_r13.cartItem.product.price * item_r13.quantity) : "$0.00");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r12.getItemFormStatus(item_r13).complete ? "Review" : "Complete");
} }
function PageCartComponent_div_4_div_14_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "h5");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "All");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "table", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "thead");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](7, "Image");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "Title");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11, "Data Steward / Requestor");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](13, "Domain");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](15, "Datatype / Platform");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](16, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](17, "Classification / Env");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](19, "Total");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](20, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](21, "Actions");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](22, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](23, PageCartComponent_div_4_div_14_tr_23_Template, 27, 14, "tr", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx_r6.allItems);
} }
function PageCartComponent_div_4_div_15_tr_23_div_5_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const status_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Completed: ", status_r38.completedForms.join(", "), "");
} }
function PageCartComponent_div_4_div_15_tr_23_div_5_div_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const status_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Still required: ", status_r38.incompleteForms.join(", "), "");
} }
function PageCartComponent_div_4_div_15_tr_23_div_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, PageCartComponent_div_4_div_15_tr_23_div_5_div_3_Template, 2, 1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](4, PageCartComponent_div_4_div_15_tr_23_div_5_div_4_Template, 2, 1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const status_r38 = ctx.ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](status_r38.complete ? "All required information completed" : "Forms need attention");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", status_r38.completedForms.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", status_r38.incompleteForms.length);
} }
function PageCartComponent_div_4_div_15_tr_23_Template(rf, ctx) { if (rf & 1) {
    const _r44 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](2, "img", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](5, PageCartComponent_div_4_div_15_tr_23_div_5_Template, 5, 3, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](16, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_div_15_tr_23_Template_button_click_18_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r44); const item_r36 = restoredCtx.$implicit; const ctx_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3); return ctx_r43.editItem(item_r36.cartItem); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](20, "button", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_div_15_tr_23_Template_button_click_20_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r44); const item_r36 = restoredCtx.$implicit; const ctx_r45 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3); return ctx_r45.remove(item_r36.cartItem); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](21, "\u00D7");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r36 = ctx.$implicit;
    const ctx_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("src", ctx_r35.getProductImage(item_r36.cartItem.product), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r36.cartItem.product.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r35.getProductFormStatus(item_r36));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r35.getProductDataSteward(item_r36.cartItem.product));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r35.getProductDomain(item_r36.cartItem.product));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r35.getProductDatatype(item_r36.cartItem.product));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r35.getProductClassification(item_r36.cartItem.product));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](16, 9, item_r36.cartItem.product.price * item_r36.quantity));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r35.getProductFormStatus(item_r36).complete ? "Review" : "Complete");
} }
function PageCartComponent_div_4_div_15_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "h5");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "Products");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "table", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "thead");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](7, "Image");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "Product");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11, "Data Steward");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](13, "Domain");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](15, "Datatype");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](16, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](17, "Classification");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](19, "Total");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](20, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](21, "Actions");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](22, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](23, PageCartComponent_div_4_div_15_tr_23_Template, 22, 11, "tr", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx_r7.productItems);
} }
function PageCartComponent_div_4_div_16_tr_23_div_5_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const status_r49 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Still required: ", status_r49.incompleteForms.join(", "), "");
} }
function PageCartComponent_div_4_div_16_tr_23_div_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, PageCartComponent_div_4_div_16_tr_23_div_5_div_3_Template, 2, 1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const status_r49 = ctx.ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](status_r49.complete ? "DAR completed" : "DAR needs attention");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", status_r49.incompleteForms.length);
} }
function PageCartComponent_div_4_div_16_tr_23_Template(rf, ctx) { if (rf & 1) {
    const _r53 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](2, "img", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](5, PageCartComponent_div_4_div_16_tr_23_div_5_Template, 4, 2, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](15, "$0.00");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](16, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_div_16_tr_23_Template_button_click_17_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r53); const req_r47 = restoredCtx.$implicit; const ctx_r52 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3); return ctx_r52.editDar(req_r47.dar); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](19, "button", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_div_16_tr_23_Template_button_click_19_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r53); const req_r47 = restoredCtx.$implicit; const ctx_r54 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3); return ctx_r54.removeDar(req_r47.dar); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](20, "\u00D7");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const req_r47 = ctx.$implicit;
    const ctx_r46 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"]((req_r47.dar == null ? null : req_r47.dar.v_dar_platform) || "\u2014");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r46.getDarFormStatus(req_r47.dar));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"]((req_r47.dar == null ? null : req_r47.dar.v_dar_dataDomainSelect) || "\u2014");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"]((req_r47.dar == null ? null : req_r47.dar.requesting_id) === "Me" ? "Myself" : (req_r47.dar == null ? null : req_r47.dar.requestorName) || (req_r47.dar == null ? null : req_r47.dar.v_dar_objectid_reqfor) || "\u2014");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"]((req_r47.dar == null ? null : req_r47.dar.v_dar_environment) || "\u2014");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"]((req_r47.dar == null ? null : req_r47.dar.v_dat_data_access_type) || "\u2014");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r46.getDarFormStatus(req_r47.dar).complete ? "Review" : "Complete");
} }
function PageCartComponent_div_4_div_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "h5");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "Data Access Request (DAR)");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "table", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "thead");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](7, "Image");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "Platform");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11, "Domain");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](13, "Requested For");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](15, "Environment");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](16, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](17, "Access Type");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](19, "Total");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](20, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](21, "Actions");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](22, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](23, PageCartComponent_div_4_div_16_tr_23_Template, 21, 7, "tr", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx_r8.darRequests);
} }
function PageCartComponent_div_4_div_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "Checkout is not available yet");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r9.checkoutMessage);
} }
function PageCartComponent_div_4_a_27_span_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" (", ctx_r55.productItems.length, " Products)");
} }
function PageCartComponent_div_4_a_27_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "a", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, "Proceed to checkout");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](2, PageCartComponent_div_4_a_27_span_2_Template, 2, 1, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r10.productItems.length > 1);
} }
function PageCartComponent_div_4_a_28_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "a", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, "Proceed to checkout");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} }
const _c0 = function (a0) { return { "btn-loading": a0 }; };
function PageCartComponent_div_4_Template(rf, ctx) { if (rf & 1) {
    const _r57 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "ul", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "li", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "a", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_Template_a_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r57); const ctx_r56 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r56.activeTab = "all"; });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "li", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "a", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_Template_a_click_7_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r57); const ctx_r58 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r58.activeTab = "products"; });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](9, "li", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "a", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_Template_a_click_10_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r57); const ctx_r59 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r59.activeTab = "dar"; });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](12, PageCartComponent_div_4_div_12_Template, 4, 0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](13, PageCartComponent_div_4_div_13_Template, 3, 0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](14, PageCartComponent_div_4_div_14_Template, 24, 1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](15, PageCartComponent_div_4_div_15_Template, 24, 1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](16, PageCartComponent_div_4_div_16_Template, 24, 1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](19, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](20, "a", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](21, "Continue Shopping");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](22, "button", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageCartComponent_div_4_Template_button_click_22_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r57); const ctx_r60 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r60.update(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](23, "Update Cart");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](24, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](25, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](26, PageCartComponent_div_4_div_26_Template, 5, 1, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](27, PageCartComponent_div_4_a_27_Template, 3, 1, "a", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](28, PageCartComponent_div_4_a_28_Template, 2, 0, "a", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("active", ctx_r3.activeTab === "all");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("All (", ctx_r3.allItems.length, ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("active", ctx_r3.activeTab === "products");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Products (", ctx_r3.productItems.length, ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("active", ctx_r3.activeTab === "dar");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Data Access Request (DAR) (", ctx_r3.darRequests.length, ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r3.hasMixedCart);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r3.hasMultipleDar && !ctx_r3.hasProducts);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r3.activeTab === "all");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r3.activeTab === "products");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r3.activeTab === "dar");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](19, _c0, ctx_r3.updating))("disabled", !ctx_r3.needUpdate());
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", !ctx_r3.canCheckout && ctx_r3.checkoutMessage);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r3.canCheckoutProducts);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r3.canCheckoutDar);
} }
const _c1 = function (a1) { return { label: "Domains", url: a1 }; };
const _c2 = function () { return { label: "Cart", url: "" }; };
const _c3 = function (a0, a1) { return [a0, a1]; };
class PageCartComponent {
    constructor(cart, root, offCanvasRequestService, offCanvasDarService) {
        this.cart = cart;
        this.root = root;
        this.offCanvasRequestService = offCanvasRequestService;
        this.offCanvasDarService = offCanvasDarService;
        this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_8__.Subject();
        this.selectedItem = null;
        this.selectedDar = null;
        this.items = [];
        this.productItems = [];
        this.darRequests = [];
        this.allItems = [];
        this.productRequests = [];
        this.removedItems = [];
        this.updating = false;
        this.dropcartType = 'offcanvas';
        this.product = null;
        this.activeTab = 'all';
    }
    ngOnInit() {
        this.cart.items$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_9__.takeUntil)(this.destroy$), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_10__.map)(cartItems => cartItems
            .filter(ci => !!ci.product)
            .map(cartItem => ({
            type: 'product',
            cartItem,
            quantity: cartItem.quantity,
            quantityControl: new _angular_forms__WEBPACK_IMPORTED_MODULE_11__.FormControl({ value: cartItem.quantity, disabled: true }, _angular_forms__WEBPACK_IMPORTED_MODULE_11__.Validators.required)
        })))).subscribe(items => {
            this.productItems = items;
            this.items = items;
            this.rebuildAll();
        });
        this.cart.state$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_9__.takeUntil)(this.destroy$)).subscribe(state => {
            this.darRequests = (state.darRequests || []).map(d => ({ type: 'dar', dar: d }));
            this.productRequests = state.productRequests || [];
            this.rebuildAll();
        });
    }
    rebuildAll() { this.allItems = [...this.productItems, ...this.darRequests]; }
    editItem(item) { this.selectedItem = item; this.offCanvasRequestService.open(); }
    editDar(dar) { this.selectedDar = dar; this.offCanvasDarService.open(); }
    remove(item) {
        this.removedItems.push(item);
        this.cart.remove(item).subscribe({ complete: () => this.removedItems = this.removedItems.filter(i => i !== item) });
    }
    removeDar(dar) {
        if (typeof this.cart.removeDar === 'function') {
            this.removedItems.push(dar);
            this.cart.removeDar(dar).subscribe({ complete: () => this.removedItems = this.removedItems.filter(i => i !== dar) });
        }
    }
    update() {
        this.updating = true;
        this.cart.update(this.items
            .filter(item => item.quantityControl.value !== item.quantity)
            .map(item => ({ item: item.cartItem, quantity: item.quantityControl.value })))
            .subscribe({ complete: () => this.updating = false });
    }
    needUpdate() {
        return this.items.some(item => item.quantityControl.value !== item.quantity && item.quantityControl.valid);
    }
    getProductRequest(item) {
        const cartItem = item === null || item === void 0 ? void 0 : item.cartItem;
        const product = cartItem === null || cartItem === void 0 ? void 0 : cartItem.product;
        if (!cartItem || !product)
            return null;
        return this.productRequests.find(request => {
            var _a;
            return (request === null || request === void 0 ? void 0 : request.cartItemId) === (cartItem === null || cartItem === void 0 ? void 0 : cartItem.id) ||
                (request === null || request === void 0 ? void 0 : request.productId) === (product === null || product === void 0 ? void 0 : product.id) ||
                ((_a = request === null || request === void 0 ? void 0 : request.product) === null || _a === void 0 ? void 0 : _a.id) === (product === null || product === void 0 ? void 0 : product.id) ||
                (!!(product === null || product === void 0 ? void 0 : product.slug) && (request === null || request === void 0 ? void 0 : request.productSlug) === product.slug);
        }) || null;
    }
    getProductFormStatus(item) {
        var _a, _b, _c;
        const request = this.getProductRequest(item);
        const forms = [
            { label: 'Request Details', complete: this.hasValue((_a = request === null || request === void 0 ? void 0 : request.requestDetails) !== null && _a !== void 0 ? _a : request === null || request === void 0 ? void 0 : request.businessPurpose) },
            { label: 'Business Justification', complete: this.hasValue((_b = request === null || request === void 0 ? void 0 : request.businessJustification) !== null && _b !== void 0 ? _b : request === null || request === void 0 ? void 0 : request.justification) },
            { label: 'Data Usage', complete: this.hasValue((_c = request === null || request === void 0 ? void 0 : request.dataUsage) !== null && _c !== void 0 ? _c : request === null || request === void 0 ? void 0 : request.intendedUse) }
        ];
        return this.buildStatus(forms);
    }
    getDarFormStatus(dar) {
        const forms = [
            { label: 'Platform', complete: this.hasValue(dar === null || dar === void 0 ? void 0 : dar.v_dar_platform) },
            { label: 'Data Domain', complete: this.hasValue(dar === null || dar === void 0 ? void 0 : dar.v_dar_dataDomainSelect) },
            { label: 'Requested For', complete: (dar === null || dar === void 0 ? void 0 : dar.requesting_id) === 'Me' || this.hasValue(dar === null || dar === void 0 ? void 0 : dar.requestorName) || this.hasValue(dar === null || dar === void 0 ? void 0 : dar.v_dar_objectid_reqfor) },
            { label: 'Environment', complete: this.hasValue(dar === null || dar === void 0 ? void 0 : dar.v_dar_environment) },
            { label: 'Access Type', complete: this.hasValue(dar === null || dar === void 0 ? void 0 : dar.v_dat_data_access_type) }
        ];
        return this.buildStatus(forms);
    }
    getItemFormStatus(item) {
        return (item === null || item === void 0 ? void 0 : item.type) === 'dar' ? this.getDarFormStatus(item.dar) : this.getProductFormStatus(item);
    }
    buildStatus(forms) {
        const completedForms = forms.filter(f => f.complete).map(f => f.label);
        const incompleteForms = forms.filter(f => !f.complete).map(f => f.label);
        return { complete: incompleteForms.length === 0, completedForms, incompleteForms };
    }
    get hasProducts() { return this.productItems.length > 0; }
    get hasDar() { return this.darRequests.length > 0; }
    get hasMixedCart() { return this.hasProducts && this.hasDar; }
    get hasMultipleDar() { return this.darRequests.length > 1; }
    get canCheckoutProducts() {
        return this.productItems.length > 0 && this.darRequests.length === 0 &&
            this.productItems.every(item => this.getProductFormStatus(item).complete);
    }
    get canCheckoutDar() {
        return this.darRequests.length === 1 && this.productItems.length === 0 &&
            this.getDarFormStatus(this.darRequests[0].dar).complete;
    }
    get canCheckout() { return this.canCheckoutProducts || this.canCheckoutDar; }
    get checkoutMessage() {
        if (this.hasMixedCart)
            return 'Products and Data Access Requests cannot be checked out together. Remove the DAR or remove all products to continue.';
        if (this.hasMultipleDar)
            return 'Only one Data Access Request can be checked out at a time. Remove the additional DARs to continue.';
        if (this.hasProducts) {
            const incomplete = this.productItems.filter(item => !this.getProductFormStatus(item).complete).length;
            if (incomplete)
                return `${incomplete} ${incomplete === 1 ? 'product still needs' : 'products still need'} required form information before checkout.`;
        }
        if (this.darRequests.length === 1 && !this.getDarFormStatus(this.darRequests[0].dar).complete) {
            return 'Complete the required Data Access Request form before checkout.';
        }
        return '';
    }
    getProductClassification(product) {
        const classification = product === null || product === void 0 ? void 0 : product.classification;
        if (!classification)
            return '—';
        if (typeof classification === 'string')
            return classification.trim() || '—';
        return (classification === null || classification === void 0 ? void 0 : classification.name) || '—';
    }
    getProductDataSteward(product) {
        const steward = product === null || product === void 0 ? void 0 : product.data_steward;
        if (!steward)
            return '—';
        if (typeof steward === 'string')
            return steward.trim() || '—';
        return (steward === null || steward === void 0 ? void 0 : steward.name) || '—';
    }
    getProductDomain(product) {
        const domain = product === null || product === void 0 ? void 0 : product.domain;
        if (!domain)
            return '—';
        if (typeof domain === 'string')
            return domain.trim() || '—';
        if (Array.isArray(domain)) {
            return domain
                .map((item) => typeof item === 'string' ? item : ((item === null || item === void 0 ? void 0 : item.name) || (item === null || item === void 0 ? void 0 : item.slug) || ''))
                .filter(Boolean)
                .join(', ') || '—';
        }
        return (domain === null || domain === void 0 ? void 0 : domain.name) || (domain === null || domain === void 0 ? void 0 : domain.slug) || '—';
    }
    getProductDatatype(product) {
        const datatype = product === null || product === void 0 ? void 0 : product.datatype;
        if (!datatype)
            return '—';
        if (typeof datatype === 'string')
            return datatype.trim() || '—';
        return (datatype === null || datatype === void 0 ? void 0 : datatype.name) || '—';
    }
    displayValue(value) {
        if (value === null || value === undefined)
            return '—';
        if (typeof value === 'string')
            return value.trim() || '—';
        if (typeof value === 'number' || typeof value === 'boolean')
            return String(value);
        return '—';
    }
    hasValue(value) {
        if (typeof value === 'string')
            return value.trim().length > 0;
        if (Array.isArray(value))
            return value.length > 0;
        return value !== null && value !== undefined;
    }
    getProductImage(product) {
        const fallback = 'assets/images/product_images/data-access-request.jpg';
        if (!product)
            return fallback;
        let img = '';
        if (Array.isArray(product.images) && product.images.length)
            img = String(product.images[0]).trim();
        else if (product.image)
            img = String(product.image).trim();
        else
            return fallback;
        if (!img)
            return fallback;
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('//'))
            return img;
        if (img.startsWith('/') || img.startsWith('assets/'))
            return img;
        return `assets/images/product_images/${img}`;
    }
    ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
PageCartComponent.ɵfac = function PageCartComponent_Factory(t) { return new (t || PageCartComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_services_cart_service__WEBPACK_IMPORTED_MODULE_0__.CartService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_services_root_service__WEBPACK_IMPORTED_MODULE_1__.RootService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_services_offcanvas_request_service__WEBPACK_IMPORTED_MODULE_2__.OffcanvasRequestService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_services_offcanvas_dar_service__WEBPACK_IMPORTED_MODULE_3__.OffcanvasDARService)); };
PageCartComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineComponent"]({ type: PageCartComponent, selectors: [["app-cart"]], decls: 5, vars: 12, consts: [["type", "offcanvas", 3, "product", 4, "ngIf"], [3, "header", "breadcrumbs"], ["class", "block block-empty", 4, "ngIf"], ["class", "cart block", 4, "ngIf"], ["type", "offcanvas", 3, "product"], [1, "block", "block-empty"], [1, "container"], [1, "block-empty__body"], [1, "block-empty__message"], [1, "block-empty__actions"], [1, "btn", "btn-primary", "btn-sm", 3, "routerLink"], [1, "cart", "block"], [1, "container-fluid"], [1, "nav", "nav-tabs", "mb-4"], [1, "nav-item"], [1, "nav-link", 3, "click"], ["class", "alert alert-warning mb-4", 4, "ngIf"], [4, "ngIf"], [1, "row", "justify-content-end"], [1, "cart__actions", "mt-4"], [1, "cart__buttons"], ["routerLink", "/", 1, "btn", "btn-light"], ["type", "button", 1, "btn", "btn-primary", "cart__update-button", 3, "ngClass", "disabled", "click"], [1, "row", "justify-content-end", "pt-5"], [1, "col-12", "col-md-7", "col-lg-6", "col-xl-5"], ["class", "checkout-requirements mb-3", 4, "ngIf"], ["class", "btn btn-primary btn-xl btn-block cart__checkout-button", "routerLink", "./checkout", 4, "ngIf"], [1, "alert", "alert-warning", "mb-4"], [1, "cart__table", "cart-table"], [4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["darImg", ""], ["dt", ""], ["class", "cart-form-status mt-2", 3, "cart-form-status--complete", 4, "ngIf"], ["type", "button", 1, "btn", "btn-sm", "btn-outline-primary", 3, "click"], ["type", "button", 1, "btn", "btn-light", "btn-sm", 3, "click"], ["width", "80", "alt", "", 3, "src"], ["src", "assets/images/product_images/data-access-request.jpg", "width", "80", "alt", "DAR"], [1, "cart-form-status", "mt-2"], ["class", "cart-form-status mt-2", 4, "ngIf"], [1, "checkout-requirements", "mb-3"], ["routerLink", "./checkout", 1, "btn", "btn-primary", "btn-xl", "btn-block", "cart__checkout-button"]], template: function PageCartComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](0, PageCartComponent_app_header_request_access_0_Template, 1, 1, "app-header-request-access", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](1, PageCartComponent_app_header_request_access_1_Template, 1, 1, "app-header-request-access", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](2, "app-page-header", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, PageCartComponent_div_3_Template, 8, 1, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](4, PageCartComponent_div_4_Template, 29, 21, "div", 3);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.dropcartType === "offcanvas");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.dropcartType === "offcanvas");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("header", "Cart")("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction2"](9, _c3, _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](6, _c1, ctx.root.home()), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction0"](8, _c2)));
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", !ctx.allItems.length);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.allItems.length);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_12__.NgIf, _shared_components_product_components_request_access_request_access_component__WEBPACK_IMPORTED_MODULE_4__.RequestAccessComponent, _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_5__.PageHeaderComponent, _angular_router__WEBPACK_IMPORTED_MODULE_13__.RouterLinkWithHref, _angular_common__WEBPACK_IMPORTED_MODULE_12__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_12__.NgClass], pipes: [_shared_pipes_currency_format_pipe__WEBPACK_IMPORTED_MODULE_6__.CurrencyFormatPipe], styles: [".cart-form-status[_ngcontent-%COMP%] {\n  margin-top: 8px;\n  padding: 8px 10px;\n  border: 1px solid #d99b28;\n  border-left-width: 4px;\n  border-radius: 4px;\n  background: #fff8e8;\n  color: #744b00;\n  font-size: 12px;\n  line-height: 1.45;\n}\n\n.cart-form-status--complete[_ngcontent-%COMP%] {\n  border-color: #54a985;\n  background: #edf9f3;\n  color: #116b49;\n}\n\n.checkout-requirements[_ngcontent-%COMP%] {\n  padding: 14px 18px;\n  border: 1px solid #d99b28;\n  border-left-width: 5px;\n  border-radius: 5px;\n  background: #fff8e8;\n  color: #744b00;\n}\n\n.cart__checkout-button[_ngcontent-%COMP%] {\n  float: right;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtY2FydC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGVBQUE7RUFDQSxpQkFBQTtFQUNBLHlCQUFBO0VBQ0Esc0JBQUE7RUFDQSxrQkFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtBQUNKOztBQUNBO0VBQThCLHFCQUFBO0VBQXVCLG1CQUFBO0VBQXFCLGNBQUE7QUFLMUU7O0FBSkE7RUFBeUIsa0JBQUE7RUFBb0IseUJBQUE7RUFBMkIsc0JBQUE7RUFBd0Isa0JBQUE7RUFBb0IsbUJBQUE7RUFBcUIsY0FBQTtBQWF6STs7QUFaQTtFQUF5QixZQUFBO0FBZ0J6QiIsImZpbGUiOiJwYWdlLWNhcnQuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuY2FydC1mb3JtLXN0YXR1cyB7XG4gICAgbWFyZ2luLXRvcDogOHB4O1xuICAgIHBhZGRpbmc6IDhweCAxMHB4O1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICNkOTliMjg7XG4gICAgYm9yZGVyLWxlZnQtd2lkdGg6IDRweDtcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgYmFja2dyb3VuZDogI2ZmZjhlODtcbiAgICBjb2xvcjogIzc0NGIwMDtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgbGluZS1oZWlnaHQ6IDEuNDU7XG59XG4uY2FydC1mb3JtLXN0YXR1cy0tY29tcGxldGUgeyBib3JkZXItY29sb3I6ICM1NGE5ODU7IGJhY2tncm91bmQ6ICNlZGY5ZjM7IGNvbG9yOiAjMTE2YjQ5OyB9XG4uY2hlY2tvdXQtcmVxdWlyZW1lbnRzIHsgcGFkZGluZzogMTRweCAxOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjZDk5YjI4OyBib3JkZXItbGVmdC13aWR0aDogNXB4OyBib3JkZXItcmFkaXVzOiA1cHg7IGJhY2tncm91bmQ6ICNmZmY4ZTg7IGNvbG9yOiAjNzQ0YjAwOyB9XG4uY2FydF9fY2hlY2tvdXQtYnV0dG9uIHsgZmxvYXQ6IHJpZ2h0OyB9XG4iXX0= */"] });


/***/ }),

/***/ 97821:
/*!*************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/pages/page-checkout/page-checkout.component.ts ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageCheckoutComponent": () => (/* binding */ PageCheckoutComponent)
/* harmony export */ });
/* harmony import */ var _Users_arygin_corporation_GitHub_fullstackv27_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ 71670);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../environments/environment */ 92340);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/operators */ 83910);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_root_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../@shared/services/root.service */ 36603);
/* harmony import */ var _shared_services_cart_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/services/cart.service */ 77535);
/* harmony import */ var _shared_services_app_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../@shared/services/app.service */ 5406);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_components_alert_alert_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../@shared/components/alert/alert.component */ 93944);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/forms */ 90587);
/* harmony import */ var _shared_pipes_currency_format_pipe__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../@shared/pipes/currency-format.pipe */ 82543);
















function PageCheckoutComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "app-alert", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](2, "Returning customer? ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "a", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4, "Click here to login");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("routerLink", ctx_r0.root.login());
  }
}

function PageCheckoutComponent_div_6_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](0, "div", 35);
  }
}

function PageCheckoutComponent_div_6_p_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "p", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](2, "Submitting Your Request");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }
}

function PageCheckoutComponent_div_6_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](0, "div", 35);
  }
}

function PageCheckoutComponent_div_6_p_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "p", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](2, "Successfully Submitted");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }
}

function PageCheckoutComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](2, PageCheckoutComponent_div_6_div_2_Template, 1, 0, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](3, PageCheckoutComponent_div_6_p_3_Template, 3, 0, "p", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](4, PageCheckoutComponent_div_6_div_4_Template, 1, 0, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](5, PageCheckoutComponent_div_6_p_5_Template, 3, 0, "p", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r1.submissionStatus === "fulfilling");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r1.submissionStatus === "fulfilling");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r1.submissionStatus === "success");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r1.submissionStatus === "success");
  }
}

function PageCheckoutComponent_ng_container_55_table_1_tr_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](5, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const item_r11 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](item_r11.product.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](5, 2, 0));
  }
}

function PageCheckoutComponent_ng_container_55_table_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "table", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "thead", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4, "Data Products");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](6, "Total");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](7, "tbody", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](8, PageCheckoutComponent_ng_container_55_table_1_tr_8_Template, 6, 4, "tr", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const state_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassProp"]("dars", state_r7.items.length > 0 && state_r7.darRequests.length > 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", state_r7.items);
  }
}

function PageCheckoutComponent_ng_container_55_table_2_tr_8_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const dar_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" Platform: ", dar_r14.v_dar_platform, " ");
  }
}

function PageCheckoutComponent_ng_container_55_table_2_tr_8_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const dar_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" Domain: ", dar_r14.v_dar_dataDomainSelect, " ");
  }
}

function PageCheckoutComponent_ng_container_55_table_2_tr_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](3, "Data Access Request");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](4, PageCheckoutComponent_ng_container_55_table_2_tr_8_div_4_Template, 2, 1, "div", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](5, PageCheckoutComponent_ng_container_55_table_2_tr_8_div_5_Template, 2, 1, "div", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](6, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](8, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const dar_r14 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", dar_r14.v_dar_platform);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", dar_r14.v_dar_dataDomainSelect);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](8, 3, 0));
  }
}

function PageCheckoutComponent_ng_container_55_table_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "table", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "thead", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4, "DAR Requests");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](6, "Total");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](7, "tbody", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](8, PageCheckoutComponent_ng_container_55_table_2_tr_8_Template, 9, 5, "tr", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](9, "tfoot", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](10, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](11, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](12, "Total Charge");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](13, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](15, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const state_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", state_r7.darRequests);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](15, 2, 0));
  }
}

function PageCheckoutComponent_ng_container_55_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, PageCheckoutComponent_ng_container_55_table_1_Template, 9, 3, "table", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](2, PageCheckoutComponent_ng_container_55_table_2_Template, 16, 4, "table", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    const state_r7 = ctx.ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", state_r7.items.length > 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", state_r7.darRequests.length > 0);
  }
}

const _c0 = function (a1) {
  return {
    label: "Domains",
    url: a1
  };
};

const _c1 = function (a1) {
  return {
    label: "Cart",
    url: a1
  };
};

const _c2 = function () {
  return {
    label: "Checkout",
    url: ""
  };
};

const _c3 = function (a0, a1, a2) {
  return [a0, a1, a2];
};

const _c4 = function (a0) {
  return {
    "btn-loading": a0
  };
};

class PageCheckoutComponent {
  constructor(root, cart, appSvc, http, router) {
    this.root = root;
    this.cart = cart;
    this.appSvc = appSvc;
    this.http = http;
    this.router = router;
    this.isSubmitting = false;
    this.submissionStatus = 'idle';
  }

  executeCheckout() {
    var _this = this;

    return (0,_Users_arygin_corporation_GitHub_fullstackv27_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
      var _a, _b, _c;

      _this.cart.loadFromStorage();

      const state = yield _this.cart.state$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_9__.take)(1)).toPromise();

      if (!state || state.catalogItems.length === 0 && state.darRequests.length === 0) {
        (_b = (_a = _this.appSvc).notifyError) === null || _b === void 0 ? void 0 : _b.call(_a, "Your cart is empty.");
        return;
      }

      _this.isSubmitting = true;

      try {
        _this.submissionStatus = 'fulfilling';
        const snResult = yield _this.triggerServiceNowFulfillment(state);
        _this.submissionStatus = 'success';
        yield new Promise(resolve => setTimeout(resolve, 3000)); // Store the receipt data BEFORE clearing the cart

        const orderId = ((_c = snResult === null || snResult === void 0 ? void 0 : snResult.result) === null || _c === void 0 ? void 0 : _c.number) || (snResult === null || snResult === void 0 ? void 0 : snResult.number) || 'REQ-SUCCESS';

        _this.cart.setReceipt({
          id: orderId,
          items: [...state.catalogItems],
          darRequests: [...state.darRequests],
          date: new Date().toLocaleDateString(),
          total: 0 // As these are free requests

        });

        _this.cart.clear();

        _this.router.navigate(['/marketplace/order/cart/checkout/success'], {
          queryParams: {
            id: orderId
          }
        });
      } catch (error) {// ... error handling
      } finally {
        _this.isSubmitting = false;
      }
    })();
  }

  triggerServiceNowFulfillment(state) {
    var _this2 = this;

    return (0,_Users_arygin_corporation_GitHub_fullstackv27_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
      var _a, _b;

      const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_10__.HttpHeaders({
        'Authorization': `Basic ${_environments_environment__WEBPACK_IMPORTED_MODULE_1__.environment.serviceNow.auth}`,
        'Content-Type': 'application/json'
      });
      const payload = {
        sysparm_quantity: '1',
        variables: {
          v_dar_objectid_createdby: (_b = (_a = _this2.appSvc) === null || _a === void 0 ? void 0 : _a.userData) === null || _b === void 0 ? void 0 : _b.id,
          // Now both use the same mapping logic
          cart_items: state.catalogItems.map(item => ({
            formData: _this2.mapFormData(item.formData)
          })),
          dar_requests: state.darRequests.map(dar => ({
            formData: _this2.mapFormData(dar.formData)
          }))
        }
      };
      return _this2.http.post(_environments_environment__WEBPACK_IMPORTED_MODULE_1__.environment.serviceNow.submitOrder, payload, {
        headers
      }).toPromise();
    })();
  }
  /**
   * Helper to ensure the formData sent to ServiceNow contains the exact schema required
   */


  mapFormData(data) {
    if (!data) return {};
    return {
      requesting_id: data.requesting_id,
      v_dar_objectid_createdby: data.v_dar_objectid_createdby,
      v_dar_objectid_reqfor: data.v_dar_objectid_reqfor,
      v_dar_workdayID_created_by: data.v_dar_workdayID_created_by,
      v_dar_workdayID: data.v_dar_workdayID,
      companyName: data.companyName,
      v_dar_organization: data.v_dar_organization,
      v_dar_platform: data.v_dar_platform,
      v_dar_dataDomainSelect: data.v_dar_dataDomainSelect,
      v_dar_userType: data.v_dar_userType,
      v_dar_accessType: data.v_dar_accessType,
      v_dar_environment: data.v_dar_environment,
      v_dar_accessReqClassification: data.v_dar_accessReqClassification,
      v_dar_accessStage: data.v_dar_accessStage,
      v_emd_PI_access: data.v_emd_PI_access,
      edm_PI_personal_details: data.edm_PI_personal_details,
      v_emd_specify_PII_needs: data.v_emd_specify_PII_needs,
      v_edm_type_of_work: data.v_edm_type_of_work,
      v_edm_3rd_party_vendor: data.v_edm_3rd_party_vendor,
      v_dat_api_name: data.v_dat_api_name,
      v_dar_select_a_data_warehouse_mart: data.v_dar_select_a_data_warehouse_mart,
      v_dar_bi_data_access_type: data.v_dar_bi_data_access_type,
      v_dar_gateway_if_other: data.v_dar_gateway_if_other,
      v_dar_gateway_database_schema: data.v_dar_gateway_database_schema,
      v_dar_post_database_schema: data.v_dar_post_database_schema,
      v_dar_post_table_names: data.v_dar_post_table_names,
      v_dar_tbdp_is_this_request_fort_irm_pricing: data.v_dar_tbdp_is_this_request_fort_irm_pricing,
      v_dar_select_an_oracle_access_type: data.v_dar_select_an_oracle_access_type,
      v_dar_oracle_other: data.v_dar_oracle_other,
      v_dar_OtherType: data.v_dar_OtherType,
      v_dar_mfr_other: data.v_dar_mfr_other,
      v_dar_mainframe_access_type: data.v_dar_mainframe_access_type,
      v_dar_mainframe_change_tso_id: data.v_dar_mainframe_change_tso_id,
      v_dare_mainframe_change_authorizers_vertical_horizontal: data.v_dare_mainframe_change_authorizers_vertical_horizontal,
      v_dar_mainframe_changeman_application: data.v_dar_mainframe_changeman_application,
      v_dar_mf_tso_id_removed: data.v_dar_mf_tso_id_removed,
      v_dar_mf_transaction: data.v_dar_mf_transaction,
      b_dar_mf_db2_plan_grant: data.b_dar_mf_db2_plan_grant,
      b_dar_mf_db2_plan_revoke: data.b_dar_mf_db2_plan_revoke,
      v_dar_mf_db2_plan_tso_id_or_job_name: data.v_dar_mf_db2_plan_tso_id_or_job_name,
      v_dar_mf_db2_plan_plan_name: data.v_dar_mf_db2_plan_plan_name,
      b_dar_mf_db2_plan_bind: data.b_dar_mf_db2_plan_bind,
      b_dar_mf_db2_plan_execute: data.b_dar_mf_db2_plan_execute,
      v_dar_mf_db2_table_name_s: data.v_dar_mf_db2_table_name_s,
      b_dar_mf_db2_select: data.b_dar_mf_db2_select,
      b_dar_mf_db2_update: data.b_dar_mf_db2_update,
      b_dar_mf_db2_insert: data.b_dar_mf_db2_insert,
      b_dar_mf_db2_delete: data.b_dar_mf_db2_delete,
      b_dar_mf_db2_grant: data.b_dar_mf_db2_grant,
      b_dar_mf_db2_revoke: data.b_dar_mf_db2_revoke,
      v_dar_mf_db2_tso_or_job_name: data.v_dar_mf_db2_tso_or_job_name,
      v_dar_mnfr_ims_option_type: data.v_dar_mnfr_ims_option_type,
      v_dar_mnfr_ims_options_select: data.v_dar_mnfr_ims_options_select,
      v_dar_mnfr_transaction_id: data.v_dar_mnfr_transaction_id,
      v_dar_mnfr_ims_transaction_group: data.v_dar_mnfr_ims_transaction_group,
      v_dar_mfrn_ims_transaction_group_description: data.v_dar_mfrn_ims_transaction_group_description,
      b_dar_ims_add: data.b_dar_ims_add,
      v_dar_mf_ims_tmna_region_area_code_for_adds: data.v_dar_mf_ims_tmna_region_area_code_for_adds,
      v_dar_mf_ims_transaction_group: data.v_dar_mf_ims_transaction_group,
      b_dar_ims_delete: data.b_dar_ims_delete,
      v_dar_mf_ims_ims_id_for_deletes: data.v_dar_mf_ims_ims_id_for_deletes,
      v_dat_data_access_type: data.v_dat_data_access_type,
      v_dar_DataReqDescription: data.v_dar_DataReqDescription,
      v_dar_businessJustification: data.v_dar_businessJustification,
      v_custom_control_group: data.v_custom_control_group,
      v_custom_routing_rule_identifier: data.v_custom_routing_rule_identifier,
      v_custom_fulfillment_group_1: data.v_custom_fulfillment_group_1,
      chk_dar_terms_message: data.chk_dar_terms_message,
      v_dar_dm_version: data.v_dar_dm_version
    };
  }

}

PageCheckoutComponent.ɵfac = function PageCheckoutComponent_Factory(t) {
  return new (t || PageCheckoutComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_shared_services_root_service__WEBPACK_IMPORTED_MODULE_2__.RootService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_shared_services_cart_service__WEBPACK_IMPORTED_MODULE_3__.CartService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_shared_services_app_service__WEBPACK_IMPORTED_MODULE_4__.AppService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_10__.HttpClient), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_11__.Router));
};

PageCheckoutComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdefineComponent"]({
  type: PageCheckoutComponent,
  selectors: [["app-checkout"]],
  decls: 68,
  vars: 29,
  consts: [[3, "header", "breadcrumbs"], [1, "checkout", "block"], [1, "container-fluid"], [1, "row"], ["class", "col-12 mb-3", 4, "ngIf"], [1, "col-12"], ["class", "pipeline-status my-3 p-3 border rounded bg-light", 4, "ngIf"], [1, "col-12", "col-xl-4", "col-lg-6"], [1, "card", "mb-lg-0"], [1, "card-body"], [1, "card-title"], [1, "row", "g-2"], [1, "col-xl-6", "col-lg-6", "col-md-6", "col-sm-12"], ["type", "text", "disabled", "", 1, "form-control", 3, "ngModel"], [1, "col-xl-2", "col-lg-6", "col-md-2", "col-sm-12"], [1, "col-xl-2", "col-lg-2", "col-md-2", "col-sm-12"], [1, "col-xl-12", "col-lg-8"], [1, "col-12", "col-xl-8", "col-lg-6", "mt-4", "mt-lg-0"], [1, "card", "mb-0"], [4, "ngIf"], [1, "payment-methods", "mt-4"], [1, "payment-methods__list"], [1, "payment-methods__item", "payment-methods__item--active"], [1, "payment-methods__item-header"], [1, "payment-methods__item-title"], [1, "payment-methods__item-container"], [1, "payment-methods__item-description", "text-muted"], ["type", "button", 1, "btn", "btn-primary", "btn-xl", "btn-block", 3, "ngClass", "disabled", "click"], [1, "col-12", "mb-3"], ["type", "primary", "size", "lg"], [3, "routerLink"], [1, "pipeline-status", "my-3", "p-3", "border", "rounded", "bg-light"], [1, "d-flex", "align-items-center", "mb-2", 2, "position", "relative", "top", "6px"], ["class", "spinner-border spinner-border-sm text-secondary me-2", 4, "ngIf"], ["style", "position: relative; top: 9px; font-size: 18px;", 4, "ngIf"], [1, "spinner-border", "spinner-border-sm", "text-secondary", "me-2"], [2, "position", "relative", "top", "9px", "font-size", "18px"], ["class", "checkout__totals", 3, "dars", 4, "ngIf"], ["class", "checkout__totals", 4, "ngIf"], [1, "checkout__totals"], [1, "checkout__totals-header"], [1, "checkout__totals-products"], [4, "ngFor", "ngForOf"], [1, "checkout__totals-footer"], ["class", "text-muted small", 4, "ngIf"], [1, "text-muted", "small"]],
  template: function PageCheckoutComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](0, "app-page-header", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "div", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](4, PageCheckoutComponent_div_4_Template, 5, 1, "div", 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "div", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](6, PageCheckoutComponent_div_6_Template, 6, 4, "div", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](7, "div", 7);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](8, "div", 8);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](9, "div", 9);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](10, "h3", 10);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](11, "Employee Details");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](12, "div", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](13, "div", 11);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](14, "div", 12);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](15, "label");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](16, "First Name");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](17, "input", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](18, "div", 12);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](19, "label");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](20, "Last Name");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](21, "input", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](22, "div", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](23, "label");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](24, "Organization / Company Name");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](25, "input", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](26, "div", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](27, "label");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](28, "Addreess");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](29, "input", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](30, "div", 12);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](31, "label");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](32, "City");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](33, "input", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](34, "div", 14);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](35, "label");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](36, "State");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](37, "input", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](38, "div", 15);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](39, "label");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](40, "Zip Code");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](41, "input", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](42, "div", 15);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](43, "label");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](44, "Country");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](45, "input", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](46, "div", 16);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](47, "label");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](48, "Email Address");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](49, "input", 13);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](50, "div", 17);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](51, "div", 18);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](52, "div", 9);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](53, "h3", 10);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](54, "Your Order Summary");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](55, PageCheckoutComponent_ng_container_55_Template, 3, 2, "ng-container", 19);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](56, "async");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](57, "div", 20);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](58, "ul", 21);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](59, "li", 22);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](60, "label", 23);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](61, "span", 24);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](62, "Standard Entitlement Delivery");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](63, "div", 25);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](64, "div", 26);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](65, " Fulfillment is processed via Data Fullfilment Teams. This request is currently free of charge. ");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](66, "button", 27);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function PageCheckoutComponent_Template_button_click_66_listener() {
        return ctx.executeCheckout();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](67, " Submit Order ");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    }

    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("header", "Checkout")("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction3"](23, _c3, _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](18, _c0, ctx.root.home()), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](20, _c1, ctx.root.cart()), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction0"](22, _c2)));
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", !(ctx.appSvc == null ? null : ctx.appSvc.userData));
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx.isSubmitting);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](11);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.givenName);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.surname);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", (ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.companyName) === "TMNA" || (ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.companyName) === "TMN" ? "Toyota Motor North America" : ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.companyName);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.streetAddress);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.city);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.state);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.postalCode);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.country);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.mail);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](6);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](56, 16, ctx.cart.state$));
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](11);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](27, _c4, ctx.isSubmitting))("disabled", ctx.isSubmitting);
    }
  },
  directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_5__.PageHeaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_12__.NgIf, _shared_components_alert_alert_component__WEBPACK_IMPORTED_MODULE_6__.AlertComponent, _angular_router__WEBPACK_IMPORTED_MODULE_11__.RouterLinkWithHref, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.NgModel, _angular_common__WEBPACK_IMPORTED_MODULE_12__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_12__.NgClass],
  pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_12__.AsyncPipe, _shared_pipes_currency_format_pipe__WEBPACK_IMPORTED_MODULE_7__.CurrencyFormatPipe],
  styles: ["p[_ngcontent-%COMP%]:after {\n  display: \"block\";\n  content: \"\";\n  animation-name: load;\n  animation-duration: 3s;\n  animation-timing-function: linear;\n  animation-iteration-count: infinite;\n}\n\n@keyframes load {\n  0% {\n    content: \".\";\n  }\n  16% {\n    content: \"..\";\n  }\n  32% {\n    content: \"...\";\n  }\n  64% {\n    content: \"....\";\n  }\n  80% {\n    content: \".....\";\n  }\n}\n\n.dars[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtY2hlY2tvdXQuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxnQkFBQTtFQUNBLFdBQUE7RUFDQSxvQkFBQTtFQUNBLHNCQUFBO0VBQ0EsaUNBQUE7RUFDQSxtQ0FBQTtBQUNGOztBQUVBO0VBQ0U7SUFBRyxZQUFBO0VBRUg7RUFEQTtJQUFJLGFBQUE7RUFJSjtFQUhBO0lBQUksY0FBQTtFQU1KO0VBTEE7SUFBSSxlQUFBO0VBUUo7RUFQQTtJQUFJLGdCQUFBO0VBVUo7QUFDRjs7QUFSQTtFQUNFLGtCQUFBO0FBVUYiLCJmaWxlIjoicGFnZS1jaGVja291dC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbInA6YWZ0ZXIge1xuICBkaXNwbGF5OlwiYmxvY2tcIjtcbiAgY29udGVudDpcIlwiO1xuICBhbmltYXRpb24tbmFtZTpsb2FkO1xuICBhbmltYXRpb24tZHVyYXRpb246M3M7XG4gIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246bGluZWFyO1xuICBhbmltYXRpb24taXRlcmF0aW9uLWNvdW50OmluZmluaXRlO1xufVxuXG5Aa2V5ZnJhbWVzIGxvYWQge1xuICAwJXtjb250ZW50OlwiLlwifVxuICAxNiV7Y29udGVudDpcIi4uXCJ9XG4gIDMyJXtjb250ZW50OlwiLi4uXCJ9XG4gIDY0JXtjb250ZW50OlwiLi4uLlwifVxuICA4MCV7Y29udGVudDpcIi4uLi4uXCJ9XG59XG5cbi5kYXJzIHtcbiAgbWFyZ2luLWJvdHRvbTogOHB4O1xufSJdfQ== */"]
});

/***/ }),

/***/ 10266:
/*!***********************************************************************************!*\
  !*** ./src/app/@modules/marketplace/pages/page-compare/page-compare.component.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageCompareComponent": () => (/* binding */ PageCompareComponent)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ 92218);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs/operators */ 85921);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_root_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/services/root.service */ 36603);
/* harmony import */ var _shared_services_compare_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/services/compare.service */ 18829);
/* harmony import */ var _shared_services_cart_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../@shared/services/cart.service */ 77535);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_components_rating_rating_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../@shared/components/rating/rating.component */ 28081);
/* harmony import */ var _shared_pipes_currency_format_pipe__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../@shared/pipes/currency-format.pipe */ 82543);











function PageCompareComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4, "You currently have not add in products to compare!");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "a", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7, "Continue");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} }
function PageCompareComponent_div_2_td_8_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "img", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const product_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("src", product_r9.images[0], _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵsanitizeUrl"]);
} }
function PageCompareComponent_div_2_td_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "a", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](2, PageCompareComponent_div_2_td_8_div_2_Template, 3, 1, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const product_r9 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("routerLink", ctx_r2.root.product(product_r9));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", product_r9.images == null ? null : product_r9.images.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](product_r9.name);
} }
function PageCompareComponent_div_2_td_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "app-rating", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const product_r12 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("value", product_r12.rating);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", product_r12.reviews, " Reviews ");
} }
function PageCompareComponent_div_2_td_16_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "span", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1, "In Stock");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} }
function PageCompareComponent_div_2_td_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, PageCompareComponent_div_2_td_16_span_1_Template, 2, 0, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const product_r13 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", product_r13.platform === "in-stock");
} }
function PageCompareComponent_div_2_td_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const product_r15 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 1, product_r15.price));
} }
const _c0 = function (a0) { return { "btn-loading": a0 }; };
function PageCompareComponent_div_2_td_24_Template(rf, ctx) { if (rf & 1) {
    const _r18 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "button", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function PageCompareComponent_div_2_td_24_Template_button_click_1_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r18); const product_r16 = restoredCtx.$implicit; const ctx_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r17.addToCart(product_r16); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2, "Add To Cart");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const product_r16 = ctx.$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](1, _c0, ctx_r6.addedToCartProducts.includes(product_r16)));
} }
function PageCompareComponent_div_2_tr_25_td_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const product_r21 = ctx.$implicit;
    const feature_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](feature_r19.values[product_r21.id] || "\u2014");
} }
function PageCompareComponent_div_2_tr_25_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](3, PageCompareComponent_div_2_tr_25_td_3_Template, 2, 1, "td", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const feature_r19 = ctx.$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](feature_r19.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r7.products);
} }
function PageCompareComponent_div_2_td_28_Template(rf, ctx) { if (rf & 1) {
    const _r25 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "button", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function PageCompareComponent_div_2_td_28_Template_button_click_1_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r25); const product_r23 = restoredCtx.$implicit; const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r24.remove(product_r23); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2, "Remove");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const product_r23 = ctx.$implicit;
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](1, _c0, ctx_r8.removedProducts.includes(product_r23)));
} }
function PageCompareComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "table", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7, "Product");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](8, PageCompareComponent_div_2_td_8_Template, 5, 3, "td", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](9, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](11, "Rating");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](12, PageCompareComponent_div_2_td_12_Template, 5, 2, "td", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](13, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](15, "platformType");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](16, PageCompareComponent_div_2_td_16_Template, 2, 1, "td", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](18, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](19, "Price");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](20, PageCompareComponent_div_2_td_20_Template, 3, 3, "td", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](21, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23, "Add To Cart");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](24, PageCompareComponent_div_2_td_24_Template, 3, 3, "td", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](25, PageCompareComponent_div_2_tr_25_Template, 4, 2, "tr", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](26, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](27, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](28, PageCompareComponent_div_2_td_28_Template, 3, 3, "td", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r1.products);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r1.products);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r1.products);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r1.products);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r1.products);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r1.features);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r1.products);
} }
const _c1 = function () { return { label: "Domains", url: "/" }; };
const _c2 = function () { return { label: "Compare", url: "" }; };
const _c3 = function (a0, a1) { return [a0, a1]; };
class PageCompareComponent {
    constructor(root, compare, cart) {
        this.root = root;
        this.compare = compare;
        this.cart = cart;
        this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_7__.Subject();
        this.products = [];
        this.features = [];
        this.addedToCartProducts = [];
        this.removedProducts = [];
    }
    ngOnInit() {
        this.compare.items$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_8__.takeUntil)(this.destroy$)).subscribe(products => {
            const features = [];
            products.forEach(product => {
                // Add a safety check for product.attributes
                if (product.attributes && Array.isArray(product.attributes)) {
                    product.attributes.forEach(productAttribute => {
                        let feature = features.find(eachFeature => eachFeature.name === productAttribute.name);
                        if (!feature) {
                            feature = {
                                name: productAttribute.name,
                                values: {}
                            };
                            features.push(feature);
                        }
                        // Add a safety check for productAttribute.values
                        if (productAttribute.values && Array.isArray(productAttribute.values)) {
                            feature.values[product.id] = productAttribute.values.map(x => x.name).join(', ');
                        }
                        else {
                            feature.values[product.id] = '—';
                        }
                    });
                }
            });
            // These assignments must happen outside/after the loops 
            // to ensure the UI updates even if loops are skipped
            this.products = products;
            this.features = features;
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    addToCart(product) {
        if (this.addedToCartProducts.includes(product)) {
            return;
        }
        this.addedToCartProducts.push(product);
        this.cart.add(product, 1).subscribe({
            complete: () => {
                this.addedToCartProducts = this.addedToCartProducts.filter(eachProduct => eachProduct !== product);
            }
        });
    }
    remove(product) {
        if (this.removedProducts.includes(product)) {
            return;
        }
        this.removedProducts.push(product);
        this.compare.remove(product).subscribe({
            complete: () => {
                this.removedProducts = this.removedProducts.filter(eachProduct => eachProduct !== product);
            }
        });
    }
}
PageCompareComponent.ɵfac = function PageCompareComponent_Factory(t) { return new (t || PageCompareComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_shared_services_root_service__WEBPACK_IMPORTED_MODULE_0__.RootService), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_shared_services_compare_service__WEBPACK_IMPORTED_MODULE_1__.CompareService), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_shared_services_cart_service__WEBPACK_IMPORTED_MODULE_2__.CartService)); };
PageCompareComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineComponent"]({ type: PageCompareComponent, selectors: [["app-compare"]], decls: 3, vars: 9, consts: [[3, "header", "breadcrumbs"], ["class", "block block-empty", 4, "ngIf"], ["class", "block", 4, "ngIf"], [1, "block", "block-empty"], [1, "container"], [1, "block-empty__body"], [1, "block-empty__message"], [1, "block-empty__actions"], ["routerLink", "/", 1, "btn", "btn-primary", "btn-sm"], [1, "block"], [1, "container-fluid"], [1, "table-responsive"], [1, "compare-table"], [4, "ngFor", "ngForOf"], [1, "compare-table__product-link", 3, "routerLink"], ["class", "compare-table__product-image product-image", 4, "ngIf"], [1, "compare-table__product-name"], [1, "compare-table__product-image", "product-image"], [1, "product-image__body"], ["alt", "", 1, "product-image__img", 3, "src"], [1, "compare-table__product-rating"], [3, "value"], [1, "compare-table__product-rating-legend"], ["class", "compare-table__product-badge badge badge-success", 4, "ngIf"], [1, "compare-table__product-badge", "badge", "badge-success"], [1, "btn", "btn-primary", 3, "ngClass", "click"], [1, "btn", "btn-secondary", "btn-sm", 3, "ngClass", "click"]], template: function PageCompareComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](0, "app-page-header", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, PageCompareComponent_div_1_Template, 8, 0, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](2, PageCompareComponent_div_2_Template, 29, 7, "div", 2);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("header", "Compare")("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction2"](6, _c3, _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction0"](4, _c1), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction0"](5, _c2)));
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", !ctx.products.length);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.products.length);
    } }, directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_3__.PageHeaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_10__.RouterLinkWithHref, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgForOf, _shared_components_rating_rating_component__WEBPACK_IMPORTED_MODULE_4__.RatingComponent, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgClass], pipes: [_shared_pipes_currency_format_pipe__WEBPACK_IMPORTED_MODULE_5__.CurrencyFormatPipe], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlLWNvbXBhcmUuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ 24913:
/*!***************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/pages/page-favorites/page-favorites.component.ts ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageFavoritesComponent": () => (/* binding */ PageFavoritesComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_root_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/services/root.service */ 36603);
/* harmony import */ var _shared_services_favorites_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/services/favorites.service */ 82622);
/* harmony import */ var _shared_services_cart_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../@shared/services/cart.service */ 77535);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_components_icon_icon_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../@shared/components/icon/icon.component */ 61718);









function PageFavoritesComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4, "You currently have not added any products to your favorites!");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "a", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7, "Continue");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
}

function PageFavoritesComponent_div_3_tr_17_a_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "a", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "img", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const product_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("routerLink", ctx_r4.root.product(product_r3));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("src", product_r3.images[0], _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsanitizeUrl"]);
  }
}

const _c0 = function (a0) {
  return {
    "btn-loading": a0
  };
};

function PageFavoritesComponent_div_3_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "tr", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "td", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](3, PageFavoritesComponent_div_3_tr_17_a_3_Template, 2, 2, "a", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "td", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "a", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](10, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "span", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12, "Classification: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "td", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](17, "td", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](19, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](21, "td", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](22, "button", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function PageFavoritesComponent_div_3_tr_17_Template_button_click_22_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r7);
      const product_r3 = restoredCtx.$implicit;
      const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
      return ctx_r6.addToCart(product_r3);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](23, "Add To Cart");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](24, "td", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](25, "button", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function PageFavoritesComponent_div_3_tr_17_Template_button_click_25_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r7);
      const product_r3 = restoredCtx.$implicit;
      const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
      return ctx_r8.remove(product_r3);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](26, "app-icon", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const product_r3 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", product_r3.images == null ? null : product_r3.images.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("href", ctx_r2.root.product(product_r3), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](product_r3.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](product_r3.classification);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](product_r3.datatype);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](product_r3.org.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction1"](8, _c0, ctx_r2.addedToCartProducts.includes(product_r3)));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction1"](10, _c0, ctx_r2.removedProducts.includes(product_r3)));
  }
}

function PageFavoritesComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "table", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "thead", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "tr", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "th", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6, "Image");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "th", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](8, "Product");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "th", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10, "Datatype");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](11, "th", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "th", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](13, "Action");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "th", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](15, "Remove");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "tbody", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](17, PageFavoritesComponent_div_3_tr_17_Template, 27, 12, "tr", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](18, "async");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](18, 1, ctx_r1.favorites.items$));
  }
}

const _c1 = function () {
  return {
    label: "Domains",
    url: "/"
  };
};

const _c2 = function () {
  return {
    label: "Favorites",
    url: ""
  };
};

const _c3 = function (a0, a1) {
  return [a0, a1];
};

class PageFavoritesComponent {
  constructor(root, favorites, cart) {
    this.root = root;
    this.favorites = favorites;
    this.cart = cart;
    this.addedToCartProducts = [];
    this.removedProducts = [];
  }

  addToCart(product) {
    if (this.addedToCartProducts.includes(product)) {
      return;
    }

    this.addedToCartProducts.push(product);
    this.cart.add(product, 1).subscribe({
      complete: () => {
        this.addedToCartProducts = this.addedToCartProducts.filter(eachProduct => eachProduct !== product);
      }
    });
  }

  remove(product) {
    if (this.removedProducts.includes(product)) {
      return;
    }

    this.removedProducts.push(product);
    this.favorites.remove(product).subscribe({
      complete: () => {
        this.removedProducts = this.removedProducts.filter(eachProduct => eachProduct !== product);
      }
    });
  }

}

PageFavoritesComponent.ɵfac = function PageFavoritesComponent_Factory(t) {
  return new (t || PageFavoritesComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_shared_services_root_service__WEBPACK_IMPORTED_MODULE_0__.RootService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_shared_services_favorites_service__WEBPACK_IMPORTED_MODULE_1__.FavoritesService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_shared_services_cart_service__WEBPACK_IMPORTED_MODULE_2__.CartService));
};

PageFavoritesComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({
  type: PageFavoritesComponent,
  selectors: [["app-favorites"]],
  decls: 5,
  vars: 13,
  consts: [[3, "header", "breadcrumbs"], ["class", "block block-empty", 4, "ngIf"], ["class", "block", 4, "ngIf"], [1, "block", "block-empty"], [1, "container"], [1, "block-empty__body"], [1, "block-empty__message"], [1, "block-empty__actions"], ["routerLink", "/", 1, "btn", "btn-primary", "btn-sm"], [1, "block"], [1, "container-fluid"], [1, "wishlist"], [1, "wishlist__head"], [1, "wishlist__row"], [1, "wishlist__column", "wishlist__column--image"], [1, "wishlist__column", "wishlist__column--product"], [1, "wishlist__column", "wishlist__column--stock"], [1, "wishlist__column", "wishlist__column--tocart"], [1, "wishlist__column", "wishlist__column--remove"], [1, "wishlist__body"], ["class", "wishlist__row", 4, "ngFor", "ngForOf"], [1, "product-image"], ["class", "product-image__body", 3, "routerLink", 4, "ngIf"], [1, "wishlist__product-name", 3, "href"], [1, "wishlist__product-rating"], [1, "wishlist__product-rating-legend", 2, "margin-left", "0px", "color", "#222"], [2, "font-weight", "700"], [1, "wishlist__column", "wishlist__column--stock", "text-danger"], ["type", "button", 1, "btn", "btn-primary", "btn-sm", 3, "ngClass", "click"], ["type", "button", 1, "btn", "btn-light", "btn-sm", "btn-svg-icon", 3, "ngClass", "click"], ["name", "cross-12", "size", "12"], [1, "product-image__body", 3, "routerLink"], ["alt", "", 1, "product-image__img", 3, "src"]],
  template: function PageFavoritesComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "app-page-header", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, PageFavoritesComponent_div_1_Template, 8, 0, "div", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "async");
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](3, PageFavoritesComponent_div_3_Template, 19, 3, "div", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "async");
    }

    if (rf & 2) {
      let tmp_2_0;
      let tmp_3_0;
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("header", "Favorites")("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction2"](10, _c3, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](8, _c1), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](9, _c2)));
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !((tmp_2_0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 4, ctx.favorites.items$)) == null ? null : tmp_2_0.length));
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", (tmp_3_0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 6, ctx.favorites.items$)) == null ? null : tmp_3_0.length);
    }
  },
  directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_3__.PageHeaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_6__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_7__.RouterLinkWithHref, _angular_common__WEBPACK_IMPORTED_MODULE_6__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_6__.NgClass, _shared_components_icon_icon_component__WEBPACK_IMPORTED_MODULE_4__.IconComponent],
  pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.AsyncPipe],
  styles: [".left-stock[_ngcontent-%COMP%] {\n  text-align: left;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtZmF2b3JpdGVzLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksZ0JBQUE7QUFDSiIsImZpbGUiOiJwYWdlLWZhdm9yaXRlcy5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5sZWZ0LXN0b2NrIHtcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xufSJdfQ== */"]
});

/***/ }),

/***/ 8678:
/*!*******************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/pages/page-marketplace/page-marketplace.component.ts ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageMarketplaceComponent": () => (/* binding */ PageMarketplaceComponent)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rxjs */ 92218);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs/operators */ 85921);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! rxjs/operators */ 59095);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! rxjs/operators */ 44661);
/* harmony import */ var _services_shop_sidebar_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../services/shop-sidebar.service */ 92720);
/* harmony import */ var _services_page_marketplace_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/page-marketplace.service */ 43779);
/* harmony import */ var _services_page_domain_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/page-domain.service */ 25586);
/* harmony import */ var _resolvers_products_list_resolver_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../resolvers/products-list-resolver.service */ 80704);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_root_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../@shared/services/root.service */ 36603);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_api_shop_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../@shared/api/shop.service */ 32053);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _components_shop_sidebar_shop_sidebar_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../components/shop-sidebar/shop-sidebar.component */ 71589);
/* harmony import */ var _components_products_view_products_view_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../components/products-view/products-view.component */ 60052);















function PageMarketplaceComponent_ng_container_1_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelement"](1, "app-shop-sidebar", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("offcanvas", ctx_r2.offcanvasMode);
} }
function PageMarketplaceComponent_ng_container_1_div_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelement"](1, "app-shop-sidebar", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("offcanvas", ctx_r3.offcanvasMode);
} }
function PageMarketplaceComponent_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](1, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](2, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](3, PageMarketplaceComponent_ng_container_1_div_3_Template, 2, 1, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](4, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](5, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](6, "app-products-view", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵlistener"]("gridChange", function PageMarketplaceComponent_ng_container_1_Template_app_products_view_gridChange_6_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrestoreView"](_r5); const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"](); return ctx_r4.onGridChange($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](7, PageMarketplaceComponent_ng_container_1_div_7_Template, 2, 1, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵclassMapInterpolate1"]("shop-layout shop-layout--sidebar--", ctx_r0.sidebarPosition, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("ngIf", ctx_r0.sidebarPosition === "start");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("layout", ctx_r0.viewMode)("offcanvas", ctx_r0.offcanvasMode);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("ngIf", ctx_r0.sidebarPosition === "end");
} }
function PageMarketplaceComponent_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](1, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](2, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](3, "app-products-view", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵlistener"]("gridChange", function PageMarketplaceComponent_ng_container_2_Template_app_products_view_gridChange_3_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrestoreView"](_r7); const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"](); return ctx_r6.onGridChange($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelement"](4, "app-shop-sidebar", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("layout", ctx_r1.viewMode)("grid", ctx_r1.getProductsViewLayout())("offcanvas", ctx_r1.offcanvasMode);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("offcanvas", ctx_r1.offcanvasMode);
} }
class PageMarketplaceComponent {
    constructor(root, router, route, pageService, shop, location) {
        this.root = root;
        this.router = router;
        this.route = route;
        this.pageService = pageService;
        this.shop = shop;
        this.location = location;
        this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_10__.Subject();
        this.currentGrid = 'grid-3-sidebar';
        this.columns = 3;
        this.viewMode = 'grid';
        this.sidebarPosition = 'start';
        this.breadcrumbs = [];
        this.pageHeader = '';
        /*
         * Page information only.
         *
         * Do NOT make another product API request here.
         */
        this.route.data
            .pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_11__.takeUntil)(this.destroy$))
            .subscribe(data => {
            var _a;
            this.breadcrumbs = [
                {
                    label: 'Domains',
                    url: this.root.home(),
                },
                {
                    label: 'Marketplace',
                    url: this.root.shop(),
                },
            ];
            const slug = this.getDomainSlug();
            this.pageHeader = !slug
                ? 'Marketplace'
                : (((_a = data.domain) === null || _a === void 0 ? void 0 : _a.name) || 'Marketplace');
        });
        /*
         * Initialize options from the URL.
         *
         * PageMarketplaceService remains responsible for
         * pagination, sorting, and filter state.
         */
        this.route.queryParams
            .pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_11__.takeUntil)(this.destroy$))
            .subscribe(queryParams => {
            this.pageService.setOptions((0,_resolvers_products_list_resolver_service__WEBPACK_IMPORTED_MODULE_3__.parseProductsListParams)(queryParams), false);
        });
        /*
         * SINGLE product-loading pipeline.
         *
         * Important:
         * - Do NOT overwrite filterValues with {}
         * - Do NOT make a second optionsChange$ subscription
         * - Do NOT call getMarketplaceProducts()
         *
         * When page, limit, sort, or filters change,
         * this request becomes the source of truth.
         */
        this.pageService.optionsChange$
            .pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_12__.switchMap)(() => {
            this.updateUrl();
            this.pageService.setIsLoading(true);
            console.log('Marketplace request options:', this.pageService.options);
            return this.shop.getProductsList(this.getDomainSlug(), this.pageService.options).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_13__.finalize)(() => {
                this.pageService.setIsLoading(false);
            }));
        }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_11__.takeUntil)(this.destroy$))
            .subscribe(list => {
            /*
             * ShopService already returns ProductsList.
             *
             * Don't convert:
             * response.products -> items
             * response.count -> total
             *
             * in this component.
             */
            console.log('Marketplace ProductsList:', list);
            this.pageService.setList(list);
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    updateUrl() {
        const tree = this.router.parseUrl(this.router.url);
        tree.queryParams = this.getQueryParams();
        this.location.replaceState(tree.toString());
    }
    getQueryParams() {
        const params = {};
        const options = this.pageService.options;
        /*
         * Pagination.
         */
        if ('page' in options &&
            options.page !== 1) {
            params.page = options.page;
        }
        if ('limit' in options &&
            options.limit !== 12) {
            params.limit = options.limit;
        }
        /*
         * Sorting.
         */
        if ('sort' in options &&
            options.sort !== 'default') {
            params.sort = options.sort;
        }
        /*
         * IMPORTANT:
         * Preserve selected filters in the URL.
         *
         * The exact URL serialization depends on the
         * structure returned by parseProductsListParams().
         */
        if ('filterValues' in options &&
            options.filterValues &&
            Object.keys(options.filterValues).length) {
            Object.keys(options.filterValues).forEach(key => {
                const value = options.filterValues[key];
                if (value !== null &&
                    value !== undefined &&
                    value !== '' &&
                    (!Array.isArray(value) ||
                        value.length > 0)) {
                    params[key] = value;
                }
            });
        }
        return params;
    }
    /*
     * The root marketplace represents all domains.
     *
     * If your API explicitly requires "all" instead
     * of null, change the final null back to "all".
     */
    getDomainSlug() {
        return (this.route.snapshot.params.domainSlug ||
            this.route.snapshot.data.domainSlug ||
            null);
    }
    getProductsViewLayout() {
        return ('grid-' +
            this.columns +
            '-full');
    }
    get offcanvasMode() {
        return 'mobile';
    }
    onGridChange(grid) {
        this.currentGrid = grid;
    }
}
PageMarketplaceComponent.ɵfac = function PageMarketplaceComponent_Factory(t) { return new (t || PageMarketplaceComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdirectiveInject"](_shared_services_root_service__WEBPACK_IMPORTED_MODULE_4__.RootService), _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_14__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_14__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdirectiveInject"](_services_page_marketplace_service__WEBPACK_IMPORTED_MODULE_1__.PageMarketplaceService), _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdirectiveInject"](_shared_api_shop_service__WEBPACK_IMPORTED_MODULE_5__.ShopService), _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdirectiveInject"](_angular_common__WEBPACK_IMPORTED_MODULE_15__.Location)); };
PageMarketplaceComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdefineComponent"]({ type: PageMarketplaceComponent, selectors: [["app-grid"]], features: [_angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵProvidersFeature"]([
            {
                provide: _services_page_marketplace_service__WEBPACK_IMPORTED_MODULE_1__.PageMarketplaceService,
                useClass: _services_page_marketplace_service__WEBPACK_IMPORTED_MODULE_1__.PageMarketplaceService,
            },
            {
                provide: _services_page_domain_service__WEBPACK_IMPORTED_MODULE_2__.PageDomainService,
                useExisting: _services_page_marketplace_service__WEBPACK_IMPORTED_MODULE_1__.PageMarketplaceService,
            },
            {
                provide: _services_shop_sidebar_service__WEBPACK_IMPORTED_MODULE_0__.ShopSidebarService,
                useClass: _services_shop_sidebar_service__WEBPACK_IMPORTED_MODULE_0__.ShopSidebarService,
            },
        ])], decls: 3, vars: 3, consts: [[3, "breadcrumbs"], [4, "ngIf"], [1, "container-fluid"], ["class", "shop-layout__sidebar", 4, "ngIf"], [1, "shop-layout__content"], [1, "block"], ["grid", "grid-3-sidebar", 3, "layout", "offcanvas", "gridChange"], [1, "shop-layout__sidebar"], [3, "offcanvas"], [1, "container"], [3, "layout", "grid", "offcanvas", "gridChange"]], template: function PageMarketplaceComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelement"](0, "app-page-header", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](1, PageMarketplaceComponent_ng_container_1_Template, 8, 7, "ng-container", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](2, PageMarketplaceComponent_ng_container_2_Template, 5, 4, "ng-container", 1);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("breadcrumbs", ctx.breadcrumbs);
        _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("ngIf", ctx.columns === 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("ngIf", ctx.columns > 3);
    } }, directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_6__.PageHeaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_15__.NgIf, _components_shop_sidebar_shop_sidebar_component__WEBPACK_IMPORTED_MODULE_7__.ShopSidebarComponent, _components_products_view_products_view_component__WEBPACK_IMPORTED_MODULE_8__.ProductsViewComponent], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlLW1hcmtldHBsYWNlLmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 6239:
/*!***********************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/pages/page-order-success/page-order-success.component.ts ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageOrderSuccessComponent": () => (/* binding */ PageOrderSuccessComponent)
/* harmony export */ });
/* harmony import */ var _data_toyota__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../data/toyota */ 44026);
/* harmony import */ var _data_account_order_details__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../data/account-order-details */ 47405);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _app_shared_services_root_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../app/@shared/services/root.service */ 36603);
/* harmony import */ var _azure_msal_angular__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @azure/msal-angular */ 14084);
/* harmony import */ var _shared_services_app_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/services/app.service */ 5406);
/* harmony import */ var _shared_services_cart_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../@shared/services/cart.service */ 77535);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_components_icon_icon_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../@shared/components/icon/icon.component */ 61718);
/* harmony import */ var _shared_pipes_currency_format_pipe__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../@shared/pipes/currency-format.pipe */ 82543);











function PageOrderSuccessComponent_div_8_div_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](3, "i", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4, " Product Onboarding (Engine B) ");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "h4", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "p", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "Postgres Staging Audit ID");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](10, "hr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](11, "h6");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](12, "Next Steps:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](13, "ul", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](15, "Your product is currently in the ");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](16, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](17, "Audit Queue");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](18, ".");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](19, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](20, "Admin will review metadata for quality compliance.");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](21, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](22, "You will receive an email once the product is \"Live\".");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("#STG-", ctx_r5.receipt.stagingId, "");
} }
function PageOrderSuccessComponent_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](3, "i", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4, "Data Access Request Entitlements (Engine A) ");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "h4", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "p", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "ServiceNow Reference Number");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](10, "hr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](11, "h6");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](12, "Next Steps:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](13, "ul", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](15, "The Technical Owner has been notified.");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](16, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](17, "Track progress in the ");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](19, "ServiceNow Portal");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](20, ".");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](21, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](22, "Access is usually granted within 24-48 hours.");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](23, PageOrderSuccessComponent_div_8_div_23_Template, 23, 1, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](24, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](25, "button", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](26, "Back to Marketplace");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r0.receipt.ritm);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r0.receipt == null ? null : ctx_r0.receipt.stagingId);
} }
function PageOrderSuccessComponent_div_21_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "ul", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4, "Order Type:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](6, "Product(s)");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "Request Number:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](13, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](14, "Created At:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](15, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](19, "Total:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](20, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](21);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](22, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](23, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](24, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](25, "Payment method:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](26, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("#", ctx_r1.orderId, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r1.order.date);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](22, 4, ctx_r1.order.total));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r1.order.paymentMethod);
} }
function PageOrderSuccessComponent_div_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "ul", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4, "Order Type:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](6, "DAR(s)");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "Request Number:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](13, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](14, "Created At:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](15, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](19, "Total:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](20, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](21);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](22, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](23, "li", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](24, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](25, "Payment method:");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](26, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("#", ctx_r2.orderId, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r2.order.date);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](22, 4, ctx_r2.order.total));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r2.order.paymentMethod);
} }
function PageOrderSuccessComponent_table_33_tr_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "td", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "div", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](3, "img", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "td", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "div", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](8, "Standard Onboarding");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](9, "td", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](11, "td", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](13, "td", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](15, "td", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](16, "1");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "td", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](19, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r8 = ctx.$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("src", ctx_r6.getProductImage(item_r8.product.image), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r8.product.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r8.product.domain);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r8.product.datatype);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](item_r8.product.classification);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](19, 6, 0));
} }
function PageOrderSuccessComponent_table_33_tr_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "td", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "No products in this request.");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} }
function PageOrderSuccessComponent_table_33_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "table");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "thead", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "th", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4, "Product");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "th", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](6, "Domain");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "th", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](8, "Datatype");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](9, "th", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](10, "Classification");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](11, "th", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](12, "Qty");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](13, "th", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](14, "Total");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](15, "tbody", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](16, PageOrderSuccessComponent_table_33_tr_16_Template, 20, 8, "tr", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](17, PageOrderSuccessComponent_table_33_tr_17_Template, 3, 0, "tr", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx_r3.receipt == null ? null : ctx_r3.receipt.items);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", !(ctx_r3.receipt == null ? null : ctx_r3.receipt.items == null ? null : ctx_r3.receipt.items.length));
} }
function PageOrderSuccessComponent_table_34_tr_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "td", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "div", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](3, "img", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "td", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](6, "Data Access Request");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "div", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "Note: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](10, " We will provide the annouce ment here! ");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](11, "td", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](13, "td", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](15, "td", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "td", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](19, "td", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](21, "td", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](22, "1");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](23, "td", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](25, "currencyFormat");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const dar_r11 = ctx.$implicit;
    const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](dar_r11.v_dar_dataDomainSelect);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r9.formatPlatform(dar_r11.v_dar_platform));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](dar_r11.v_dar_environment);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r9.formatOrNA(dar_r11.v_dar_pi));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r9.formatOrNA(dar_r11.v_dar_spi));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](25, 6, 0));
} }
function PageOrderSuccessComponent_table_34_tr_21_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "td", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "No DARs in this request.");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} }
function PageOrderSuccessComponent_table_34_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "table");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "thead", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "th", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4, "Data Access Request");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "th", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](6, "Domain");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "th", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](8, "Platform");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](9, "th", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](10, "Environment");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](11, "th", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](12, "PI");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](13, "th", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](14, "SPI");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](15, "th", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](16, "Qty");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "th", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](18, "Total");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](19, "tbody", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](20, PageOrderSuccessComponent_table_34_tr_20_Template, 26, 8, "tr", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](21, PageOrderSuccessComponent_table_34_tr_21_Template, 3, 0, "tr", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx_r4.receipt == null ? null : ctx_r4.receipt.darRequests);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", !(ctx_r4.receipt == null ? null : ctx_r4.receipt.darRequests == null ? null : ctx_r4.receipt.darRequests.length));
} }
class PageOrderSuccessComponent {
    constructor(route, root, msalService, appSvc, cart) {
        this.route = route;
        this.root = root;
        this.msalService = msalService;
        this.appSvc = appSvc;
        this.cart = cart;
        this.order = _data_account_order_details__WEBPACK_IMPORTED_MODULE_1__.order;
        this.loggedInUser = false;
        this.toyota = _data_toyota__WEBPACK_IMPORTED_MODULE_0__.toyota;
        this.orderId = '';
        this.activeTab = 'products'; // Default tab
    }
    ngOnInit() {
        var _a, _b, _c, _d;
        this.route.queryParams.subscribe(params => {
            this.orderId = params['id'] || 'REQ-SUCCESS';
        });
        this.receipt = this.cart.getReceipt();
        // If receipt was set by checkout, copy over display fields so template shows them
        if (this.receipt) {
            if (this.receipt.date) {
                this.order.date = this.receipt.date;
            }
            if (this.receipt.total != null) {
                this.order.total = this.receipt.total;
            }
            if (this.receipt.id) {
                this.orderId = this.receipt.id;
            }
        }
        // Auto-select tab using receipt arrays (items / darRequests)
        if (((_b = (_a = this.receipt) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            this.activeTab = 'products';
        }
        else if (((_d = (_c = this.receipt) === null || _c === void 0 ? void 0 : _c.darRequests) === null || _d === void 0 ? void 0 : _d.length) > 0) {
            this.activeTab = 'dars';
        }
    }
    getProductImage(product) {
        const fallback = 'assets/images/product_images/data-access-request.jpg';
        if (!product)
            return fallback;
        let img = '';
        if (Array.isArray(product.images) && product.images.length) {
            img = String(product.images[0]).trim();
        }
        else if (product.image) {
            img = String(product.image).trim();
        }
        else {
            return fallback;
        }
        if (!img)
            return fallback;
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('//')) {
            return img;
        }
        if (img.startsWith('/') || img.startsWith('assets/')) {
            return img;
        }
        return `assets/images/product_images/${img}`;
    }
    formatPlatform(platform) {
        if (!platform)
            return '';
        const normalized = (platform || '').toString().toUpperCase();
        const tbdpKeys = ['IRM', 'PASA', 'C360', 'Q360', 'IRM-PRICING'];
        return tbdpKeys.some(k => normalized.includes(k)) ? 'TBDP' : platform;
    }
    formatOrNA(value) {
        if (value == null)
            return 'N/A';
        const s = String(value).trim();
        return s === '' ? 'N/A' : s;
    }
    checkAccount() {
        const accounts = this.msalService.instance.getAllAccounts();
        this.loggedInUser = accounts.length > 0;
    }
}
PageOrderSuccessComponent.ɵfac = function PageOrderSuccessComponent_Factory(t) { return new (t || PageOrderSuccessComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_8__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_app_shared_services_root_service__WEBPACK_IMPORTED_MODULE_2__.RootService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_azure_msal_angular__WEBPACK_IMPORTED_MODULE_9__.MsalService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_services_app_service__WEBPACK_IMPORTED_MODULE_3__.AppService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_services_cart_service__WEBPACK_IMPORTED_MODULE_4__.CartService)); };
PageOrderSuccessComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineComponent"]({ type: PageOrderSuccessComponent, selectors: [["app-page-order-success"]], decls: 38, vars: 14, consts: [[1, "container", "py-5", "text-center"], [1, "text-muted"], [1, "row", "mt-5", "text-start", "justify-content-center"], ["class", "col-md-5 mx-2 card p-0 border-primary", 4, "ngIf"], [1, "block", "order-success"], [1, "container"], [1, "order-success__body"], [1, "order-success__header"], ["name", "check-100", "size", "100", 1, "order-success__icon"], [1, "order-success__title"], [1, "order-success__subtitle"], [1, "order-success__actions", "mb-4"], ["routerLink", "/marketplace/user/orders", 1, "btn", "btn-xs", "btn-secondary"], ["class", "order-success__meta", "style", "margin-top: 50px;", 4, "ngIf"], [1, "order-success__tabs", "mt-5"], [1, "nav", "nav-pills", "justify-content-center"], [1, "nav-item"], [1, "nav-link", 3, "click"], [1, "card", "mt-3"], [1, "order-list"], [4, "ngIf"], [1, "order-success__actions", "mt-5", "text-center"], ["routerLink", "/", 1, "btn", "btn-secondary", "btn-lg"], [1, "col-md-5", "mx-2", "card", "p-0", "border-primary"], [1, "col-md-12", "mx-2", "card", "p-0", "border-primary"], [1, "card-header", "bg-primary", "text-white"], [1, "ri-shield-user-line", "me-2"], [1, "card-body"], [1, "text-primary"], [1, "small", "text-muted"], [1, "small"], ["class", "col-md-5 mx-2 card p-0 border-dark", 4, "ngIf"], [1, "mt-5"], [1, "col-md-5", "mx-2", "card", "p-0", "border-dark"], [1, "col-md-12", "mx-2", "card", "p-0", "border-dark"], [1, "card-header", "bg-dark", "text-white"], [1, "ri-database-2-line", "me-2"], [1, "text-dark"], [1, "order-success__meta", 2, "margin-top", "50px"], [1, "order-success__meta-list"], [1, "order-success__meta-item"], [1, "order-success__meta-title"], [1, "order-success__meta-value"], [1, "order-list__header"], ["colspan", "2", 1, "order-list__column-label"], [1, "order-list__column-total", "text-center"], [1, "order-list__column-quantity"], [1, "order-list__column-total"], [1, "order-list__products"], [4, "ngFor", "ngForOf"], [1, "order-list__column-image", 2, "padding", "0px 32px 0 32px"], [1, "product-image"], ["width", "80", "alt", "item.product.name", 3, "src"], [1, "order-list__column-product", 2, "padding-left", "19px !important"], [1, "text-muted", "small"], ["colspan", "4", 1, "text-center", "py-4", "text-muted"], [1, "order-list__column-total", "text-end"], ["src", "assets/images/product_images/data-access-request.jpg", "width", "80", "alt", "Data Access Request"], [1, "text-muted", "text-danger", "small"], ["colspan", "2", 1, "text-center", "py-4", "text-muted"]], template: function PageOrderSuccessComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "h2");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "h2");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4, "Request Submitted Successfully!");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "p", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](6, "Your requests have been partitioned and sent to the respective fulfillment queues.");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](8, PageOrderSuccessComponent_div_8_Template, 27, 2, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](9, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](11, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](13, "app-icon", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "h1", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](16, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](17, "Your request has been successfully submitted!");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](19, "a", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](20, "Go To Order History");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](21, PageOrderSuccessComponent_div_21_Template, 28, 6, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](22, PageOrderSuccessComponent_div_22_Template, 28, 6, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](23, "div", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](24, "ul", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](25, "li", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](26, "button", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageOrderSuccessComponent_Template_button_click_26_listener() { return ctx.activeTab = "products"; });
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](27);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](28, "li", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](29, "button", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageOrderSuccessComponent_Template_button_click_29_listener() { return ctx.activeTab = "dars"; });
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](30);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](31, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](32, "div", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](33, PageOrderSuccessComponent_table_33_Template, 18, 2, "table", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](34, PageOrderSuccessComponent_table_34_Template, 22, 2, "table", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](35, "div", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](36, "a", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](37, "Back to Marketplace");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate2"]("Hi, ", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.givenName, " ", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.surname, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.receipt == null ? null : ctx.receipt.ritm);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Thank you, ", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.givenName, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.activeTab === "products");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.activeTab === "dars");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("active", ctx.activeTab === "products");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" Products (", (ctx.receipt == null ? null : ctx.receipt.items == null ? null : ctx.receipt.items.length) || 0, ") ");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("active", ctx.activeTab === "dars");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" DARs (", (ctx.receipt == null ? null : ctx.receipt.darRequests == null ? null : ctx.receipt.darRequests.length) || 0, ") ");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.activeTab === "products");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.activeTab === "dars");
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_10__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterLink, _shared_components_icon_icon_component__WEBPACK_IMPORTED_MODULE_5__.IconComponent, _angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterLinkWithHref, _angular_common__WEBPACK_IMPORTED_MODULE_10__.NgForOf], pipes: [_shared_pipes_currency_format_pipe__WEBPACK_IMPORTED_MODULE_6__.CurrencyFormatPipe], styles: [".order-success__header[_ngcontent-%COMP%] {\n  padding: 60px 0 0px;\n  text-align: center;\n}\n\n.nav-pills[_ngcontent-%COMP%]   .nav-link[_ngcontent-%COMP%] {\n  background: #f7f7f7;\n  border: 1px solid #ebebeb;\n  color: #333;\n  margin: 0 5px;\n  padding: 10px 25px;\n  font-weight: 600;\n  transition: all 0.2s ease;\n}\n\n.nav-pills[_ngcontent-%COMP%]   .nav-link.active[_ngcontent-%COMP%] {\n  background-color: var(--primary-color, #007bff);\n  border-color: var(--primary-color, #007bff);\n  color: #fff;\n}\n\n.nav-pills[_ngcontent-%COMP%]   .nav-link[_ngcontent-%COMP%]:hover:not(.active) {\n  background: #eee;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2Utb3JkZXItc3VjY2Vzcy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLG1CQUFBO0VBQ0Esa0JBQUE7QUFDSjs7QUFHRTtFQUNFLG1CQUFBO0VBQ0EseUJBQUE7RUFDQSxXQUFBO0VBQ0EsYUFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSx5QkFBQTtBQUFKOztBQUVJO0VBQ0UsK0NBQUE7RUFDQSwyQ0FBQTtFQUNBLFdBQUE7QUFBTjs7QUFHSTtFQUNFLGdCQUFBO0FBRE4iLCJmaWxlIjoicGFnZS1vcmRlci1zdWNjZXNzLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLm9yZGVyLXN1Y2Nlc3NfX2hlYWRlciB7XG4gICAgcGFkZGluZzogNjBweCAwIDBweDtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG5cbi5uYXYtcGlsbHMge1xuICAubmF2LWxpbmsge1xuICAgIGJhY2tncm91bmQ6ICNmN2Y3Zjc7XG4gICAgYm9yZGVyOiAxcHggc29saWQgI2ViZWJlYjtcbiAgICBjb2xvcjogIzMzMztcbiAgICBtYXJnaW46IDAgNXB4O1xuICAgIHBhZGRpbmc6IDEwcHggMjVweDtcbiAgICBmb250LXdlaWdodDogNjAwO1xuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG5cbiAgICAmLmFjdGl2ZSB7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjMDA3YmZmKTsgLy8gb3IgeW91ciBicmFuZCBjb2xvclxuICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjMDA3YmZmKTtcbiAgICAgIGNvbG9yOiAjZmZmO1xuICAgIH1cblxuICAgICY6aG92ZXI6bm90KC5hY3RpdmUpIHtcbiAgICAgIGJhY2tncm91bmQ6ICNlZWU7XG4gICAgfVxuICB9XG59Il19 */"] });


/***/ }),

/***/ 11362:
/*!***********************************************************************************!*\
  !*** ./src/app/@modules/marketplace/pages/page-product/page-product.component.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageProductComponent": () => (/* binding */ PageProductComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_api_shop_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/api/shop.service */ 32053);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_components_product_components_request_access_request_access_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/components/product/components/request-access/request-access.component */ 27969);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _shared_components_product_product_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/components/product/product.component */ 87677);
/* harmony import */ var _components_product_tabs_product_tabs_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/product-tabs/product-tabs.component */ 62758);
/* harmony import */ var _components_product_sidebar_product_sidebar_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/product-sidebar/product-sidebar.component */ 71619);
/* harmony import */ var _blocks_block_products_carousel_block_products_carousel_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../blocks/block-products-carousel/block-products-carousel.component */ 23563);











function PageProductComponent_app_header_request_access_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](0, "app-header-request-access", 3);
  }

  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("product", ctx_r0.product);
  }
}

function PageProductComponent_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](3, "app-product", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](4, "app-product-tabs", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("product", ctx_r1.product)("layout", ctx_r1.layout);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("product", ctx_r1.product);
  }
}

function PageProductComponent_ng_container_3_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "app-product-sidebar");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
}

function PageProductComponent_ng_container_3_div_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "app-product-sidebar");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
  }
}

const _c0 = function () {
  return [];
};

function PageProductComponent_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, PageProductComponent_ng_container_3_div_3_Template, 2, 0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](6, "app-product", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](7, "app-product-tabs", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](8, "app-block-products-carousel", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](9, "async");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](10, PageProductComponent_ng_container_3_div_10_Template, 2, 0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassMapInterpolate1"]("shop-layout shop-layout--sidebar--", ctx_r2.sidebarPosition, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r2.sidebarPosition === "start");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("product", ctx_r2.product)("layout", ctx_r2.layout);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("product", ctx_r2.product)("withSidebar", true);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("products", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](9, 12, ctx_r2.relatedProducts$) || _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction0"](14, _c0))("rows", 1)("withSidebar", true);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r2.sidebarPosition === "end");
  }
}

const _c1 = function () {
  return {
    label: "Domains",
    url: "/"
  };
};

const _c2 = function () {
  return {
    label: "Marketplace",
    url: "/marketplace"
  };
};

const _c3 = function (a0) {
  return {
    label: a0,
    url: ""
  };
};

const _c4 = function (a0, a1, a2) {
  return [a0, a1, a2];
};

class PageProductComponent {
  constructor(shop, route) {
    this.shop = shop;
    this.route = route;
    this.dropcartType = 'offcanvas'; // or whatever value is appropriate

    this.layout = 'standard';
    this.sidebarPosition = 'start'; // For LTR scripts "start" is "left" and "end" is "right"
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.layout = data.layout || this.layout;
      this.sidebarPosition = data.sidebarPosition || this.sidebarPosition;
      this.product = data.product;
      this.relatedProducts$ = this.shop.getRelatedProducts(data.product);
    });
  }

}

PageProductComponent.ɵfac = function PageProductComponent_Factory(t) {
  return new (t || PageProductComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_api_shop_service__WEBPACK_IMPORTED_MODULE_0__.ShopService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_8__.ActivatedRoute));
};

PageProductComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineComponent"]({
  type: PageProductComponent,
  selectors: [["app-page-product"]],
  decls: 4,
  vars: 12,
  consts: [["type", "offcanvas", 3, "product", 4, "ngIf"], [3, "breadcrumbs"], [4, "ngIf"], ["type", "offcanvas", 3, "product"], [1, "block"], [1, "container-fluid"], [3, "product", "layout"], [3, "product"], [1, "container"], ["class", "shop-layout__sidebar", 4, "ngIf"], [1, "shop-layout__content"], [3, "product", "withSidebar"], ["header", "Related Products", "layout", "grid-4-sm", 3, "products", "rows", "withSidebar"], [1, "shop-layout__sidebar"]],
  template: function PageProductComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](0, PageProductComponent_app_header_request_access_0_Template, 1, 1, "app-header-request-access", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](1, "app-page-header", 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](2, PageProductComponent_ng_container_2_Template, 5, 3, "ng-container", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, PageProductComponent_ng_container_3_Template, 11, 15, "ng-container", 2);
    }

    if (rf & 2) {
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.dropcartType === "offcanvas");
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction3"](8, _c4, _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction0"](4, _c1), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction0"](5, _c2), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](6, _c3, (ctx.product == null ? null : ctx.product.name) || "")));
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.layout !== "sidebar");
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
      _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.layout === "sidebar");
    }
  },
  directives: [_angular_common__WEBPACK_IMPORTED_MODULE_9__.NgIf, _shared_components_product_components_request_access_request_access_component__WEBPACK_IMPORTED_MODULE_1__.RequestAccessComponent, _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_2__.PageHeaderComponent, _shared_components_product_product_component__WEBPACK_IMPORTED_MODULE_3__.ProductComponent, _components_product_tabs_product_tabs_component__WEBPACK_IMPORTED_MODULE_4__.ProductTabsComponent, _components_product_sidebar_product_sidebar_component__WEBPACK_IMPORTED_MODULE_5__.ProductSidebarComponent, _blocks_block_products_carousel_block_products_carousel_component__WEBPACK_IMPORTED_MODULE_6__.BlockProductsCarouselComponent],
  pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_9__.AsyncPipe],
  styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlLXByb2R1Y3QuY29tcG9uZW50LnNjc3MifQ== */"]
});

/***/ }),

/***/ 97065:
/*!*********************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/pages/page-request-form/page-request-form.component.ts ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageRequestFormComponent": () => (/* binding */ PageRequestFormComponent)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 90587);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../environments/environment */ 92340);
/* harmony import */ var _azure_msal_browser__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @azure/msal-browser */ 7771);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_product_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/services/product.service */ 89090);
/* harmony import */ var _azure_msal_angular__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @azure/msal-angular */ 14084);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _shared_services_cart_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../@shared/services/cart.service */ 77535);
/* harmony import */ var _shared_services_app_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/services/app.service */ 5406);
/* harmony import */ var _shared_directives_click_directive__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../@shared/directives/click.directive */ 16855);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/common */ 36362);













const _c0 = function (a0) { return { "btn-loading": a0 }; };
const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country';
class PageRequestFormComponent {
    constructor(productService, msalService, router, fb, http, cart, appSvc) {
        this.productService = productService;
        this.msalService = msalService;
        this.router = router;
        this.fb = fb;
        this.http = http;
        this.cart = cart;
        this.appSvc = appSvc;
        this.currentApplicationVersion = _environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.version;
        this.quantity = new _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormControl(1);
        this.title = "Request Access";
        this.addingToCart = false;
    }
    ngOnInit() {
        this.form = this.fb.group({
            requesting_id: ['Me'],
            requesting_tdsp_processing: ['No'],
            appropriateTDSPPod: [''],
            v_dar_workdayID_created_by: [''],
            workdayID: [''],
            v_dar_objectid_createdby: [''],
            v_dar_objectid_reqfor: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required],
            v_dar_dm_version: [''],
            productName: [''],
            quantity: [1],
            // Add your form controls here
        });
    }
    getProfile() {
        this.http.get(GRAPH_ENDPOINT).subscribe({
            next: (profile) => {
                this.profile = profile;
            },
            error: (err) => {
                if (_azure_msal_browser__WEBPACK_IMPORTED_MODULE_6__.InteractionRequiredAuthError.isInteractionRequiredError(err.errorCode)) {
                    this.msalService.acquireTokenPopup({
                        scopes: ["user.read"]
                    }).subscribe({
                        next: (result) => {
                            this.http.get(GRAPH_ENDPOINT).subscribe(profile => {
                                this.profile = profile;
                            });
                        }
                    });
                }
            }
        });
    }
    addToCart() {
        var _a;
        const quantity = (_a = this.form.get('quantity')) === null || _a === void 0 ? void 0 : _a.value;
        if (!this.addingToCart && this.product && quantity && quantity > 0) {
            this.addingToCart = true;
            this.cart.add(this.product, quantity).subscribe({
                complete: () => this.addingToCart = false
            });
        }
    }
    onFormSubmit(form) {
        var _a, _b;
        if (form.valid) {
            const quantity = (_b = (_a = this.form.get('quantity')) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 1;
            this.cart.add(this.product, quantity).subscribe({
                complete: () => console.log('Product added to cart')
            });
        }
    }
    open() {
        const url = `https://data.toyota.com/docs/protected/domains`;
        const w = 1200; // Set width to 800px
        const h = screen.height;
        const left = screen.width - w; // Adjusted to position at the right edge
        const top = 0; // Adjusted to position at the top edge
        const randomnumber = Math.floor((Math.random() * 100) + 1);
        // tslint:disable-next-line:max-line-length
        window.open(url, '_blank', 'PopUp' + randomnumber + ',scrollbars=1,menubar=0,resizable=1,width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
    }
}
PageRequestFormComponent.ɵfac = function PageRequestFormComponent_Factory(t) { return new (t || PageRequestFormComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_services_product_service__WEBPACK_IMPORTED_MODULE_1__.ProductService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_azure_msal_angular__WEBPACK_IMPORTED_MODULE_8__.MsalService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_9__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_10__.HttpClient), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_services_cart_service__WEBPACK_IMPORTED_MODULE_2__.CartService), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdirectiveInject"](_shared_services_app_service__WEBPACK_IMPORTED_MODULE_3__.AppService)); };
PageRequestFormComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineComponent"]({ type: PageRequestFormComponent, selectors: [["app-page-request-form"]], inputs: { product: "product" }, decls: 600, vars: 56, consts: [[1, "container-fluid"], [1, "col-lg-12"], [1, "col-lg-12", "mt-6"], [1, "col-lg-2", "left"], [1, "requirements"], [1, "text-danger", "validation-margin", "text-validation"], [1, "mr-6"], [1, "ri-prohibited-line", "text-danger", "icon-validation"], [1, "text-success", "validation-margi", "text-validation"], [1, "ri-check-fill", "text-success", "icon-validation"], [1, "col-lg-10", "left"], [1, "row"], [1, "col-12"], [3, "formGroup"], ["productForm", "ngForm"], [1, "form-floating", "mt-3"], ["type", "text", "formControlName", "v_dar_objectid_reqfor", 1, "form-control", 3, "ngModel", "disabled"], ["for", "Person Needing Access", 1, "control-label"], [1, "text-danger"], ["type", "text", "formControlName", "v_dar_workdayID", 1, "form-control", 3, "ngModel", "disabled"], ["for", "name", 1, "control-label"], ["type", "text", "formControlName", "v_dar_dm_version", 1, "form-control", 3, "ngModel", "disabled"], ["for", "Application Build Version"], ["type", "text", "formControlName", "v_dar_objectid_createdby", 1, "form-control", 3, "ngModel", "disabled"], ["for", "floatingInput"], ["type", "text", "formControlName", "productName", 1, "form-control", 3, "ngModel", "disabled"], ["for", "Product Name"], ["type", "text", "formControlName", "quantity", "value", "1", 1, "form-control", 3, "disabled"], ["for", "Product Quantity"], ["type", "text", "formControlName", "companyName", 1, "form-control", 3, "ngModel", "disabled"], ["for", "Company Name"], ["type", "text", "formControlName", "v_dar_userType", "value", "TMNA User", 1, "form-control", 3, "disabled"], ["for", "User Type"], ["type", "text", "formControlName", "v_dar_accessType", "value", "User Requested Access (Individual is directly accessing the data)", 1, "form-control", 3, "disabled"], ["for", "Individual/Application Access Type"], ["id", "organizationName", 1, "form-floating", "mt-3"], ["type", "text", "formControlName", "v_dar_organization", "value", "TMNA", 1, "form-control", 3, "disabled"], ["for", "Organization Name"], ["type", "text", "formControlName", "v_dar_organization", "value", "TFS", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_dar_organization", "value", "MTMUS", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_dar_organization", "value", "Woven Planet", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_dar_organization", "value", "Toyota Connected", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_dar_organization", "value", "Toyota Motors Corporation", 1, "form-control", 3, "disabled"], ["id", "ADGroup", "id", "ADGroup", 1, "form-floating", "mt-3"], ["formControlName", "v_dar_ad_group", "value", "No", 1, "form-control"], ["for", "AD Group"], ["id", "Platform", 1, "form-floating", "mt-3"], ["formControlName", "v_dar_platform", 1, "form-select"], ["value", "", "selected", ""], ["value", "API (EIG Application Support)"], ["value", "TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)"], ["value", "Other"], ["for", "Platform List", 1, "control-label", "required"], ["id", "route-identifiers"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "10", 1, "form-control", 3, "disabled"], ["for", "float-left col-6"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "11", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "9", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "4", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "3", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "2", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "6", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "12", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "13", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "1", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_routing_rule_identifier", "value", "14", 1, "form-control", 3, "disabled"], [1, "col-lg-12", "title-bg", "mt-3"], [1, "title-padding"], [2, "font-size", "14px"], [1, "default", "request-pointer", 3, "click"], ["formControlName", "v_dar_dataDomainSelect", 1, "form-select"], ["value", "Customer"], ["value", "Dealer Identity"], ["value", "Dealership"], ["value", "Data Governance"], ["value", "Digital Assets"], ["value", "Finance"], ["value", "Identity Access Management"], ["value", "Manufacturing"], ["value", "Manufacturing Parts"], ["value", "Product Quality"], ["value", "Research and Development"], ["value", "Service History"], ["value", "Telematics"], ["value", "Vehicles"], ["value", "Warranty"], ["for", "Data Domains"], ["id", "control-group"], ["type", "text", "formControlName", "v_custom_control_group", "value", "676f978fdbd3081012b941a4059619d7", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_control_group", "value", "966f578fdbd3081012b941a405961984", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_control_group", "value", "b07f1b8fdbd3081012b941a405961982", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_control_group", "value", "55fed34fdbd3081012b941a4059619ec", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_control_group", "value", "b7ee934fdbd3081012b941a405961915", 1, "form-control", 3, "disabled"], ["type", "text", "formControlName", "v_custom_control_group", "value", "196f178fdbd3081012b941a405961911", 1, "form-control", 3, "disabled"], ["name", "requestingID", "id", "requestingID", "formControlName", "requesting_id", 1, "form-control"], ["value", "Me", "selected", ""], ["value", "User"], ["name", "requestingTDSP", "id", "TDSP", "formControlName", "requesting_tdsp_processing", 1, "form-control"], ["value", "No", "selected", ""], ["value", "Yes"], ["for", "TDSP"], ["id", "TDSP Options", 1, "form-floating", "mt-3"], ["formControlName", "v_dar_ad_group", "value", "tdspoption + hero.adgroup + podsScreen + selectedPod", 1, "form-control", 3, "disabled"], ["for", "TDSP AD Group Selection"], ["id", "classification", 1, "form-floating", "mt-3"], ["formControlName", "v_dar_accessReqClassification", 1, "form-control", "classification"], ["value", "Public", "selected", "selected"], ["value", "Protected"], ["value", "Confidential"], ["value", "Highly Confidential"], ["value", "Personal Information"], ["value", "Legal/Privileged"], ["for", "Data Classification"], ["id", "environment", 1, "form-floating", "mt-3"], ["formControlName", "v_dar_environment", "value", "Prod", 1, "form-control", 3, "disabled"], ["for", "Environment"], ["id", "data_access_type", 1, "form-floating", "mt-3"], ["formControlName", "v_dat_data_access_type", "value", "read", 1, "form-control", 3, "disabled"], ["for", "Data Access Type"], ["id", "database_name", 1, "form-floating", "mt-3"], ["type", "text", "formControlName", "v_dar_databaseName", 1, "form-control"], ["for", "Database Name"], ["id", "data_request_description", 1, "form-floating", "mt-3"], ["formControlName", "v_dar_DataReqDescription", "row", "4", 1, "form-control"], ["for", "Data Request Description"], ["type", "button", "appClick", "", 1, "btn", "btn-primary", "btn-lg", "btn-block", "mt-6", 3, "ngClass", "click"]], template: function PageRequestFormComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "h5");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](5, "Requirements");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](6, "ul", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](9, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](10, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](11, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](12, "Platform");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](13, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](15, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](16, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](17, "Platform");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](19, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](20, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](21, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](22, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](23, "TDSP");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](24, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](25, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](26, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](27, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](28, "TDSP");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](29, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](30, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](31, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](32, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](33, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](34, "TDSP Option");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](35, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](36, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](37, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](38, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](39, "TDSP Option");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](40, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](41, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](42, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](43, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](44, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](45, "Data Domain");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](46, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](47, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](48, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](49, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](50, "Data Domain");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](51, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](52, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](53, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](54, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](55, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](56, "User Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](57, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](58, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](59, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](60, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](61, "User Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](62, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](63, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](64, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](65, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](66, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](67, "User/App Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](68, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](69, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](70, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](71, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](72, "User/App Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](73, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](74, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](75, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](76, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](77, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](78, "System Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](79, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](80, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](81, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](82, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](83, "System Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](84, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](85, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](86, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](87, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](88, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](89, "Mainframe Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](90, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](91, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](92, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](93, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](94, "Mainframe Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](95, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](96, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](97, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](98, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](99, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](100, "API Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](101, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](102, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](103, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](104, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](105, "API Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](106, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](107, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](108, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](109, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](110, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](111, "Data Warehouse/Mart");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](112, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](113, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](114, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](115, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](116, "Data Warehouse/Mart");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](117, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](118, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](119, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](120, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](121, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](122, "Gateway Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](123, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](124, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](125, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](126, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](127, "Gateway Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](128, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](129, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](130, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](131, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](132, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](133, "Oracle Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](134, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](135, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](136, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](137, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](138, "Oracle Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](139, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](140, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](141, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](142, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](143, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](144, "Database/Schema");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](145, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](146, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](147, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](148, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](149, "Database/Schema");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](150, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](151, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](152, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](153, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](154, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](155, "Table Name(s)");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](156, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](157, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](158, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](159, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](160, "Table Name(s)");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](161, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](162, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](163, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](164, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](165, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](166, "Environment");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](167, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](168, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](169, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](170, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](171, "Environment");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](172, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](173, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](174, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](175, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](176, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](177, "Data Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](178, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](179, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](180, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](181, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](182, "Data Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](183, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](184, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](185, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](186, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](187, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](188, "Request Description");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](189, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](190, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](191, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](192, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](193, "Request Description");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](194, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](195, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](196, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](197, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](198, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](199, "Intended Use");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](200, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](201, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](202, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](203, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](204, "Intended Use");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](205, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](206, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](207, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](208, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](209, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](210, "Sensitive PI");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](211, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](212, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](213, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](214, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](215, "Sensitive PI");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](216, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](217, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](218, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](219, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](220, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](221, "PII Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](222, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](223, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](224, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](225, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](226, "PII Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](227, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](228, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](229, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](230, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](231, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](232, "PII Explanation");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](233, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](234, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](235, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](236, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](237, "PII Explanation");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](238, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](239, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](240, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](241, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](242, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](243, "Type of Work");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](244, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](245, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](246, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](247, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](248, "Type of Work");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](249, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](250, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](251, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](252, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](253, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](254, "3rd Party Vendor");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](255, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](256, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](257, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](258, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](259, "3rd Party Vendor");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](260, "li");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](261, "p", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](262, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](263, "i", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](264, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](265, "Terms of Use");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](266, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](267, "span", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](268, "i", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](269, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](270, "Terms of Use");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](271, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](272, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](273, "h5");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](274, "Request Access for:");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](275, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](276, "form", 13, 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](278, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](279, "input", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](280, "label", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](281, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](282, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](283, " Object ID Of The Person Needing Access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](284, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](285, "input", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](286, "label", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](287, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](288, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](289, " Workday ID of the person needing access");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](290, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](291, "input", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](292, "label", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](293, "Build Version");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](294, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](295, "input", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](296, "label", 24);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](297, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](298, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](299, " Request Created By");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](300, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](301, "input", 25);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](302, "label", 26);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](303, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](304, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](305, " Product Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](306, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](307, "input", 27);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](308, "label", 28);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](309, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](310, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](311, " Product Quantity");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](312, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](313, "input", 29);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](314, "label", 30);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](315, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](316, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](317, " Company Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](318, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](319, "input", 31);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](320, "label", 32);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](321, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](322, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](323, " User Type");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](324, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](325, "input", 33);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](326, "label", 34);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](327, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](328, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](329, " Individual/Application Access Type");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](330, "div", 35);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](331, "input", 36);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](332, "label", 37);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](333, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](334, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](335, " Organization Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](336, "div", 35);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](337, "input", 38);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](338, "label", 37);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](339, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](340, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](341, " Organization Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](342, "div", 35);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](343, "input", 39);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](344, "label", 37);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](345, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](346, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](347, " Organization Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](348, "div", 35);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](349, "input", 40);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](350, "label", 37);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](351, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](352, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](353, " Organization Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](354, "div", 35);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](355, "input", 41);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](356, "label", 37);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](357, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](358, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](359, " Organization Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](360, "div", 35);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](361, "input", 42);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](362, "label", 37);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](363, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](364, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](365, " Organization Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](366, "div", 43);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](367, "input", 44);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](368, "label", 45);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](369, "AD Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](370, "div", 46);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](371, "select", 47);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](372, "option", 48);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](373, "Choose A Platform");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](374, "option", 49);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](375, "API (EIG Application Support)");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](376, "option", 50);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](377, "TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](378, "option", 51);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](379, "Other");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](380, "label", 52);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](381, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](382, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](383, " Platforms");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](384, "div", 53);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](385, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](386, "input", 54);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](387, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](388, "My SQL: Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](389, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](390, "input", 56);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](391, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](392, "PostgreSQL: Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](393, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](394, "input", 57);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](395, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](396, "SQL: Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](397, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](398, "input", 58);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](399, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](400, "API (EIG Application Support): Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](401, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](402, "input", 59);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](403, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](404, "IRM Pricing(No): Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](405, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](406, "input", 60);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](407, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](408, "IRM Pricing(Yes): Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](409, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](410, "input", 61);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](411, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](412, "Other: Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](413, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](414, "input", 62);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](415, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](416, "Cloud (AWS): Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](417, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](418, "input", 63);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](419, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](420, "Cloud (Azure): Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](421, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](422, "input", 64);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](423, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](424, "Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.): Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](425, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](426, "input", 65);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](427, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](428, "Gateway Access Request (PowerBI, Tableau, Alteryx, etc): Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](429, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](430, "input", 64);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](431, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](432, "Oracle (Non-Data Warehouse, MDW, TOMS, Customer Central, etc.): Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](433, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](434, "input", 64);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](435, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](436, "Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.): Route Identifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](437, "div", 66);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](438, "h5", 67);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](439, "small", 68);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](440, "Please use the following link to understand our Data Domains");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](441, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](442, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](443, "a", 69);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageRequestFormComponent_Template_a_click_443_listener() { return ctx.open(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](444, "Data Domain Help Document");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](445, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](446, "select", 70);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](447, "option", 71);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](448, "Customer");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](449, "option", 72);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](450, "Dealer Identity");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](451, "option", 73);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](452, "Dealership");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](453, "option", 74);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](454, "Data Governance");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](455, "option", 75);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](456, "Digital Assets");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](457, "option", 76);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](458, "Enterprise Corporate Application");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](459, "option", 76);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](460, "Finance");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](461, "option", 77);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](462, "Identity Access Management");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](463, "option", 78);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](464, "Manufacturing");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](465, "option", 79);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](466, "Parts");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](467, "option", 80);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](468, "Quality");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](469, "option", 81);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](470, "Research and Development");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](471, "option", 82);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](472, "Service History");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](473, "option", 83);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](474, "Telematics");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](475, "option", 84);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](476, "Vehicles");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](477, "option", 85);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](478, "Warranty");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](479, "label", 86);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](480, "Data Domains");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](481, "div", 87);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](482, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](483, "input", 88);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](484, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](485, "Customer: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](486, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](487, "input", 89);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](488, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](489, "Dealer Identity: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](490, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](491, "input", 89);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](492, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](493, "Dealership: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](494, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](495, "input", 89);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](496, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](497, "Digital Assets:Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](498, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](499, "input", 90);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](500, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](501, "Finance: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](502, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](503, "input", 88);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](504, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](505, "Identity Access Management: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](506, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](507, "input", 91);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](508, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](509, "Manufacturing: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](510, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](511, "input", 92);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](512, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](513, "Manufacturing Parts: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](514, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](515, "input", 89);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](516, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](517, "Product Quality: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](518, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](519, "input", 92);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](520, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](521, "Research and Development: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](522, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](523, "input", 88);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](524, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](525, "Service History: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](526, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](527, "input", 92);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](528, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](529, "Service Parts and Accessories: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](530, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](531, "input", 93);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](532, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](533, "Telematics: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](534, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](535, "input", 89);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](536, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](537, "Vehicles: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](538, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](539, "input", 88);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](540, "label", 55);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](541, "Warranty: Control Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](542, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](543, "select", 94);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](544, "option", 95);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](545, "For me");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](546, "option", 96);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](547, "For someone else");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](548, "label", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](549, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](550, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](551, "Who are you requesting data access for?");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](552, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](553, "select", 97);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](554, "option", 98);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](555, "No");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](556, "option", 99);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](557, "Yes");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](558, "label", 100);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](559, "span", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](560, "*");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](561, " Is this for TDSP?");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](562, "div", 101);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](563, "input", 102);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](564, "label", 103);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](565, "TDSP AD Group");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](566, "div", 104);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](567, "select", 105);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](568, "option", 106);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](569, "Public");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](570, "option", 107);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](571, "Protected");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](572, "option", 108);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](573, "Confidential");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](574, "option", 109);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](575, "Highly Confidential");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](576, "option", 110);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](577, "Personal Information");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](578, "option", 111);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](579, "Legal/ Privileged Information");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](580, "label", 112);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](581, "Data Classification");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](582, "div", 113);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](583, "input", 114);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](584, "label", 115);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](585, "Environment");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](586, "div", 116);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](587, "input", 117);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](588, "label", 118);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](589, "Data Access Type");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](590, "div", 119);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](591, "input", 120);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](592, "label", 121);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](593, "Database Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](594, "div", 122);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](595, "textarea", 123);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](596, "label", 124);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](597, "Data Request Description");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](598, "button", 125);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function PageRequestFormComponent_Template_button_click_598_listener() { return ctx.addToCart(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](599, "Add to cart ");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](276);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("formGroup", ctx.form);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpropertyInterpolate"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.id);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpropertyInterpolate"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.employeeId);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpropertyInterpolate1"]("ngModel", "Version: ", ctx.currentApplicationVersion, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpropertyInterpolate"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.id);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngModel", ctx.product.name)("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpropertyInterpolate"]("ngModel", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.companyName);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](25);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](49);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](24);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](20);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](11);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpureFunction1"](54, _c0, ctx.addingToCart));
    } }, directives: [_angular_forms__WEBPACK_IMPORTED_MODULE_5__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormControlName, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.SelectControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgSelectOption, _angular_forms__WEBPACK_IMPORTED_MODULE_5__["ɵNgSelectMultipleOption"], _shared_directives_click_directive__WEBPACK_IMPORTED_MODULE_4__.ClickDirective, _angular_common__WEBPACK_IMPORTED_MODULE_11__.NgClass], styles: [".mr-6[_ngcontent-%COMP%] {\n  margin-right: 6px;\n}\n\n.left[_ngcontent-%COMP%] {\n  float: left;\n}\n\n.mt-6[_ngcontent-%COMP%] {\n  margin-top: 30px;\n}\n\n.requirements[_ngcontent-%COMP%] {\n  list-style: none;\n  position: relative;\n  right: 36px;\n}\n\n.text-validation[_ngcontent-%COMP%] {\n  font-size: 12px;\n  float: left;\n}\n\n.icon-validation[_ngcontent-%COMP%] {\n  margin-left: 4px;\n  font-weight: bold;\n  font-size: 16px;\n}\n\n.request-pointer[_ngcontent-%COMP%] {\n  font-size: 14px;\n  text-decoration: underline;\n  font-weight: bold;\n  color: #FF4D4D;\n  cursor: pointer;\n}\n\n.request-pointer[_ngcontent-%COMP%]:hover {\n  font-size: 14px;\n  text-decoration: underline;\n  font-weight: bold;\n  color: #cc3333;\n  cursor: pointer;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtcmVxdWVzdC1mb3JtLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksaUJBQUE7QUFDSjs7QUFFQTtFQUNJLFdBQUE7QUFDSjs7QUFFQTtFQUNJLGdCQUFBO0FBQ0o7O0FBRUE7RUFDSSxnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsV0FBQTtBQUNKOztBQUVBO0VBQ0ksZUFBQTtFQUNBLFdBQUE7QUFDSjs7QUFFQTtFQUNJLGdCQUFBO0VBQ0EsaUJBQUE7RUFDQSxlQUFBO0FBQ0o7O0FBQ0E7RUFDSSxlQUFBO0VBQ0EsMEJBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7RUFDQSxlQUFBO0FBRUo7O0FBQ0E7RUFDSSxlQUFBO0VBQ0EsMEJBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7RUFDQSxlQUFBO0FBRUoiLCJmaWxlIjoicGFnZS1yZXF1ZXN0LWZvcm0uY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIubXItNiB7XG4gICAgbWFyZ2luLXJpZ2h0OiA2cHg7XG59XG5cbi5sZWZ0IHtcbiAgICBmbG9hdDogbGVmdDtcbn1cblxuLm10LTYge1xuICAgIG1hcmdpbi10b3A6IDMwcHg7XG59XG5cbi5yZXF1aXJlbWVudHMge1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHJpZ2h0OiAzNnB4O1xufVxuXG4udGV4dC12YWxpZGF0aW9uIHtcbiAgICBmb250LXNpemU6IDEycHg7IFxuICAgIGZsb2F0OiBsZWZ0O1xufVxuXG4uaWNvbi12YWxpZGF0aW9uIHtcbiAgICBtYXJnaW4tbGVmdDogNHB4OyBcbiAgICBmb250LXdlaWdodDogYm9sZDsgXG4gICAgZm9udC1zaXplOiAxNnB4O1xufVxuLnJlcXVlc3QtcG9pbnRlciB7XG4gICAgZm9udC1zaXplOiAxNHB4OyBcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbiAgICBmb250LXdlaWdodDogYm9sZDsgXG4gICAgY29sb3I6I0ZGNEQ0RDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi5yZXF1ZXN0LXBvaW50ZXI6aG92ZXIge1xuICAgIGZvbnQtc2l6ZTogMTRweDsgXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7IFxuICAgIGNvbG9yOiNjYzMzMzM7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xufSJdfQ== */"] });


/***/ }),

/***/ 32542:
/*!*******************************************************************************************!*\
  !*** ./src/app/@modules/marketplace/pages/page-track-order/page-track-order.component.ts ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageTrackOrderComponent": () => (/* binding */ PageTrackOrderComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _azure_msal_angular__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @azure/msal-angular */ 14084);
/* harmony import */ var _app_shared_services_app_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../app/@shared/services/app.service */ 5406);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ 90587);





const _c0 = function () { return { label: "Domains", url: "/" }; };
const _c1 = function () { return { label: "Marketplace", url: "/marketplace" }; };
const _c2 = function () { return { label: "Track Order", url: "" }; };
const _c3 = function (a0, a1, a2) { return [a0, a1, a2]; };
const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country,extension_f9db8ce126544afb895293c1adb4b749_extensionAttribute3';
class PageTrackOrderComponent {
    constructor(msalService, appSvc) {
        this.msalService = msalService;
        this.appSvc = appSvc;
        this.loggedInUser = false;
    }
    ngOnInit() {
    }
    checkAccount() {
        const accounts = this.msalService.instance.getAllAccounts();
        this.loggedInUser = accounts.length > 0;
    }
}
PageTrackOrderComponent.ɵfac = function PageTrackOrderComponent_Factory(t) { return new (t || PageTrackOrderComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_azure_msal_angular__WEBPACK_IMPORTED_MODULE_3__.MsalService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_app_shared_services_app_service__WEBPACK_IMPORTED_MODULE_0__.AppService)); };
PageTrackOrderComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: PageTrackOrderComponent, selectors: [["app-track-order"]], decls: 41, vars: 9, consts: [[3, "breadcrumbs"], [1, "block"], [1, "container-fluid"], [1, "row", "justify-content-left"], [1, "col-xl-3", "col-lg-3", "col-md-3", "col-sm-12"], [1, "card", "flex-grow-1", "mb-0", "mt-2"], [1, "card-body"], [1, "card-title", "text-center"], [1, "mb-4", "pt-2", "text-center"], [1, "form-group"], [1, "pt-3"], [1, "d-flex", "justify-content-center"], ["for", "track-order-id"], ["id", "track-order-id", "type", "text", "placeholder", "What is your Request #?", 1, "form-control"], ["id", "track-order-id", "type", "text", "placeholder", "What is your RITM #?", 1, "form-control"], ["for", "track-email"], ["id", "track-email", "type", "email", "disabled", "", 1, "form-control", 3, "value"], [1, "pt-3", "d-flex", "justify-content-center"], ["type", "submit", 1, "btn", "btn-primary", "btn-lg", "btn-block"], [1, "col-xl-9", "col-lg-9", "col-md-9", "col-sm-12"], [1, "card-table", "mt-2"], [1, "col-lg-12", "col-md-12", "col-sm-12", "col-12", 2, "padding", "150px"], ["src", "assets/images/icons/package.png", 1, "center", 2, "width", "100%", "max-width", "200px", "opacity", "0.2"], [1, "text-center", 2, "color", "#e5e5e5"]], template: function PageTrackOrderComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](0, "app-page-header", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](8, "h4");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](9, "Track Request");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](10, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](11, " Looking for a specific Data Product Request Order you have placed. Now you can track your more easily and efficiently. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](12, "form");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](13, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](14, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](15, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](16, "p", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](17, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](18, "Request Number");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](19, "input", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](20, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](21, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](22, "p", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](23, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](24, "RITM Number");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](25, "input", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](26, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](27, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](28, "p", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](29, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](30, "Email address");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](31, "input", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](32, "div", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](33, "button", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](34, "Track");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](35, "div", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](36, "div", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](37, "div", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](38, "img", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](39, "h1", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](40, "No Orders Available");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction3"](5, _c3, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction0"](2, _c0), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction0"](3, _c1), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction0"](4, _c2)));
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](31);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpropertyInterpolate"]("value", ctx.appSvc == null ? null : ctx.appSvc.userData == null ? null : ctx.appSvc.userData.mail);
    } }, directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_1__.PageHeaderComponent, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.NgForm], styles: ["td[_ngcontent-%COMP%]:hover {\n  background-color: #fff !important;\n}\n\n.left[_ngcontent-%COMP%] {\n  float: left;\n}\n\n\n\n.page-tab[_ngcontent-%COMP%] {\n  font-weight: 900;\n}\n\n.order-top[_ngcontent-%COMP%] {\n  background-color: #f2f2f2;\n  border-radius: 6px 6px 0 0;\n}\n\n.request-title[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: bolder;\n  position: relative;\n  top: 7px;\n}\n\n.ritm-title[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: bolder;\n  position: relative;\n  top: 7px;\n}\n\n.date-title[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: bolder;\n  position: relative;\n  top: 7px;\n}\n\n.top-order-status[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 700;\n  margin-bottom: 0;\n  position: relative;\n  top: 7px;\n}\n\n.product-name[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 700;\n  margin-bottom: 0;\n}\n\n.product-classification[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 700;\n}\n\n.data-steward[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 700;\n  margin-bottom: 0;\n}\n\n.poc[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 700;\n  margin-bottom: 0;\n}\n\n.product-delivery[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 700;\n  margin-bottom: 0;\n}\n\n.delivery-date[_ngcontent-%COMP%], .delivery-day[_ngcontent-%COMP%] {\n  font-weight: 700;\n  margin-bottom: 0;\n}\n\n.delivery-day[_ngcontent-%COMP%] {\n  position: relative;\n  top: 12px;\n  font-size: 24px;\n}\n\n.delivery-date[_ngcontent-%COMP%] {\n  font-size: 46px;\n}\n\n.delivery-month[_ngcontent-%COMP%], .delivery-year[_ngcontent-%COMP%] {\n  position: relative;\n  left: 6px;\n  font-size: 14px;\n  font-weight: 400;\n  margin-bottom: 0;\n}\n\n.delivery-month[_ngcontent-%COMP%] {\n  top: 12px;\n}\n\n.delivery-year[_ngcontent-%COMP%] {\n  top: 8px;\n}\n\n.delivery-month[_ngcontent-%COMP%], .delivery-year[_ngcontent-%COMP%] {\n  position: relative;\n  left: 6px;\n  font-size: 14px;\n  font-weight: 400;\n  margin-bottom: 0;\n}\n\n.progress[_ngcontent-%COMP%] {\n  height: 0.5rem;\n  border-radius: 0.1rem;\n}\n\n.order-status[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 700;\n  margin-bottom: 0;\n}\n\n.order-status-notification[_ngcontent-%COMP%] {\n  position: relative;\n  bottom: 6px;\n  font-size: 12px;\n}\n\n.order-bottom[_ngcontent-%COMP%] {\n  border: 2px solid #f2f2f2;\n  border-radius: 0 0 6px 6px;\n  padding: 20px 0;\n}\n\n.bg-grey[_ngcontent-%COMP%] {\n  background-color: #AEAEAE;\n}\n\n.bg-blue[_ngcontent-%COMP%] {\n  background-color: #007bff;\n}\n\n.text-info[_ngcontent-%COMP%] {\n  color: #007bff !important;\n}\n\n.marginBottom[_ngcontent-%COMP%] {\n  margin-bottom: 6px;\n}\n\n.btn-teams[_ngcontent-%COMP%] {\n  background-color: #d8d8d8 !important;\n  color: #363636 !important;\n  font-weight: 900;\n}\n\n.btn-email[_ngcontent-%COMP%] {\n  background-color: #d8d8d8 !important;\n  color: #363636 !important;\n  font-weight: 900;\n}\n\n.bar[_ngcontent-%COMP%] {\n  height: 8px;\n  width: 100%;\n}\n\n.bar[_ngcontent-%COMP%]   .in[_ngcontent-%COMP%] {\n  animation: fill 30s linear 1;\n  height: 100%;\n  background-color: #007bff !important;\n}\n\n@keyframes fill {\n  0% {\n    width: 0%;\n  }\n  100% {\n    width: 100%;\n  }\n}\n\n.wait[_ngcontent-%COMP%] {\n  color: #bbb;\n  font-weight: 300;\n  font-size: 28px;\n  width: 164px;\n  height: 100px;\n  position: absolute;\n  top: 50px;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  margin: auto;\n}\n\n.experience[_ngcontent-%COMP%] {\n  color: #bbb;\n  font-weight: 800;\n  font-size: 16px;\n  width: 256px;\n  height: 100px;\n  position: absolute;\n  top: 121px;\n  bottom: 0px;\n  left: 0;\n  right: 0;\n  margin: auto;\n}\n\n.spinner-grow[_ngcontent-%COMP%] {\n  width: 100px;\n  height: 100px;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  margin: auto;\n}\n\n.rotatingText[_ngcontent-%COMP%] {\n  color: #bbb;\n  align-items: center;\n  display: flex;\n  height: 100vh;\n  text-align: center;\n  margin-top: 50px;\n}\n\n.rotatingText-content[_ngcontent-%COMP%] {\n  position: relative;\n  width: 100%;\n  bottom: 12px;\n}\n\n.rotatingText-description[_ngcontent-%COMP%] {\n  font-size: 14px;\n  margin: 0;\n}\n\n@media (min-width: 768px) {\n  .rotatingText-description[_ngcontent-%COMP%] {\n    font-size: 16px;\n  }\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%] {\n  color: #bbb;\n  font-size: 20px;\n  left: 0;\n  margin-bottom: 0;\n  margin-top: 30px;\n  opacity: 0;\n  position: absolute;\n  right: 0;\n  text-align: center;\n  text-transform: uppercase;\n  top: 0;\n}\n\n@media (min-width: 768px) {\n  .rotatingText-adjective[_ngcontent-%COMP%] {\n    font-size: 20px;\n  }\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%]:nth-of-type(1) {\n  animation: rotate-text-up 1.5s 0.75s;\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%]:nth-of-type(2) {\n  animation: rotate-text-up 1.5s 2s;\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%]:nth-of-type(3) {\n  animation: rotate-text-up 1.5s 3.25s;\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%]:nth-of-type(4) {\n  animation: rotate-text-up 1.5s 4.5s;\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%]:nth-of-type(5) {\n  animation: rotate-text-up 1.5s 5.75s;\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%]:nth-of-type(6) {\n  animation: rotate-text-up 1.5s 7s;\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%]:nth-of-type(7) {\n  animation: rotate-text-up 1.5s 8.25s;\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%]:nth-of-type(8) {\n  animation: rotate-text-up 1.5s 9.5s;\n}\n\n.rotatingText-adjective[_ngcontent-%COMP%]:nth-of-type(9) {\n  animation: fade-text-in 1.5s 10.75s forwards;\n}\n\n@keyframes rotate-text-up {\n  0% {\n    transform: translate3d(0, 80px, 0);\n    opacity: 0;\n  }\n  20%, 80% {\n    transform: translate3d(0, 0, 0);\n    opacity: 1;\n  }\n  100% {\n    transform: translate3d(0, -40px, 0);\n    opacity: 0;\n  }\n}\n\n@keyframes fade-text-in {\n  0% {\n    opacity: 0;\n    transform: translate3d(0, 80px, 0);\n  }\n  50%, 100% {\n    opacity: 1;\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.btn-action-approve[_ngcontent-%COMP%] {\n  font-size: 14px;\n  float: right;\n  margin-bottom: 6px;\n  width: 100% !important;\n  padding: 8px 10px;\n  color: #fff;\n  background-color: #28a745;\n  border: none;\n}\n\n.btn-action-approve[_ngcontent-%COMP%]:hover {\n  background-color: #1c7430;\n  outline: none;\n}\n\n.btn-action-approve[_ngcontent-%COMP%]:focus {\n  outline: none !important;\n  box-shadow: none !important;\n}\n\n.btn-action-deny[_ngcontent-%COMP%] {\n  font-size: 14px;\n  float: right;\n  margin-bottom: 6px;\n  width: 100% !important;\n  padding: 8px 10px;\n  background-color: #dc3545;\n  border: none;\n}\n\n.btn-action-deny[_ngcontent-%COMP%]:hover {\n  background-color: #9a2530;\n  outline: none;\n}\n\n.btn-action-deny[_ngcontent-%COMP%]:focus {\n  outline: none !important;\n  box-shadow: none !important;\n}\n\n.btn-action-upload[_ngcontent-%COMP%] {\n  font-size: 14px;\n  float: right;\n  margin-bottom: 6px;\n  width: 100% !important;\n  padding: 8px 10px;\n  color: #000;\n  background-color: #FEC901;\n  border: none;\n}\n\n.btn-action-upload[_ngcontent-%COMP%]:hover {\n  background-color: #987800;\n  color: #fff;\n  outline: none;\n}\n\n.btn-action-upload[_ngcontent-%COMP%]:focus {\n  outline: none !important;\n  box-shadow: none !important;\n}\n\n.btn-action-review[_ngcontent-%COMP%] {\n  font-size: 14px;\n  float: right;\n  margin-bottom: 6px;\n  width: 100% !important;\n  padding: 8px 10px;\n  color: #fff;\n  background-color: #363636;\n  border: none;\n}\n\n.btn-action-review[_ngcontent-%COMP%]:hover {\n  background-color: #000;\n  color: #fff;\n  outline: none;\n}\n\n.btn-action-review[_ngcontent-%COMP%]:focus {\n  outline: none !important;\n  box-shadow: none !important;\n}\n\n.btn-history-teams[_ngcontent-%COMP%] {\n  font-size: 14px;\n  float: right;\n  margin-bottom: 6px;\n  width: 100% !important;\n  padding: 8px 10px;\n  background-color: #505AC9;\n  border: none;\n}\n\n.btn-history-teams[_ngcontent-%COMP%]:hover {\n  background-color: #383e8c;\n  color: #fff;\n  outline: none;\n}\n\n.btn-history-teams[_ngcontent-%COMP%]:focus {\n  outline: none !important;\n  box-shadow: none !important;\n}\n\n.btn-history-outlook[_ngcontent-%COMP%] {\n  font-size: 14px;\n  float: right;\n  margin-bottom: 6px;\n  width: 100% !important;\n  padding: 8px 10px;\n  background-color: #0072C6;\n  border: none;\n}\n\n.btn-history-outlook[_ngcontent-%COMP%]:hover {\n  background-color: #004f8a;\n  color: #fff;\n  outline: none;\n}\n\n.btn-history-outlook[_ngcontent-%COMP%]:focus {\n  outline: none !important;\n  box-shadow: none !important;\n}\n\n.center[_ngcontent-%COMP%] {\n  display: block;\n  margin-left: auto;\n  margin-right: auto;\n  width: 50%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtdHJhY2stb3JkZXIuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxpQ0FBQTtBQUNKOztBQUVBO0VBQ0ksV0FBQTtBQUNKOztBQUVBLGFBQUE7O0FBQ0E7RUFDSSxnQkFBQTtBQUNKOztBQUVBO0VBQ0kseUJBQUE7RUFDQSwwQkFBQTtBQUNKOztBQUVBO0VBQ0ksZUFBQTtFQUNBLG1CQUFBO0VBQ0Esa0JBQUE7RUFDQSxRQUFBO0FBQ0o7O0FBRUE7RUFDSSxlQUFBO0VBQ0EsbUJBQUE7RUFDQSxrQkFBQTtFQUNBLFFBQUE7QUFDSjs7QUFFQTtFQUNJLGVBQUE7RUFDQSxtQkFBQTtFQUNBLGtCQUFBO0VBQ0EsUUFBQTtBQUNKOztBQUVBO0VBQ0ksZUFBQTtFQUNBLGdCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxrQkFBQTtFQUNBLFFBQUE7QUFDSjs7QUFFQTtFQUNJLGVBQUE7RUFDQSxnQkFBQTtFQUNBLGdCQUFBO0FBQ0o7O0FBRUE7RUFDSSxlQUFBO0VBQ0EsZ0JBQUE7QUFDSjs7QUFFQTtFQUNJLGVBQUE7RUFDQSxnQkFBQTtFQUNBLGdCQUFBO0FBQ0o7O0FBRUE7RUFDSSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQkFBQTtBQUNKOztBQUVBO0VBQ0ksZUFBQTtFQUNBLGdCQUFBO0VBQ0EsZ0JBQUE7QUFDSjs7QUFFQTtFQUNJLGdCQUFBO0VBQ0EsZ0JBQUE7QUFDSjs7QUFFQTtFQUNJLGtCQUFBO0VBQ0EsU0FBQTtFQUNBLGVBQUE7QUFDSjs7QUFFQTtFQUNJLGVBQUE7QUFDSjs7QUFFQTtFQUNJLGtCQUFBO0VBQ0EsU0FBQTtFQUNBLGVBQUE7RUFDQSxnQkFBQTtFQUNBLGdCQUFBO0FBQ0o7O0FBRUE7RUFDSSxTQUFBO0FBQ0o7O0FBRUE7RUFDSSxRQUFBO0FBQ0o7O0FBRUE7RUFDSSxrQkFBQTtFQUNBLFNBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQkFBQTtBQUNKOztBQUVBO0VBQ0ksY0FBQTtFQUNBLHFCQUFBO0FBQ0o7O0FBRUE7RUFDSSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQkFBQTtBQUNKOztBQUVBO0VBQ0ksa0JBQUE7RUFDQSxXQUFBO0VBQ0EsZUFBQTtBQUNKOztBQUVBO0VBQ0kseUJBQUE7RUFDQSwwQkFBQTtFQUNBLGVBQUE7QUFDSjs7QUFFQTtFQUNJLHlCQUFBO0FBQ0o7O0FBRUE7RUFDSSx5QkFBQTtBQUNKOztBQUVBO0VBQ0kseUJBQUE7QUFDSjs7QUFFQTtFQUNJLGtCQUFBO0FBQ0o7O0FBRUE7RUFDSSxvQ0FBQTtFQUNBLHlCQUFBO0VBQ0EsZ0JBQUE7QUFDSjs7QUFFQTtFQUNJLG9DQUFBO0VBQ0EseUJBQUE7RUFDQSxnQkFBQTtBQUNKOztBQUVBO0VBQ0ksV0FBQTtFQUNBLFdBQUE7QUFDSjs7QUFDQTtFQUNJLDRCQUFBO0VBQ0EsWUFBQTtFQUNBLG9DQUFBO0FBRUo7O0FBQUE7RUFDSTtJQUNJLFNBQUE7RUFHTjtFQURFO0lBQ0ksV0FBQTtFQUdOO0FBQ0Y7O0FBQUE7RUFDRSxXQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsWUFBQTtFQUNBLGFBQUE7RUFDQSxrQkFBQTtFQUNBLFNBQUE7RUFDQSxTQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSxZQUFBO0FBRUY7O0FBQUE7RUFDRSxXQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsWUFBQTtFQUNBLGFBQUE7RUFDQSxrQkFBQTtFQUNBLFVBQUE7RUFDQSxXQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSxZQUFBO0FBR0Y7O0FBREE7RUFDRSxZQUFBO0VBQ0EsYUFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtFQUNBLFNBQUE7RUFDQSxPQUFBO0VBQ0EsUUFBQTtFQUNBLFlBQUE7QUFJRjs7QUFEQTtFQUNJLFdBQUE7RUFDQSxtQkFBQTtFQUNBLGFBQUE7RUFDQSxhQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtBQUlKOztBQUZBO0VBQ0ksa0JBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtBQUtKOztBQUhBO0VBQ0ksZUFBQTtFQUNBLFNBQUE7QUFNSjs7QUFKQTtFQUNJO0lBQ0ksZUFBQTtFQU9OO0FBQ0Y7O0FBTEE7RUFDSSxXQUFBO0VBQ0EsZUFBQTtFQUNBLE9BQUE7RUFDQSxnQkFBQTtFQUNBLGdCQUFBO0VBQ0EsVUFBQTtFQUNBLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLGtCQUFBO0VBQ0EseUJBQUE7RUFDQSxNQUFBO0FBT0o7O0FBTEE7RUFDSTtJQUNJLGVBQUE7RUFRTjtBQUNGOztBQU5BO0VBQ0ksb0NBQUE7QUFRSjs7QUFOQTtFQUNJLGlDQUFBO0FBU0o7O0FBUEE7RUFDSSxvQ0FBQTtBQVVKOztBQVBBO0VBQ0ksbUNBQUE7QUFVSjs7QUFSQTtFQUNJLG9DQUFBO0FBV0o7O0FBVEE7RUFDSSxpQ0FBQTtBQVlKOztBQVRBO0VBQ0ksb0NBQUE7QUFZSjs7QUFWQTtFQUNJLG1DQUFBO0FBYUo7O0FBWEE7RUFDSSw0Q0FBQTtBQWNKOztBQVpBO0VBQ0k7SUFDSSxrQ0FBQTtJQUNBLFVBQUE7RUFlTjtFQWJFO0lBQ0ksK0JBQUE7SUFDQSxVQUFBO0VBZU47RUFiRTtJQUNJLG1DQUFBO0lBQ0EsVUFBQTtFQWVOO0FBQ0Y7O0FBYkE7RUFDSTtJQUNJLFVBQUE7SUFDQSxrQ0FBQTtFQWVOO0VBYkU7SUFDSSxVQUFBO0lBQ0EsK0JBQUE7RUFlTjtBQUNGOztBQVpBO0VBQ0ksZUFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLHNCQUFBO0VBQ0EsaUJBQUE7RUFDQSxXQUFBO0VBQ0EseUJBQUE7RUFDQSxZQUFBO0FBY0o7O0FBWEE7RUFDSSx5QkFBQTtFQUNBLGFBQUE7QUFjSjs7QUFYQTtFQUNJLHdCQUFBO0VBQ0EsMkJBQUE7QUFjSjs7QUFYQTtFQUNJLGVBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxzQkFBQTtFQUNBLGlCQUFBO0VBQ0EseUJBQUE7RUFDQSxZQUFBO0FBY0o7O0FBWEE7RUFDSSx5QkFBQTtFQUNBLGFBQUE7QUFjSjs7QUFYQTtFQUNJLHdCQUFBO0VBQ0EsMkJBQUE7QUFjSjs7QUFYQTtFQUNJLGVBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxzQkFBQTtFQUNBLGlCQUFBO0VBQ0EsV0FBQTtFQUNBLHlCQUFBO0VBQ0EsWUFBQTtBQWNKOztBQVhBO0VBQ0kseUJBQUE7RUFDQSxXQUFBO0VBQ0EsYUFBQTtBQWNKOztBQVhBO0VBQ0ksd0JBQUE7RUFDQSwyQkFBQTtBQWNKOztBQVhBO0VBQ0ksZUFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLHNCQUFBO0VBQ0EsaUJBQUE7RUFFQSxXQUFBO0VBQ0EseUJBQUE7RUFDQSxZQUFBO0FBY0o7O0FBWEE7RUFDSSxzQkFBQTtFQUNBLFdBQUE7RUFDQSxhQUFBO0FBY0o7O0FBWEE7RUFDSSx3QkFBQTtFQUNBLDJCQUFBO0FBY0o7O0FBWEE7RUFDSSxlQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0Esc0JBQUE7RUFDQSxpQkFBQTtFQUNBLHlCQUFBO0VBQ0EsWUFBQTtBQWNKOztBQVhBO0VBQ0kseUJBQUE7RUFDQSxXQUFBO0VBQ0EsYUFBQTtBQWNKOztBQVhBO0VBQ0ksd0JBQUE7RUFDQSwyQkFBQTtBQWNKOztBQVhBO0VBQ0ksZUFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLHNCQUFBO0VBQ0EsaUJBQUE7RUFDQSx5QkFBQTtFQUNBLFlBQUE7QUFjSjs7QUFYQTtFQUNJLHlCQUFBO0VBQ0EsV0FBQTtFQUNBLGFBQUE7QUFjSjs7QUFYQTtFQUNJLHdCQUFBO0VBQ0EsMkJBQUE7QUFjSjs7QUFYQTtFQUNJLGNBQUE7RUFDQSxpQkFBQTtFQUNBLGtCQUFBO0VBQ0EsVUFBQTtBQWNKIiwiZmlsZSI6InBhZ2UtdHJhY2stb3JkZXIuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJ0ZDpob3ZlciB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjojZmZmICFpbXBvcnRhbnQ7XG59XG5cbi5sZWZ0e1xuICAgIGZsb2F0OiBsZWZ0O1xufVxuXG4vKiBQQUdFIFRBQiAqL1xuLnBhZ2UtdGFiIHtcbiAgICBmb250LXdlaWdodDogOTAwO1xuIH1cbiBcbi5vcmRlci10b3Age1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XG4gICAgYm9yZGVyLXJhZGl1czogNnB4IDZweCAwIDA7XG59XG5cbi5yZXF1ZXN0LXRpdGxlIHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgdG9wOiA3cHg7XG59XG5cbi5yaXRtLXRpdGxlIHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgdG9wOiA3cHg7XG59XG5cbi5kYXRlLXRpdGxlIHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgdG9wOiA3cHg7XG59XG5cbi50b3Atb3JkZXItc3RhdHVzIHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB0b3A6IDdweDtcbn1cblxuLnByb2R1Y3QtbmFtZSB7XG4gICAgZm9udC1zaXplOiAxNnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgbWFyZ2luLWJvdHRvbTogMDtcbn1cblxuLnByb2R1Y3QtY2xhc3NpZmljYXRpb24ge1xuICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICBmb250LXdlaWdodDogNzAwO1xufVxuXG4uZGF0YS1zdGV3YXJkIHtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xufVxuXG4ucG9jIHtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xufVxuXG4ucHJvZHVjdC1kZWxpdmVyeSB7XG4gICAgZm9udC1zaXplOiAxNnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgbWFyZ2luLWJvdHRvbTogMDtcbn1cblxuLmRlbGl2ZXJ5LWRhdGUsIC5kZWxpdmVyeS1kYXkge1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgbWFyZ2luLWJvdHRvbTogMDtcbn1cblxuLmRlbGl2ZXJ5LWRheSB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHRvcDogMTJweDtcbiAgICBmb250LXNpemU6IDI0cHg7XG59XG5cbi5kZWxpdmVyeS1kYXRlIHtcbiAgICBmb250LXNpemU6IDQ2cHg7XG59XG5cbi5kZWxpdmVyeS1tb250aCwgLmRlbGl2ZXJ5LXllYXIge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICBsZWZ0OiA2cHg7XG4gICAgZm9udC1zaXplOiAxNHB4O1xuICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgbWFyZ2luLWJvdHRvbTogMDtcbn1cblxuLmRlbGl2ZXJ5LW1vbnRoIHtcbiAgICB0b3A6IDEycHg7XG59XG5cbi5kZWxpdmVyeS15ZWFyIHtcbiAgICB0b3A6IDhweDtcbn1cblxuLmRlbGl2ZXJ5LW1vbnRoLCAuZGVsaXZlcnkteWVhciB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIGxlZnQ6IDZweDtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xufVxuXG4ucHJvZ3Jlc3Mge1xuICAgIGhlaWdodDogMC41cmVtO1xuICAgIGJvcmRlci1yYWRpdXM6IDAuMXJlbTtcbn1cblxuLm9yZGVyLXN0YXR1cyB7XG4gICAgZm9udC1zaXplOiAxNnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgbWFyZ2luLWJvdHRvbTogMDtcbn1cblxuLm9yZGVyLXN0YXR1cy1ub3RpZmljYXRpb24ge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICBib3R0b206IDZweDtcbiAgICBmb250LXNpemU6IDEycHg7XG59XG5cbi5vcmRlci1ib3R0b20ge1xuICAgIGJvcmRlcjogMnB4IHNvbGlkICNmMmYyZjI7XG4gICAgYm9yZGVyLXJhZGl1czogMCAwIDZweCA2cHg7XG4gICAgcGFkZGluZzogMjBweCAwO1xufVxuXG4uYmctZ3JleXtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjQUVBRUFFO1xufVxuXG4uYmctYmx1ZXtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3YmZmO1xufVxuXG4udGV4dC1pbmZve1xuICAgIGNvbG9yOiAjMDA3YmZmICFpbXBvcnRhbnRcbn1cblxuLm1hcmdpbkJvdHRvbXtcbiAgICBtYXJnaW4tYm90dG9tOiA2cHg7XG59XG5cbi5idG4tdGVhbXMge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNkOGQ4ZDggIWltcG9ydGFudDtcbiAgICBjb2xvcjogIzM2MzYzNiAhaW1wb3J0YW50O1xuICAgIGZvbnQtd2VpZ2h0OiA5MDA7XG59XG5cbi5idG4tZW1haWwge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNkOGQ4ZDggIWltcG9ydGFudDtcbiAgICBjb2xvcjogIzM2MzYzNiAhaW1wb3J0YW50O1xuICAgIGZvbnQtd2VpZ2h0OiA5MDA7XG59XG5cbi5iYXIge1xuICAgIGhlaWdodDogOHB4O1xuICAgIHdpZHRoOiAxMDAlO1xufVxuLmJhciAuaW4ge1xuICAgIGFuaW1hdGlvbjogZmlsbCAzMHMgbGluZWFyIDE7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDdiZmYgIWltcG9ydGFudDtcbn1cbkBrZXlmcmFtZXMgZmlsbCB7XG4gICAgMCUge1xuICAgICAgICB3aWR0aDogMCU7XG4gICB9XG4gICAgMTAwJSB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgfVxufVxuXG4ud2FpdCB7XG4gIGNvbG9yOiAjYmJiO1xuICBmb250LXdlaWdodDogMzAwO1xuICBmb250LXNpemU6IDI4cHg7XG4gIHdpZHRoOiAxNjRweDtcbiAgaGVpZ2h0OiAxMDBweDtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDUwcHg7XG4gIGJvdHRvbTogMDtcbiAgbGVmdDogMDtcbiAgcmlnaHQ6IDA7XG4gIG1hcmdpbjogYXV0bztcbn1cbi5leHBlcmllbmNlIHtcbiAgY29sb3I6ICNiYmI7XG4gIGZvbnQtd2VpZ2h0OiA4MDA7XG4gIGZvbnQtc2l6ZTogMTZweDtcbiAgd2lkdGg6IDI1NnB4O1xuICBoZWlnaHQ6IDEwMHB4O1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogMTIxcHg7XG4gIGJvdHRvbTogMHB4O1xuICBsZWZ0OiAwO1xuICByaWdodDogMDtcbiAgbWFyZ2luOiBhdXRvO1xufVxuLnNwaW5uZXItZ3JvdyB7XG4gIHdpZHRoOiAxMDBweDtcbiAgaGVpZ2h0OiAxMDBweDtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6MDtcbiAgYm90dG9tOiAwO1xuICBsZWZ0OiAwO1xuICByaWdodDogMDtcbiAgbWFyZ2luOiBhdXRvO1xufVxuXG4ucm90YXRpbmdUZXh0IHtcbiAgICBjb2xvcjogI2JiYjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgaGVpZ2h0OiAxMDB2aDtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgbWFyZ2luLXRvcDogNTBweDtcbn1cbi5yb3RhdGluZ1RleHQtY29udGVudCB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGJvdHRvbTogMTJweDtcbn1cbi5yb3RhdGluZ1RleHQtZGVzY3JpcHRpb24ge1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBtYXJnaW46IDA7XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcbiAgICAucm90YXRpbmdUZXh0LWRlc2NyaXB0aW9uIHtcbiAgICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgfVxufVxuLnJvdGF0aW5nVGV4dC1hZGplY3RpdmUge1xuICAgIGNvbG9yOiAjYmJiO1xuICAgIGZvbnQtc2l6ZTogMjBweDtcbiAgICBsZWZ0OiAwO1xuICAgIG1hcmdpbi1ib3R0b206IDA7XG4gICAgbWFyZ2luLXRvcDogMzBweDtcbiAgICBvcGFjaXR5OiAwO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICByaWdodDogMDtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICB0b3A6IDA7XG59XG5AbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcbiAgICAucm90YXRpbmdUZXh0LWFkamVjdGl2ZSB7XG4gICAgICAgIGZvbnQtc2l6ZTogMjBweDtcbiAgIH1cbn1cbi5yb3RhdGluZ1RleHQtYWRqZWN0aXZlOm50aC1vZi10eXBlKDEpIHtcbiAgICBhbmltYXRpb246IHJvdGF0ZS10ZXh0LXVwIDEuNXMgMC43NXM7XG59XG4ucm90YXRpbmdUZXh0LWFkamVjdGl2ZTpudGgtb2YtdHlwZSgyKSB7XG4gICAgYW5pbWF0aW9uOiByb3RhdGUtdGV4dC11cCAxLjVzIDJzO1xufVxuLnJvdGF0aW5nVGV4dC1hZGplY3RpdmU6bnRoLW9mLXR5cGUoMykge1xuICAgIGFuaW1hdGlvbjogcm90YXRlLXRleHQtdXAgMS41cyAzLjI1cztcbn1cblxuLnJvdGF0aW5nVGV4dC1hZGplY3RpdmU6bnRoLW9mLXR5cGUoNCkge1xuICAgIGFuaW1hdGlvbjogcm90YXRlLXRleHQtdXAgMS41cyA0LjUwcztcbn1cbi5yb3RhdGluZ1RleHQtYWRqZWN0aXZlOm50aC1vZi10eXBlKDUpIHtcbiAgICBhbmltYXRpb246IHJvdGF0ZS10ZXh0LXVwIDEuNXMgNS43NXM7XG59XG4ucm90YXRpbmdUZXh0LWFkamVjdGl2ZTpudGgtb2YtdHlwZSg2KSB7XG4gICAgYW5pbWF0aW9uOiByb3RhdGUtdGV4dC11cCAxLjVzIDdzO1xufVxuXG4ucm90YXRpbmdUZXh0LWFkamVjdGl2ZTpudGgtb2YtdHlwZSg3KSB7XG4gICAgYW5pbWF0aW9uOiByb3RhdGUtdGV4dC11cCAxLjVzIDguMjVzO1xufVxuLnJvdGF0aW5nVGV4dC1hZGplY3RpdmU6bnRoLW9mLXR5cGUoOCkge1xuICAgIGFuaW1hdGlvbjogcm90YXRlLXRleHQtdXAgMS41cyA5LjUwcztcbn1cbi5yb3RhdGluZ1RleHQtYWRqZWN0aXZlOm50aC1vZi10eXBlKDkpIHtcbiAgICBhbmltYXRpb246IGZhZGUtdGV4dC1pbiAxLjVzIDEwLjc1cyBmb3J3YXJkcztcbn1cbkBrZXlmcmFtZXMgcm90YXRlLXRleHQtdXAge1xuICAgIDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgwLCA4MHB4LCAwKTtcbiAgICAgICAgb3BhY2l0eTogMDtcbiAgIH1cbiAgICAyMCUsIDgwJSB7XG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMCwgMCwgMCk7XG4gICAgICAgIG9wYWNpdHk6IDE7XG4gICB9XG4gICAgMTAwJSB7XG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMCwgLTQwcHgsIDApO1xuICAgICAgICBvcGFjaXR5OiAwO1xuICAgfVxufVxuQGtleWZyYW1lcyBmYWRlLXRleHQtaW4ge1xuICAgIDAlIHtcbiAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgwLCA4MHB4LCAwKTtcbiAgIH1cbiAgICA1MCUsIDEwMCUge1xuICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xuICAgfVxufVxuXG4uYnRuLWFjdGlvbi1hcHByb3ZlIHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgZmxvYXQ6IHJpZ2h0O1xuICAgIG1hcmdpbi1ib3R0b206IDZweDtcbiAgICB3aWR0aDoxMDAlICFpbXBvcnRhbnQ7XG4gICAgcGFkZGluZzogOHB4IDEwcHg7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzI4YTc0NTtcbiAgICBib3JkZXI6IG5vbmU7XG59XG5cbi5idG4tYWN0aW9uLWFwcHJvdmU6aG92ZXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICMxYzc0MzA7XG4gICAgb3V0bGluZTogbm9uZTtcbn1cblxuLmJ0bi1hY3Rpb24tYXBwcm92ZTpmb2N1cyB7XG4gICAgb3V0bGluZTogbm9uZSAhaW1wb3J0YW50O1xuICAgIGJveC1zaGFkb3c6IG5vbmUgIWltcG9ydGFudDtcbn1cblxuLmJ0bi1hY3Rpb24tZGVueSB7XG4gICAgZm9udC1zaXplOiAxNHB4O1xuICAgIGZsb2F0OiByaWdodDtcbiAgICBtYXJnaW4tYm90dG9tOiA2cHg7XG4gICAgd2lkdGg6MTAwJSAhaW1wb3J0YW50O1xuICAgIHBhZGRpbmc6IDhweCAxMHB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNkYzM1NDU7XG4gICAgYm9yZGVyOiBub25lO1xufVxuXG4uYnRuLWFjdGlvbi1kZW55OmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjOWEyNTMwO1xuICAgIG91dGxpbmU6IG5vbmU7XG59XG5cbi5idG4tYWN0aW9uLWRlbnk6Zm9jdXMge1xuICAgIG91dGxpbmU6IG5vbmUgIWltcG9ydGFudDtcbiAgICBib3gtc2hhZG93OiBub25lICFpbXBvcnRhbnQ7XG59XG5cbi5idG4tYWN0aW9uLXVwbG9hZCB7XG4gICAgZm9udC1zaXplOiAxNHB4O1xuICAgIGZsb2F0OiByaWdodDtcbiAgICBtYXJnaW4tYm90dG9tOiA2cHg7XG4gICAgd2lkdGg6MTAwJSAhaW1wb3J0YW50O1xuICAgIHBhZGRpbmc6IDhweCAxMHB4O1xuICAgIGNvbG9yOiAjMDAwO1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNGRUM5MDE7XG4gICAgYm9yZGVyOiBub25lO1xufVxuXG4uYnRuLWFjdGlvbi11cGxvYWQ6aG92ZXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICM5ODc4MDA7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgb3V0bGluZTogbm9uZTtcbn1cblxuLmJ0bi1hY3Rpb24tdXBsb2FkOmZvY3VzIHtcbiAgICBvdXRsaW5lOiBub25lICFpbXBvcnRhbnQ7XG4gICAgYm94LXNoYWRvdzogbm9uZSAhaW1wb3J0YW50O1xufVxuXG4uYnRuLWFjdGlvbi1yZXZpZXcge1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBmbG9hdDogcmlnaHQ7XG4gICAgbWFyZ2luLWJvdHRvbTogNnB4O1xuICAgIHdpZHRoOjEwMCUgIWltcG9ydGFudDtcbiAgICBwYWRkaW5nOiA4cHggMTBweDtcbiAgICBib3JkZXI6IG5vbmU7ICBcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMzYzNjM2O1xuICAgIGJvcmRlcjogbm9uZTtcbn1cblxuLmJ0bi1hY3Rpb24tcmV2aWV3OmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIG91dGxpbmU6IG5vbmU7XG59XG5cbi5idG4tYWN0aW9uLXJldmlldzpmb2N1cyB7XG4gICAgb3V0bGluZTogbm9uZSAhaW1wb3J0YW50O1xuICAgIGJveC1zaGFkb3c6IG5vbmUgIWltcG9ydGFudDtcbn1cblxuLmJ0bi1oaXN0b3J5LXRlYW1zIHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgZmxvYXQ6IHJpZ2h0O1xuICAgIG1hcmdpbi1ib3R0b206IDZweDtcbiAgICB3aWR0aDoxMDAlICFpbXBvcnRhbnQ7XG4gICAgcGFkZGluZzogOHB4IDEwcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzUwNUFDOTtcbiAgICBib3JkZXI6IG5vbmU7XG59XG5cbi5idG4taGlzdG9yeS10ZWFtczpob3ZlciB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzM4M2U4YztcbiAgICBjb2xvcjogI2ZmZjtcbiAgICBvdXRsaW5lOiBub25lO1xufVxuXG4uYnRuLWhpc3RvcnktdGVhbXM6Zm9jdXMge1xuICAgIG91dGxpbmU6IG5vbmUgIWltcG9ydGFudDtcbiAgICBib3gtc2hhZG93OiBub25lICFpbXBvcnRhbnQ7XG59XG5cbi5idG4taGlzdG9yeS1vdXRsb29rIHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgZmxvYXQ6IHJpZ2h0O1xuICAgIG1hcmdpbi1ib3R0b206IDZweDtcbiAgICB3aWR0aDoxMDAlICFpbXBvcnRhbnQ7XG4gICAgcGFkZGluZzogOHB4IDEwcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzAwNzJDNjtcbiAgICBib3JkZXI6IG5vbmU7XG59XG5cbi5idG4taGlzdG9yeS1vdXRsb29rOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA0ZjhhO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIG91dGxpbmU6IG5vbmU7XG59XG5cbi5idG4taGlzdG9yeS1vdXRsb29rOmZvY3VzIHtcbiAgICBvdXRsaW5lOiBub25lICFpbXBvcnRhbnQ7XG4gICAgYm94LXNoYWRvdzogbm9uZSAhaW1wb3J0YW50O1xufVxuXG4uY2VudGVyIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBtYXJnaW4tbGVmdDogYXV0bztcbiAgICBtYXJnaW4tcmlnaHQ6IGF1dG87XG4gICAgd2lkdGg6IDUwJTtcbn0iXX0= */"] });


/***/ }),

/***/ 71813:
/*!********************************************************************************!*\
  !*** ./src/app/@modules/marketplace/resolvers/marketplace-resolver.service.ts ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MarketplaceResolverService": () => (/* binding */ MarketplaceResolverService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 26439);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 47418);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_root_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../@shared/services/root.service */ 36603);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_api_shop_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../@shared/api/shop.service */ 32053);







class MarketplaceResolverService {
    constructor(root, router, shop) {
        this.root = root;
        this.router = router;
        this.shop = shop;
    }
    resolve(route) {
        // This looks for 'domainSlug' in params or data
        const domainSlug = route.params.domainSlug || route.data.domainSlug || null;
        if (domainSlug === null) {
            return null; // This is correct for /marketplace (root)
        }
        return this.shop.getDomain(domainSlug).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
            if (error instanceof _angular_common_http__WEBPACK_IMPORTED_MODULE_3__.HttpErrorResponse && error.status === 404) {
                // This is likely where your 404 redirect is coming from!
                this.router.navigateByUrl(this.root.notFound()).then();
            }
            return rxjs__WEBPACK_IMPORTED_MODULE_4__.EMPTY;
        }));
    }
}
MarketplaceResolverService.ɵfac = function MarketplaceResolverService_Factory(t) { return new (t || MarketplaceResolverService)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_shared_services_root_service__WEBPACK_IMPORTED_MODULE_0__.RootService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_shared_api_shop_service__WEBPACK_IMPORTED_MODULE_1__.ShopService)); };
MarketplaceResolverService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjectable"]({ token: MarketplaceResolverService, factory: MarketplaceResolverService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 13022:
/*!****************************************************************************!*\
  !*** ./src/app/@modules/marketplace/resolvers/product-resolver.service.ts ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProductResolverService": () => (/* binding */ ProductResolverService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 26439);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 47418);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_root_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../@shared/services/root.service */ 36603);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_api_shop_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../@shared/api/shop.service */ 32053);







class ProductResolverService {
    constructor(root, router, shop) {
        this.root = root;
        this.router = router;
        this.shop = shop;
    }
    resolve(route) {
        const productSlug = route.params.productSlug || route.data.productSlug;
        return this.shop.getProduct(productSlug).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
            if (error instanceof _angular_common_http__WEBPACK_IMPORTED_MODULE_3__.HttpErrorResponse && error.status === 404) {
                this.router.navigate([this.root.notFound()]).then();
            }
            return rxjs__WEBPACK_IMPORTED_MODULE_4__.EMPTY;
        }));
    }
}
ProductResolverService.ɵfac = function ProductResolverService_Factory(t) { return new (t || ProductResolverService)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_shared_services_root_service__WEBPACK_IMPORTED_MODULE_0__.RootService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_shared_api_shop_service__WEBPACK_IMPORTED_MODULE_1__.ShopService)); };
ProductResolverService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjectable"]({ token: ProductResolverService, factory: ProductResolverService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 80704:
/*!**********************************************************************************!*\
  !*** ./src/app/@modules/marketplace/resolvers/products-list-resolver.service.ts ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProductsListResolverService": () => (/* binding */ ProductsListResolverService),
/* harmony export */   "parseProductsListParams": () => (/* binding */ parseProductsListParams)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 64139);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ 47418);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_api_shop_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../@shared/api/shop.service */ 32053);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ 52816);





function parseProductsListParams(params) {
    const options = {};
    if (params.page) {
        options.page = parseFloat(params.page);
    }
    if (params.limit) {
        options.limit = parseFloat(params.limit);
    }
    if (params.sort) {
        options.sort = params.sort;
    }
    const filterValues = {};
    Object.keys(params).forEach(param => {
        const mr = param.match(/^filter_([_a-z0-9]+)$/);
        if (mr) {
            filterValues[mr[1]] = params[param];
        }
    });
    if (Object.keys(filterValues).length > 0) {
        options.filterValues = filterValues;
    }
    return options;
}
class ProductsListResolverService {
    constructor(shop, router) {
        this.shop = shop;
        this.router = router;
    }
    resolve(route) {
        const domainSlug = route.params.domainSlug || route.data.domainSlug || null;
        // Inline parsing to avoid declaration conflicts
        const options = {
            page: parseFloat(route.queryParams.page || '1'),
            limit: parseFloat(route.queryParams.limit || '12'),
            sort: route.queryParams.sort || 'default'
        };
        return this.shop.getProductsList(domainSlug, options).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.catchError)(() => {
            if (domainSlug)
                this.router.navigate(['/404']);
            // Return a valid empty structure so the component doesn't crash
            return (0,rxjs__WEBPACK_IMPORTED_MODULE_2__.of)({ items: [], total: 0, count: 0, page: 1, limit: 12, pages: 1 });
        }));
    }
}
ProductsListResolverService.ɵfac = function ProductsListResolverService_Factory(t) { return new (t || ProductsListResolverService)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_shared_api_shop_service__WEBPACK_IMPORTED_MODULE_0__.ShopService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.Router)); };
ProductsListResolverService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjectable"]({ token: ProductsListResolverService, factory: ProductsListResolverService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 25586:
/*!**********************************************************************!*\
  !*** ./src/app/@modules/marketplace/services/page-domain.service.ts ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageDomainService": () => (/* binding */ PageDomainService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ 84505);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ 59151);




/**
 * This service serves as a mediator between the PageDomainComponent, ProductsViewComponent and WidgetFiltersComponent components.
 */
class PageDomainService {
    constructor() {
        // isLoading
        this.isLoadingState = false;
        this.isLoadingSource = new rxjs__WEBPACK_IMPORTED_MODULE_0__.BehaviorSubject(this.isLoadingState);
        this.isLoading$ = this.isLoadingSource.asObservable();
        // list
        this.listState = null;
        this.listSource = new rxjs__WEBPACK_IMPORTED_MODULE_0__.BehaviorSubject(this.listState);
        this.list$ = this.listSource.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.filter)(x => x !== null));
        // options
        this.optionsState = {};
        this.optionsChange$ = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.EventEmitter();
    }
    get options() {
        return this.optionsState;
    }
    // getters for list
    get items() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.items) || []; }
    get page() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.page) || 1; }
    get limit() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.limit) || 1; }
    get sort() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.sort) || ''; }
    get total() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.total) || 1; }
    get pages() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.pages) || 1; }
    get from() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.from) || 1; }
    get to() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.to) || 1; }
    get filters() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.filters) || []; }
    get filterValues() { var _a; return ((_a = this.listState) === null || _a === void 0 ? void 0 : _a.filterValues) || {}; }
    // set functions
    setIsLoading(value) {
        this.isLoadingState = value;
        this.isLoadingSource.next(value);
    }
    setList(list) {
        this.listState = list;
        this.listSource.next(this.listState);
    }
    setOptions(options, emitEvent = true) {
        const diff = this.optionsDiff(options);
        if ('limit' in diff || 'sort' in diff || 'filterValues' in diff) {
            options.page = 1;
        }
        this.optionsState = options;
        if (emitEvent && Object.keys(diff).length > 0) {
            this.optionsChange$.emit(diff);
        }
    }
    updateOptions(options, emitEvent = true) {
        this.setOptions(Object.assign(Object.assign({}, this.optionsState), options), emitEvent);
    }
    /**
     * Returns only different options.
     */
    optionsDiff(curr) {
        const result = {};
        // Removed the 'const' inside the loop that was shadowing the outer 'result'
        ['page', 'limit', 'sort'].forEach(key => {
            if (key in curr && this[key] !== curr[key]) {
                result[key] = curr[key];
            }
        });
        if ('filterValues' in curr) {
            const filterValues = curr.filterValues || {};
            if (Object.keys(filterValues).length !== Object.keys(this.filterValues).length) {
                result.filterValues = {};
            }
            Object.keys(filterValues).forEach(key => {
                if (this.filterValues[key] !== filterValues[key]) {
                    if (!result.filterValues)
                        result.filterValues = {};
                    result.filterValues[key] = filterValues[key];
                }
            });
        }
        return result;
    }
}
PageDomainService.ɵfac = function PageDomainService_Factory(t) { return new (t || PageDomainService)(); };
PageDomainService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({ token: PageDomainService, factory: PageDomainService.ɵfac });


/***/ }),

/***/ 92720:
/*!***********************************************************************!*\
  !*** ./src/app/@modules/marketplace/services/shop-sidebar.service.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ShopSidebarService": () => (/* binding */ ShopSidebarService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ 92218);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 3184);


class ShopSidebarService {
    constructor() {
        this.isOpenSubject$ = new rxjs__WEBPACK_IMPORTED_MODULE_0__.Subject();
        this.isOpen$ = this.isOpenSubject$.asObservable();
    }
    open() {
        this.isOpenSubject$.next(true);
    }
    close() {
        this.isOpenSubject$.next(false);
    }
}
ShopSidebarService.ɵfac = function ShopSidebarService_Factory(t) { return new (t || ShopSidebarService)(); };
ShopSidebarService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: ShopSidebarService, factory: ShopSidebarService.ɵfac });


/***/ }),

/***/ 50742:
/*!***********************************************************!*\
  !*** ./src/app/@shared/services/offcanvas-dar.service.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OffcanvasDARService": () => (/* binding */ OffcanvasDARService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ 84505);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ 36362);




class OffcanvasDARService {
    constructor(platformId) {
        this.platformId = platformId;
        this.openSubject$ = new rxjs__WEBPACK_IMPORTED_MODULE_0__.BehaviorSubject(false);
        this.isOpen$ = this.openSubject$.asObservable();
    }
    open() {
        if ((0,_angular_common__WEBPACK_IMPORTED_MODULE_1__.isPlatformBrowser)(this.platformId)) {
            const bodyWidth = document.body.offsetWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = (document.body.offsetWidth - bodyWidth) + 'px';
            this.openSubject$.next(true);
        }
    }
    close() {
        if ((0,_angular_common__WEBPACK_IMPORTED_MODULE_1__.isPlatformBrowser)(this.platformId)) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            this.openSubject$.next(false);
        }
    }
    toggle() {
        this.openSubject$.next(!this.openSubject$.value);
    }
}
OffcanvasDARService.ɵfac = function OffcanvasDARService_Factory(t) { return new (t || OffcanvasDARService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_core__WEBPACK_IMPORTED_MODULE_2__.PLATFORM_ID)); };
OffcanvasDARService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({ token: OffcanvasDARService, factory: OffcanvasDARService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 62812:
/*!**********************************!*\
  !*** ./src/data/intended-use.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "intended": () => (/* binding */ intended)
/* harmony export */ });
const intended = [];


/***/ }),

/***/ 8979:
/*!*****************************************!*\
  !*** ./src/data/product-description.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "description": () => (/* binding */ description)
/* harmony export */ });
const description = [];


/***/ }),

/***/ 75488:
/*!*******************************************!*\
  !*** ./src/data/product-documentation.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "documentation": () => (/* binding */ documentation)
/* harmony export */ });
const documentation = [
    { name: 'General', features: [
            { name: 'Material', value: 'Aluminium, Plastic' },
            { name: 'Engine Type', value: 'Brushless' },
            { name: 'Battery Voltage', value: '18 V' },
            { name: 'Battery Type', value: 'Li-lon' },
            { name: 'Number of Speeds', value: '2' },
            { name: 'Charge Time', value: '1.08 h' },
            { name: 'Weight', value: '1.5 kg' }
        ] },
];


/***/ }),

/***/ 33384:
/*!**************************************!*\
  !*** ./src/data/product-resource.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "resource": () => (/* binding */ resource)
/* harmony export */ });
const resource = [
    { name: 'General', features: [
            { name: 'Material', value: 'Aluminium, Plastic' },
            { name: 'Engine Type', value: 'Brushless' },
            { name: 'Battery Voltage', value: '18 V' },
            { name: 'Battery Type', value: 'Li-lon' },
            { name: 'Number of Speeds', value: '2' },
            { name: 'Charge Time', value: '1.08 h' },
            { name: 'Weight', value: '1.5 kg' }
        ] },
];


/***/ }),

/***/ 87506:
/*!*************************************!*\
  !*** ./src/data/product-reviews.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "reviews": () => (/* binding */ reviews)
/* harmony export */ });
const reviews = [
    {
        avatar: 'assets/images/avatars/avatar-1.jpg',
        author: 'Samantha Smith',
        rating: 4,
        date: '27 May, 2018',
        text: 'Phasellus id mattis nulla. Mauris velit nisi, imperdiet vitae sodales in, maximus ut lectus. Vivamus commodo ' +
            'scelerisque lacus, at porttitor dui iaculis id. Curabitur imperdiet ultrices fermentum.'
    },
    {
        avatar: 'assets/images/avatars/avatar-2.jpg',
        author: 'Adam Taylor',
        rating: 3,
        date: '12 April, 2018',
        text: 'Aenean non lorem nisl. Duis tempor sollicitudin orci, eget tincidunt ex semper sit amet. Nullam neque justo, ' +
            'sodales congue feugiat ac, facilisis a augue. Donec tempor sapien et fringilla facilisis. Nam maximus consectetur ' +
            'diam. Nulla ut ex mollis, volutpat tellus vitae, accumsan ligula.'
    },
    {
        avatar: 'assets/images/avatars/avatar-3.jpg',
        author: 'Helena Garcia',
        rating: 5,
        date: '2 January, 2018',
        text: 'Duis ac lectus scelerisque quam blandit egestas. Pellentesque hendrerit eros laoreet suscipit ultrices.'
    }
];


/***/ }),

/***/ 54968:
/*!************************************!*\
  !*** ./src/data/whats-included.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "included": () => (/* binding */ included)
/* harmony export */ });
const included = [];


/***/ })

}]);
//# sourceMappingURL=src_app_modules_marketplace_marketplace_module_ts.js.map