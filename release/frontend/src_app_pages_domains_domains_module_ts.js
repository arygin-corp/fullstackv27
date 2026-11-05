"use strict";
(self["webpackChunkgdx"] = self["webpackChunkgdx"] || []).push([["src_app_pages_domains_domains_module_ts"],{

/***/ 61534:
/*!**********************************************************!*\
  !*** ./src/app/@pages/domains/domains-routing.module.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DomainsRoutingModule": () => (/* binding */ DomainsRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _domains_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./domains.component */ 49064);
/* harmony import */ var _domains_subdomains_subdomains_one_subdomains_one_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../domains/subdomains/subdomains-one/subdomains-one.component */ 11977);
/* harmony import */ var _domains_subdomains_subdomains_two_subdomains_two_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../domains/subdomains/subdomains-two/subdomains-two.component */ 94016);
/* harmony import */ var _azure_msal_angular__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @azure/msal-angular */ 14084);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 3184);







const routes = [
    {
        path: "",
        component: _domains_component__WEBPACK_IMPORTED_MODULE_0__.DomainsComponent,
        canActivate: [_azure_msal_angular__WEBPACK_IMPORTED_MODULE_3__.MsalGuard]
    },
    {
        path: ":type",
        component: _domains_subdomains_subdomains_one_subdomains_one_component__WEBPACK_IMPORTED_MODULE_1__.SubdomainsOneComponent,
        canActivate: [_azure_msal_angular__WEBPACK_IMPORTED_MODULE_3__.MsalGuard]
    },
    {
        path: ":type/:subtype",
        component: _domains_subdomains_subdomains_two_subdomains_two_component__WEBPACK_IMPORTED_MODULE_2__.SubdomainsTwoComponent,
        canActivate: [_azure_msal_angular__WEBPACK_IMPORTED_MODULE_3__.MsalGuard]
    }
];
class DomainsRoutingModule {
}
DomainsRoutingModule.ɵfac = function DomainsRoutingModule_Factory(t) { return new (t || DomainsRoutingModule)(); };
DomainsRoutingModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineNgModule"]({ type: DomainsRoutingModule });
DomainsRoutingModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjector"]({ imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule.forChild(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsetNgModuleScope"](DomainsRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule] }); })();


/***/ }),

/***/ 49064:
/*!*****************************************************!*\
  !*** ./src/app/@pages/domains/domains.component.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DomainsComponent": () => (/* binding */ DomainsComponent)
/* harmony export */ });
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../environments/environment */ 92340);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_domains_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./../../@shared/services/domains.service */ 69009);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_components_page_loader_page_loader_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../@shared/components/page-loader/page-loader.component */ 81173);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 52816);







function DomainsComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "app-page-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} }
function DomainsComponent_div_2_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "a", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](3, "img", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "h6", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "p", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "a", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10, "View All");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const domain_r3 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("routerLink", ctx_r2.resolveNavigation(domain_r3));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("src", domain_r3.image, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsanitizeUrl"])("alt", domain_r3.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](domain_r3.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](domain_r3.desc);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("routerLink", ctx_r2.resolveNavigation(domain_r3));
} }
function DomainsComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, DomainsComponent_div_2_div_1_Template, 11, 6, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r1.domainData);
} }
const _c0 = function () { return { label: "Domains", url: "/" }; };
const _c1 = function (a0) { return [a0]; };
class DomainsComponent {
    constructor(domainsService) {
        this.domainsService = domainsService;
        this.domainData = [];
        this.isLoading = true;
        this.baseUrl = _environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl;
    }
    ngOnInit() {
        this.domainsService.getDomains().subscribe({
            next: (data) => {
                this.domainData = data.map(domain => (Object.assign(Object.assign({}, domain), { image: this.formatImageUrl(domain.image) }))).sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }
    formatImageUrl(imagePath) {
        if (!imagePath)
            return 'assets/images/placeholder.jpg';
        if (imagePath.startsWith('http'))
            return imagePath;
        const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${base}${path}`;
    }
    getDescription(domain) {
        return domain.desc || domain.description || `Explore products in ${domain.name}`;
    }
    resolveNavigation(domain) {
        var _a;
        // 1. Single Product Redirect logic
        if (domain.product_count === 1 && ((_a = domain.products) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            const product = domain.products[0];
            // Ensure we use the slug from the product object
            const productSlug = product.slug || product.name.toLowerCase().replace(/ /g, '-');
            // FIX: Changed 'products' to 'product' to match MarketplaceRoutingModule
            return ['/marketplace/product', productSlug];
        }
        // 2. Domain/Subdomain Navigation logic
        const slug = domain.slug || domain.name.toLowerCase().replace(/ /g, '-');
        // Using an absolute path is safer to ensure it always maps back to your root :type route
        return ['/', slug];
    }
}
DomainsComponent.ɵfac = function DomainsComponent_Factory(t) { return new (t || DomainsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_shared_services_domains_service__WEBPACK_IMPORTED_MODULE_1__.DomainsService)); };
DomainsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: DomainsComponent, selectors: [["app-domains"]], decls: 3, vars: 6, consts: [[3, "breadcrumbs"], ["class", "text-center py-4", 4, "ngIf"], ["class", "row p-2", 4, "ngIf"], [1, "text-center", "py-4"], [1, "row", "p-2"], ["class", "col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xs-12 col-12 mb-4", 4, "ngFor", "ngForOf"], [1, "col-xl-3", "col-lg-4", "col-md-4", "col-sm-6", "col-xs-12", "col-12", "mb-4"], [1, "card", "domain-cards", "mb-2"], [3, "routerLink"], [1, "card-img-top", "ie-image", 3, "src", "alt"], [1, "card-body"], [1, "card-title", "d-block"], [1, "card-text", "d-block", "font-weight-light"], [1, "btn", "btn-primary", "btn-sm", "align-right", 3, "routerLink"]], template: function DomainsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "app-page-header", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, DomainsComponent_div_1_Template, 2, 0, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, DomainsComponent_div_2_Template, 2, 1, "div", 2);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpureFunction1"](4, _c1, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpureFunction0"](3, _c0)));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.isLoading);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", !ctx.isLoading);
    } }, directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_2__.PageHeaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_5__.NgIf, _shared_components_page_loader_page_loader_component__WEBPACK_IMPORTED_MODULE_3__.PageLoaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_5__.NgForOf, _angular_router__WEBPACK_IMPORTED_MODULE_6__.RouterLinkWithHref], styles: [".card-title[_ngcontent-%COMP%] {\n  margin-bottom: 0.75rem !important;\n  font-size: 14px !important;\n}\n\n.card-text[_ngcontent-%COMP%] {\n  font-size: 14px !important;\n  height: 43.5px !important;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 2.2;\n  -webkit-box-orient: vertical;\n}\n\n.card-body[_ngcontent-%COMP%] {\n  min-height: 140px !important;\n  padding: 0.5rem;\n}\n\n.align-right[_ngcontent-%COMP%] {\n  float: right;\n}\n\n.btn-primary[_ngcontent-%COMP%] {\n  color: #04fdff !important;\n  border-color: #222 !important;\n  background-color: #222 !important;\n}\n\n.btn-primary[_ngcontent-%COMP%]:hover {\n  color: #04fdff !important;\n  border-color: #222 !important;\n  background-color: #222 !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbWFpbnMuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxpQ0FBQTtFQUNBLDBCQUFBO0FBQ0o7O0FBRUE7RUFDSSwwQkFBQTtFQUNBLHlCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxvQkFBQTtFQUNBLHVCQUFBO0VBQ0EsNEJBQUE7QUFDSjs7QUFFQTtFQUNJLDRCQUFBO0VBQ0EsZUFBQTtBQUNKOztBQUVBO0VBQ0ksWUFBQTtBQUNKOztBQUVBO0VBQ0kseUJBQUE7RUFDQSw2QkFBQTtFQUNBLGlDQUFBO0FBQ0o7O0FBRUE7RUFDSSx5QkFBQTtFQUNBLDZCQUFBO0VBQ0EsaUNBQUE7QUFDSiIsImZpbGUiOiJkb21haW5zLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmNhcmQtdGl0bGUge1xuICAgIG1hcmdpbi1ib3R0b206IDAuNzVyZW0gIWltcG9ydGFudDtcbiAgICBmb250LXNpemU6IDE0cHggIWltcG9ydGFudDtcbn1cblxuLmNhcmQtdGV4dCB7XG4gICAgZm9udC1zaXplOiAxNHB4ICFpbXBvcnRhbnQ7XG4gICAgaGVpZ2h0OiA0My41cHghaW1wb3J0YW50O1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgZGlzcGxheTogLXdlYmtpdC1ib3g7XG4gICAgLXdlYmtpdC1saW5lLWNsYW1wOiAyLjI7XG4gICAgLXdlYmtpdC1ib3gtb3JpZW50OiB2ZXJ0aWNhbDtcbn1cblxuLmNhcmQtYm9keSB7XG4gICAgbWluLWhlaWdodDogMTQwcHggIWltcG9ydGFudDtcbiAgICBwYWRkaW5nOiAwLjVyZW07XG59XG5cbi5hbGlnbi1yaWdodCB7XG4gICAgZmxvYXQ6IHJpZ2h0O1xufVxuXG4uYnRuLXByaW1hcnkge1xuICAgIGNvbG9yOiAjMDRmZGZmICFpbXBvcnRhbnQ7XG4gICAgYm9yZGVyLWNvbG9yOiAjMjIyICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzIyMiAhaW1wb3J0YW50O1xufVxuXG4uYnRuLXByaW1hcnk6aG92ZXIge1xuICAgIGNvbG9yOiAjMDRmZGZmICFpbXBvcnRhbnQ7XG4gICAgYm9yZGVyLWNvbG9yOiAjMjIyICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzIyMiAhaW1wb3J0YW50O1xufSJdfQ== */"] });


/***/ }),

/***/ 90260:
/*!**************************************************!*\
  !*** ./src/app/@pages/domains/domains.module.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DomainsModule": () => (/* binding */ DomainsModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _domains_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./domains-routing.module */ 61534);
/* harmony import */ var src_app_shared_shared_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/@shared/shared.module */ 32234);
/* harmony import */ var _domains_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./domains.component */ 49064);
/* harmony import */ var _domains_subdomains_subdomains_one_subdomains_one_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../domains/subdomains/subdomains-one/subdomains-one.component */ 11977);
/* harmony import */ var _domains_subdomains_subdomains_two_subdomains_two_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../domains/subdomains/subdomains-two/subdomains-two.component */ 94016);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 3184);








class DomainsModule {
}
DomainsModule.ɵfac = function DomainsModule_Factory(t) { return new (t || DomainsModule)(); };
DomainsModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineNgModule"]({ type: DomainsModule });
DomainsModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjector"]({ imports: [[
            _angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule,
            _angular_router__WEBPACK_IMPORTED_MODULE_7__.RouterModule,
            src_app_shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule,
            _domains_routing_module__WEBPACK_IMPORTED_MODULE_0__.DomainsRoutingModule
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsetNgModuleScope"](DomainsModule, { declarations: [_domains_component__WEBPACK_IMPORTED_MODULE_2__.DomainsComponent,
        _domains_subdomains_subdomains_one_subdomains_one_component__WEBPACK_IMPORTED_MODULE_3__.SubdomainsOneComponent,
        _domains_subdomains_subdomains_two_subdomains_two_component__WEBPACK_IMPORTED_MODULE_4__.SubdomainsTwoComponent], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule,
        _angular_router__WEBPACK_IMPORTED_MODULE_7__.RouterModule,
        src_app_shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule,
        _domains_routing_module__WEBPACK_IMPORTED_MODULE_0__.DomainsRoutingModule] }); })();


/***/ }),

/***/ 11977:
/*!**************************************************************************************!*\
  !*** ./src/app/@pages/domains/subdomains/subdomains-one/subdomains-one.component.ts ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SubdomainsOneComponent": () => (/* binding */ SubdomainsOneComponent)
/* harmony export */ });
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../environments/environment */ 92340);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_services_domains_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/services/domains.service */ 69009);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 36362);






function SubdomainsOneComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3, "Loading Subdomains...");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function SubdomainsOneComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, " No subdomains found for this category.\n");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function SubdomainsOneComponent_div_3_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "a", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](3, "img", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "h6", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](7, "p", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "a", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](10, "View All");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const subdomain_r4 = ctx.$implicit;
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("routerLink", ctx_r3.resolveNavigation(subdomain_r4));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("src", subdomain_r4.image, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"])("alt", subdomain_r4.name + " Domain");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](subdomain_r4.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](subdomain_r4.desc);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("routerLink", ctx_r3.resolveNavigation(subdomain_r4));
} }
function SubdomainsOneComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, SubdomainsOneComponent_div_3_div_1_Template, 11, 6, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r2.subdomains);
} }
const _c0 = function () { return { label: "Domains", url: "/" }; };
const _c1 = function (a0, a1) { return { label: a0, url: a1 }; };
const _c2 = function (a0, a1) { return [a0, a1]; };
class SubdomainsOneComponent {
    constructor(route, domainsService) {
        this.route = route;
        this.domainsService = domainsService;
        this.subdomains = [];
        this.isLoading = true;
        this.currentType = '';
    }
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.currentType = params.get('type') || '';
            this.fetchData();
        });
    }
    fetchData() {
        this.isLoading = true;
        this.domainsService.getDomains().subscribe({
            next: (data) => {
                // Find the parent
                const found = data.find(d => d.slug === this.currentType || d.name.toLowerCase().replace(/ /g, '-') === this.currentType);
                if (found) {
                    this.parentDomain = found;
                    // Map and format the images for Level 2 (subdomains)
                    this.subdomains = (found.subdomains || [])
                        .map((sub) => {
                        var _a;
                        return (Object.assign(Object.assign({}, sub), { 
                            // Ensure image is formatted if not already absolute
                            image: ((_a = sub.image) === null || _a === void 0 ? void 0 : _a.startsWith('http')) ? sub.image : `${_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl}${sub.image}` }));
                    })
                        .sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
                }
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }
    resolveNavigation(subdomain) {
        // If we have deeper sub-subdomains, go to Level 3 page
        if (subdomain.subdomains && subdomain.subdomains.length > 0) {
            const subSlug = subdomain.slug || subdomain.name.toLowerCase().replace(/ /g, '-');
            return ['/', this.currentType, subSlug]; // Result: /domain/automotive/parts
        }
        // Otherwise, go straight to products
        return ['/marketplace/products', subdomain.slug];
    }
    getDescription(item) {
        return item.desc || item.description || item.name;
    }
}
SubdomainsOneComponent.ɵfac = function SubdomainsOneComponent_Factory(t) { return new (t || SubdomainsOneComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_shared_services_domains_service__WEBPACK_IMPORTED_MODULE_1__.DomainsService)); };
SubdomainsOneComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: SubdomainsOneComponent, selectors: [["app-subdomains-one"]], decls: 4, vars: 11, consts: [[3, "breadcrumbs"], ["class", "text-center py-4", 4, "ngIf"], ["class", "text-center py-4 text-muted", 4, "ngIf"], ["class", "row p-2", 4, "ngIf"], [1, "text-center", "py-4"], ["role", "status", 1, "spinner-border", "text-primary"], [1, "text-center", "py-4", "text-muted"], [1, "row", "p-2"], ["class", "col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xs-12 col-12 float-left mb-4", 4, "ngFor", "ngForOf"], [1, "col-xl-3", "col-lg-4", "col-md-4", "col-sm-6", "col-xs-12", "col-12", "float-left", "mb-4"], [1, "card", "domain-cards", "mb-2"], [3, "routerLink"], [1, "card-img-top", "ie-image", 3, "src", "alt"], [1, "card-body"], [1, "card-title", "d-block"], [1, "card-text", "d-block", "font-weight-light"], [1, "btn", "btn-primary", "btn-sm", "align-right", 3, "routerLink"]], template: function SubdomainsOneComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](0, "app-page-header", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, SubdomainsOneComponent_div_1_Template, 4, 0, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, SubdomainsOneComponent_div_2_Template, 2, 0, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](3, SubdomainsOneComponent_div_3_Template, 2, 1, "div", 3);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction2"](8, _c2, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction0"](4, _c0), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction2"](5, _c1, ctx.parentDomain == null ? null : ctx.parentDomain.name, "/" + (ctx.parentDomain == null ? null : ctx.parentDomain.slug))));
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.isLoading);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", !ctx.isLoading && !ctx.subdomains.length);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", !ctx.isLoading && ctx.subdomains.length);
    } }, directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_2__.PageHeaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_5__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_5__.NgForOf, _angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterLinkWithHref], styles: [".card-title[_ngcontent-%COMP%] {\n  margin-bottom: 0.75rem !important;\n  font-size: 14px !important;\n}\n\n.card-text[_ngcontent-%COMP%] {\n  font-size: 14px !important;\n  height: 43.5px !important;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 2.2;\n  -webkit-box-orient: vertical;\n}\n\n.card-body[_ngcontent-%COMP%] {\n  min-height: 140px !important;\n  padding: 0.5rem;\n}\n\n.align-right[_ngcontent-%COMP%] {\n  float: right;\n}\n\n.btn-primary[_ngcontent-%COMP%] {\n  color: #04fdff !important;\n  border-color: #222 !important;\n  background-color: #222 !important;\n}\n\n.btn-primary[_ngcontent-%COMP%]:hover {\n  color: #04fdff !important;\n  border-color: #222 !important;\n  background-color: #222 !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YmRvbWFpbnMtb25lLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQ0ksaUNBQUE7RUFDQSwwQkFBQTtBQUFKOztBQUdBO0VBQ0UsMEJBQUE7RUFDQSx5QkFBQTtFQUNBLGdCQUFBO0VBQ0Esb0JBQUE7RUFDQSx1QkFBQTtFQUNBLDRCQUFBO0FBQUY7O0FBR0E7RUFDSSw0QkFBQTtFQUNBLGVBQUE7QUFBSjs7QUFHQTtFQUNJLFlBQUE7QUFBSjs7QUFHQTtFQUNJLHlCQUFBO0VBQ0EsNkJBQUE7RUFDQSxpQ0FBQTtBQUFKOztBQUdBO0VBQ0kseUJBQUE7RUFDQSw2QkFBQTtFQUNBLGlDQUFBO0FBQUoiLCJmaWxlIjoic3ViZG9tYWlucy1vbmUuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzdWJkb21haW5zLW9uZS5jb21wb25lbnQuc2NzcyAmIHN1YmRvbWFpbnMtdHdvLmNvbXBvbmVudC5zY3NzXG4uY2FyZC10aXRsZSB7XG4gICAgbWFyZ2luLWJvdHRvbTogMC43NXJlbSAhaW1wb3J0YW50O1xuICAgIGZvbnQtc2l6ZTogMTRweCAhaW1wb3J0YW50O1xufVxuXG4uY2FyZC10ZXh0IHtcbiAgZm9udC1zaXplOiAxNHB4ICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogNDMuNXB4IWltcG9ydGFudDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgZGlzcGxheTogLXdlYmtpdC1ib3g7XG4gIC13ZWJraXQtbGluZS1jbGFtcDogMi4yO1xuICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xufVxuXG4uY2FyZC1ib2R5IHtcbiAgICBtaW4taGVpZ2h0OiAxNDBweCAhaW1wb3J0YW50O1xuICAgIHBhZGRpbmc6IDAuNXJlbTtcbn1cblxuLmFsaWduLXJpZ2h0IHtcbiAgICBmbG9hdDogcmlnaHQ7XG59XG5cbi5idG4tcHJpbWFyeSB7XG4gICAgY29sb3I6ICMwNGZkZmYgIWltcG9ydGFudDtcbiAgICBib3JkZXItY29sb3I6ICMyMjIgIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjIyICFpbXBvcnRhbnQ7XG59XG5cbi5idG4tcHJpbWFyeTpob3ZlciB7XG4gICAgY29sb3I6ICMwNGZkZmYgIWltcG9ydGFudDtcbiAgICBib3JkZXItY29sb3I6ICMyMjIgIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjIyICFpbXBvcnRhbnQ7XG59Il19 */"] });


/***/ }),

/***/ 94016:
/*!**************************************************************************************!*\
  !*** ./src/app/@pages/domains/subdomains/subdomains-two/subdomains-two.component.ts ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SubdomainsTwoComponent": () => (/* binding */ SubdomainsTwoComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_services_domains_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/services/domains.service */ 69009);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 36362);





function SubdomainsTwoComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](3, "Loading subdomains...");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function SubdomainsTwoComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "h5", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "a", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](5, "Return to Domains");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("No nested domains found under \"", ctx_r1.parentDomain == null ? null : ctx_r1.parentDomain.name, "\".");
} }
function SubdomainsTwoComponent_div_3_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "a", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](3, "img", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "h6", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "p", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "a", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](10, "View All");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("routerLink", ctx_r3.resolveNavigation(item_r4));
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("src", item_r4.image || "assets/images/placeholder.jpg", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsanitizeUrl"])("alt", item_r4.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](item_r4.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](ctx_r3.getDescription(item_r4));
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("routerLink", ctx_r3.resolveNavigation(item_r4));
} }
function SubdomainsTwoComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, SubdomainsTwoComponent_div_3_div_1_Template, 11, 6, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx_r2.subdomains);
} }
const _c0 = function () { return { label: "Domains", url: "/" }; };
const _c1 = function (a0, a1) { return { label: a0, url: a1 }; };
const _c2 = function (a0, a1, a2) { return [a0, a1, a2]; };
class SubdomainsTwoComponent {
    constructor(route, domainsService) {
        this.route = route;
        this.domainsService = domainsService;
        this.subdomains = []; // The Level 3 items to show
        this.isLoading = true;
        this.currentType = '';
        this.currentSubtype = '';
    }
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.currentType = params.get('type') || '';
            this.currentSubtype = params.get('subtype') || '';
            this.fetchData();
        });
    }
    fetchData() {
        this.isLoading = true;
        this.domainsService.getDomains().subscribe({
            next: (data) => {
                var _a;
                // 1. Find the Level 1 Domain (e.g., Vehicle)
                this.level1Domain = data.find(d => d.slug === this.currentType || d.name.toLowerCase().replace(/ /g, '-') === this.currentType);
                if (this.level1Domain) {
                    // 2. Find the Level 2 Parent within Level 1 (e.g., Sales)
                    this.parentDomain = (_a = this.level1Domain.subdomains) === null || _a === void 0 ? void 0 : _a.find((s) => s.slug === this.currentSubtype || s.name.toLowerCase().replace(/ /g, '-') === this.currentSubtype);
                    // 3. Set the Level 3 subdomains to be displayed
                    if (this.parentDomain) {
                        this.subdomains = (this.parentDomain.subdomains || [])
                            .map((sub) => (Object.assign(Object.assign({}, sub), { image: this.formatImageUrl(sub.image) })))
                            .sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
                    }
                }
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }
    formatImageUrl(imagePath) {
        if (!imagePath)
            return 'assets/images/placeholder.jpg';
        if (imagePath.startsWith('http'))
            return imagePath;
        return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    }
    resolveNavigation(subdomain) {
        // Level 3 items lead directly to domains in the product list
        return ['/products', subdomain.slug || 'domain', subdomain.id];
    }
    getDescription(item) {
        return item.desc || item.description || item.name;
    }
}
SubdomainsTwoComponent.ɵfac = function SubdomainsTwoComponent_Factory(t) { return new (t || SubdomainsTwoComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_shared_services_domains_service__WEBPACK_IMPORTED_MODULE_0__.DomainsService)); };
SubdomainsTwoComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: SubdomainsTwoComponent, selectors: [["app-subdomains-two"]], decls: 4, vars: 15, consts: [[3, "breadcrumbs"], ["class", "text-center py-4", 4, "ngIf"], ["class", "text-center py-5", 4, "ngIf"], ["class", "row p-2", 4, "ngIf"], [1, "text-center", "py-4"], ["role", "status", 1, "spinner-border", "text-primary"], [1, "text-center", "py-5"], [1, "text-muted"], ["routerLink", "/domain"], [1, "row", "p-2"], ["class", "col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xs-12 col-12 float-left mb-4", 4, "ngFor", "ngForOf"], [1, "col-xl-3", "col-lg-4", "col-md-4", "col-sm-6", "col-xs-12", "col-12", "float-left", "mb-4"], [1, "card", "domain-cards", "mb-2"], [3, "routerLink"], [1, "card-img-top", "ie-image", 3, "src", "alt"], [1, "card-body"], [1, "card-title", "d-block"], [1, "card-text", "d-block", "font-weight-light"], [1, "btn", "btn-primary", "btn-sm", "align-right", 3, "routerLink"]], template: function SubdomainsTwoComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](0, "app-page-header", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, SubdomainsTwoComponent_div_1_Template, 4, 0, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](2, SubdomainsTwoComponent_div_2_Template, 6, 1, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](3, SubdomainsTwoComponent_div_3_Template, 2, 1, "div", 3);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction3"](11, _c2, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction0"](4, _c0), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction2"](5, _c1, ctx.level1Domain == null ? null : ctx.level1Domain.name, "/" + ctx.currentType), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction2"](8, _c1, ctx.parentDomain == null ? null : ctx.parentDomain.name, "/" + ctx.currentType + "/" + ctx.currentSubtype)));
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.isLoading);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", !ctx.isLoading && !ctx.subdomains.length);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", !ctx.isLoading && ctx.subdomains.length);
    } }, directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_1__.PageHeaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_4__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterLinkWithHref, _angular_common__WEBPACK_IMPORTED_MODULE_4__.NgForOf], styles: [".card-title[_ngcontent-%COMP%] {\n  margin-bottom: 0.75rem !important;\n  font-size: 14px !important;\n}\n\n.card-text[_ngcontent-%COMP%] {\n  font-size: 14px !important;\n  height: 43.5px !important;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 2.2;\n  -webkit-box-orient: vertical;\n}\n\n.card-body[_ngcontent-%COMP%] {\n  min-height: 140px !important;\n  padding: 0.5rem;\n}\n\n.align-right[_ngcontent-%COMP%] {\n  float: right;\n}\n\n.btn-primary[_ngcontent-%COMP%] {\n  color: #04fdff !important;\n  border-color: #222 !important;\n  background-color: #222 !important;\n}\n\n.btn-primary[_ngcontent-%COMP%]:hover {\n  color: #04fdff !important;\n  border-color: #222 !important;\n  background-color: #222 !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YmRvbWFpbnMtdHdvLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQ0ksaUNBQUE7RUFDQSwwQkFBQTtBQUFKOztBQUdBO0VBQ0UsMEJBQUE7RUFDQSx5QkFBQTtFQUNBLGdCQUFBO0VBQ0Esb0JBQUE7RUFDQSx1QkFBQTtFQUNBLDRCQUFBO0FBQUY7O0FBR0E7RUFDSSw0QkFBQTtFQUNBLGVBQUE7QUFBSjs7QUFHQTtFQUNJLFlBQUE7QUFBSjs7QUFHQTtFQUNJLHlCQUFBO0VBQ0EsNkJBQUE7RUFDQSxpQ0FBQTtBQUFKOztBQUdBO0VBQ0kseUJBQUE7RUFDQSw2QkFBQTtFQUNBLGlDQUFBO0FBQUoiLCJmaWxlIjoic3ViZG9tYWlucy10d28uY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzdWJkb21haW5zLW9uZS5jb21wb25lbnQuc2NzcyAmIHN1YmRvbWFpbnMtdHdvLmNvbXBvbmVudC5zY3NzXG4uY2FyZC10aXRsZSB7XG4gICAgbWFyZ2luLWJvdHRvbTogMC43NXJlbSAhaW1wb3J0YW50O1xuICAgIGZvbnQtc2l6ZTogMTRweCAhaW1wb3J0YW50O1xufVxuXG4uY2FyZC10ZXh0IHtcbiAgZm9udC1zaXplOiAxNHB4ICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogNDMuNXB4IWltcG9ydGFudDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgZGlzcGxheTogLXdlYmtpdC1ib3g7XG4gIC13ZWJraXQtbGluZS1jbGFtcDogMi4yO1xuICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xufVxuXG4uY2FyZC1ib2R5IHtcbiAgICBtaW4taGVpZ2h0OiAxNDBweCAhaW1wb3J0YW50O1xuICAgIHBhZGRpbmc6IDAuNXJlbTtcbn1cblxuLmFsaWduLXJpZ2h0IHtcbiAgICBmbG9hdDogcmlnaHQ7XG59XG5cbi5idG4tcHJpbWFyeSB7XG4gICAgY29sb3I6ICMwNGZkZmYgIWltcG9ydGFudDtcbiAgICBib3JkZXItY29sb3I6ICMyMjIgIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjIyICFpbXBvcnRhbnQ7XG59XG5cbi5idG4tcHJpbWFyeTpob3ZlciB7XG4gICAgY29sb3I6ICMwNGZkZmYgIWltcG9ydGFudDtcbiAgICBib3JkZXItY29sb3I6ICMyMjIgIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjIyICFpbXBvcnRhbnQ7XG59Il19 */"] });


/***/ })

}]);
//# sourceMappingURL=src_app_pages_domains_domains_module_ts.js.map