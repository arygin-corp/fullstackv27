"use strict";
(self["webpackChunkgdx"] = self["webpackChunkgdx"] || []).push([["src_app_pages_resources_resources_module_ts"],{

/***/ 34892:
/*!************************************************************************!*\
  !*** ./src/app/@pages/resources/components/layout/layout.component.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LayoutComponent": () => (/* binding */ LayoutComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _tab_layout_tab_layout_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tab-layout/tab-layout.component */ 86084);




const _c0 = function () { return { exact: true }; };
function LayoutComponent_li_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "li", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "a", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const link_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLinkActiveOptions", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](3, _c0));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", link_r1.url);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](link_r1.label);
} }
class LayoutComponent {
    constructor() {
        this.links = [
            { label: 'Resources', url: './' },
            { label: 'Brands', url: './brands' },
            { label: 'Documents', url: './docs' },
            { label: 'Policies', url: './policies' },
            { label: 'Processes', url: './processes' },
            { label: 'Media', url: './media' },
            { label: 'Mind Map', url: './mind-map' }
        ];
    }
}
LayoutComponent.ɵfac = function LayoutComponent_Factory(t) { return new (t || LayoutComponent)(); };
LayoutComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: LayoutComponent, selectors: [["app-layout"]], decls: 13, vars: 1, consts: [[1, "block", "jumbotron", "jumbotron-fluid", 2, "margin-bottom", "16px"], [1, "container-fluid"], [1, "row"], [1, "col-12", "col-lg-12", "d-flex"], [1, "account-nav", "flex-grow-1"], [1, "navbar", "main-navbar", "navbar-expand-lg"], [1, "navbar-brand"], ["href", "#"], ["src", "assets/images/badges/brands/marketplace-resources.svg", "alt", "Resource Library Logo", 2, "width", "100%", "max-width", "300px"], [1, "navbar-nav"], ["class", "nav-item", "routerLinkActive", "account-nav__item--active", 3, "routerLinkActiveOptions", 4, "ngFor", "ngForOf"], ["routerLinkActive", "account-nav__item--active", 1, "nav-item", 3, "routerLinkActiveOptions"], [3, "routerLink"]], template: function LayoutComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "nav", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](7, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "a", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](9, "img", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "ul", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](11, LayoutComponent_li_11_Template, 3, 4, "li", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](12, "app-tab-layout");
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](11);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.links);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf, _angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterLinkActive, _angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterLinkWithHref, _tab_layout_tab_layout_component__WEBPACK_IMPORTED_MODULE_0__.TabLayoutComponent], styles: [".jumbotron[_ngcontent-%COMP%] {\n  background-color: #ededed;\n}\n\n.account-nav[_ngcontent-%COMP%] {\n  border: 0px solid #f0f0f0;\n  border-radius: 0px;\n}\n\n.account-nav__item--active[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: #3d464d;\n  font-weight: 500;\n  border-color: #222;\n}\n\n.header_logo[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: auto;\n}\n\n\n\n.navbar-brand[_ngcontent-%COMP%] {\n  width: 100% !important;\n  max-width: 340px !important;\n}\n\n.main-navbar[_ngcontent-%COMP%] {\n  background-color: #e5e5e5;\n}\n\n.navbar-expand-lg[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%] {\n  flex-direction: row;\n  margin-bottom: -20px;\n}\n\n.navbar-brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 200px;\n  height: auto;\n}\n\n.navbar-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: #7a7a7a;\n  padding: 0px 20px !important;\n  transition: 0.4s;\n}\n\n.navbar-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\n  color: #383838;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxheW91dC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLHlCQUFBO0FBQ0o7O0FBRUE7RUFDSSx5QkFBQTtFQUNBLGtCQUFBO0FBQ0o7O0FBRUE7RUFDSSxjQUFBO0VBQ0EsZ0JBQUE7RUFDQSxrQkFBQTtBQUNKOztBQUVBO0VBQ0ksV0FBQTtFQUNBLFlBQUE7QUFDSjs7QUFFQSxvQkFBQTs7QUFDQTtFQUNJLHNCQUFBO0VBQ0EsMkJBQUE7QUFDSjs7QUFFQTtFQUNJLHlCQUFBO0FBQ0o7O0FBRUE7RUFDSSxtQkFBQTtFQUNBLG9CQUFBO0FBQ0o7O0FBRUE7RUFDSSxZQUFBO0VBQ0EsWUFBQTtBQUNKOztBQUVBO0VBQ0ksZUFBQTtFQUNBLGNBQUE7RUFDQSw0QkFBQTtFQUNBLGdCQUFBO0FBQ0o7O0FBRUE7RUFDSSxjQUFBO0FBQ0oiLCJmaWxlIjoibGF5b3V0LmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmp1bWJvdHJvbiB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2VkZWRlZDtcbn1cblxuLmFjY291bnQtbmF2IHtcbiAgICBib3JkZXI6IDBweCBzb2xpZCAjZjBmMGYwO1xuICAgIGJvcmRlci1yYWRpdXM6IDBweDtcbn1cblxuLmFjY291bnQtbmF2X19pdGVtLS1hY3RpdmUgYSB7XG4gICAgY29sb3I6ICMzZDQ2NGQ7XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICBib3JkZXItY29sb3I6ICMyMjI7XG59XG5cbi5oZWFkZXJfbG9nbyBpbWcge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogYXV0bztcbn1cbiAgXG4vKiBIZWFkZXIgSXRlbSBDc3MgKi9cbi5uYXZiYXItYnJhbmQge1xuICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XG4gICAgbWF4LXdpZHRoOiAzNDBweCAhaW1wb3J0YW50O1xufVxuXG4ubWFpbi1uYXZiYXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNlNWU1ZTU7XG59XG5cbi5uYXZiYXItZXhwYW5kLWxnIC5uYXZiYXItbmF2IHtcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgIG1hcmdpbi1ib3R0b206IC0yMHB4O1xufVxuXG4ubmF2YmFyLWJyYW5kIGltZyB7XG4gICAgd2lkdGg6IDIwMHB4O1xuICAgIGhlaWdodDogYXV0bztcbn1cblxuLm5hdmJhci1uYXYgbGkgYSB7XG4gICAgZm9udC1zaXplOiAxNHB4O1xuICAgIGNvbG9yOiAjN2E3YTdhO1xuICAgIHBhZGRpbmc6IDBweCAyMHB4ICFpbXBvcnRhbnQ7XG4gICAgdHJhbnNpdGlvbjogMC40cztcbn1cblxuLm5hdmJhci1uYXYgbGkgYTpob3ZlciB7XG4gICAgY29sb3I6ICMzODM4Mzg7XG59Il19 */"] });


/***/ }),

/***/ 86084:
/*!********************************************************************************!*\
  !*** ./src/app/@pages/resources/components/tab-layout/tab-layout.component.ts ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TabLayoutComponent": () => (/* binding */ TabLayoutComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ 52816);



const _c0 = function () { return { exact: true }; };
function TabLayoutComponent_li_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "li", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "a", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const link_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLinkActiveOptions", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](3, _c0));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", link_r1.url);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](link_r1.label);
} }
class TabLayoutComponent {
    constructor() {
        this.links = [
            { label: 'Resources', url: './' },
            { label: 'Brands', url: './brands' },
            { label: 'Documents', url: './docs' },
            { label: 'Policies', url: './policies' },
            { label: 'Processes', url: './processes' },
            { label: 'Media', url: './media' },
            { label: 'Mind Map', url: './mind-map' },
        ];
    }
    ngOnInit() {
    }
}
TabLayoutComponent.ɵfac = function TabLayoutComponent_Factory(t) { return new (t || TabLayoutComponent)(); };
TabLayoutComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: TabLayoutComponent, selectors: [["app-tab-layout"]], decls: 10, vars: 1, consts: [[1, "container-fluid"], [1, "row"], [1, "col-12", "col-lg-2", "d-flex"], [1, "account-nav", "flex-grow-1"], [1, "account-nav__title"], ["class", "account-nav__item", "routerLinkActive", "account-nav__item--active", 3, "routerLinkActiveOptions", 4, "ngFor", "ngForOf"], [1, "col-12", "col-lg-10", "mt-4", "mt-lg-0"], ["routerLinkActive", "account-nav__item--active", 1, "account-nav__item", 3, "routerLinkActiveOptions"], [3, "routerLink"]], template: function TabLayoutComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "h4", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, "Navigation");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "ul");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](7, TabLayoutComponent_li_7_Template, 3, 4, "li", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](9, "router-outlet");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.links);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_1__.NgForOf, _angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterLinkActive, _angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterLinkWithHref, _angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterOutlet], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ0YWItbGF5b3V0LmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 90754:
/*!*********************************************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-brands-post-details/pages-brands-post-details.component.ts ***!
  \*********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesBrandsPostDetailsComponent": () => (/* binding */ PagesBrandsPostDetailsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);

class PagesBrandsPostDetailsComponent {
    constructor() { }
    ngOnInit() {
    }
}
PagesBrandsPostDetailsComponent.ɵfac = function PagesBrandsPostDetailsComponent_Factory(t) { return new (t || PagesBrandsPostDetailsComponent)(); };
PagesBrandsPostDetailsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesBrandsPostDetailsComponent, selectors: [["app-pages-brands-post-details"]], decls: 2, vars: 0, template: function PagesBrandsPostDetailsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "pages-brands-post-details works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlcy1icmFuZHMtcG9zdC1kZXRhaWxzLmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 79635:
/*!*******************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-brands/pages-brands.component.ts ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesBrandsComponent": () => (/* binding */ PagesBrandsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ 52816);


class PagesBrandsComponent {
    constructor() { }
    ngOnInit() {
    }
}
PagesBrandsComponent.ɵfac = function PagesBrandsComponent_Factory(t) { return new (t || PagesBrandsComponent)(); };
PagesBrandsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesBrandsComponent, selectors: [["app-pages-brands"]], decls: 293, vars: 0, consts: [[1, "container-fluid"], [1, "col-xl-12", "col-lg-12", "col-md-12", "col-sm-12", "col-xs-12", "col-12", "d-flex"], [1, "card", "col-xl-3", "col-lg-3", "col-md-3", "col-sm-6", "col-xs-12", "col-12", "d-flex", 2, "padding", "14px", "border", "0px"], [2, "background-color", "#363636", "padding", "12px", "border-radius", "8px"], ["src", "assets/images/resources/brands/fullstack-logo-light.svg"], [1, "card-body"], [1, "card-title", 2, "font-size", "14px", "font-weight", "bold"], [1, "card-text", 2, "font-size", "12px"], [1, "btn", "btn-primary", "btn-sm", "align-right", 3, "routerLink"], [2, "padding", "12px", "border-radius", "8px"], ["src", "assets/images/resources/brands/fullstack-logo-dark.svg"], ["src", "assets/images/resources/brands/long-logo-light.svg"], ["src", "assets/images/resources/brands/long-logo-dark.svg"], ["src", "assets/images/resources/icon-display/icon-logo-light.svg"], ["src", "assets/images/resources/icon-display/icon-logo-dark.svg"], ["src", "assets/images/resources/brands/onetech-logo-light.svg"], ["src", "assets/images/resources/brands/onetech-logo-dark.svg"], ["src", "assets/images/resources/icon-display/de-icon.svg"], ["src", "assets/images/resources/brands/de-logo-dark.svg"], ["src", "assets/images/resources/brands/de-logo-light.svg"]], template: function PagesBrandsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](4, "img", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](7, "Data Marketplace Full Stack Light");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](12, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](13, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](15, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](16, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](17, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](19, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](20, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](21, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](22, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](23, "Data Marketplace Full Stack Light is intended for use on dark backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](24, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](25, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](26, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](27, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](28, "img", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](29, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](30, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](31, "Data Marketplace Full Stack Dark");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](32, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](33, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](34, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](35, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](36, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](37, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](38, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](39, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](40, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](41, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](42, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](43, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](44, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](45, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](46, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](47, "Data Marketplace Full Stack Dark is intended for use on light backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](48, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](49, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](50, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](51, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](52, "img", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](53, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](54, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](55, "Data Marketplace Full Stack Light");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](56, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](57, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](58, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](59, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](60, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](61, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](62, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](63, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](64, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](65, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](66, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](67, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](68, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](69, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](70, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](71, "Data Marketplace Full Stack Light is intended for use on dark backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](72, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](73, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](74, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](75, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](76, "img", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](77, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](78, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](79, "Data Marketplace Full Stack Dark");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](80, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](81, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](82, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](83, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](84, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](85, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](86, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](87, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](88, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](89, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](90, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](91, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](92, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](93, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](94, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](95, "Data Marketplace Full Stack Dark is intended for use on light backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](96, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](97, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](98, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](99, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](100, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](101, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](102, "img", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](103, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](104, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](105, "Data Marketplace Icon Light");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](106, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](107, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](108, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](109, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](110, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](111, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](112, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](113, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](114, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](115, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](116, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](117, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](118, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](119, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](120, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](121, "Data Marketplace Icon Light is intended for use on dark backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](122, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](123, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](124, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](125, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](126, "img", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](127, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](128, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](129, "Data Marketplace Icon Dark");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](130, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](131, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](132, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](133, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](134, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](135, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](136, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](137, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](138, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](139, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](140, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](141, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](142, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](143, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](144, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](145, "Data Marketplace Icon Dark is intended for use on light backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](146, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](147, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](148, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](149, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](150, "img", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](151, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](152, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](153, "OneTech Logo Light");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](154, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](155, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](156, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](157, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](158, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](159, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](160, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](161, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](162, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](163, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](164, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](165, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](166, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](167, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](168, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](169, "OneTech Logo Light is intended for use on dark backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](170, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](171, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](172, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](173, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](174, "img", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](175, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](176, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](177, "OneTech Logo Dark");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](178, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](179, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](180, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](181, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](182, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](183, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](184, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](185, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](186, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](187, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](188, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](189, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](190, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](191, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](192, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](193, "OneTech Logo Dark is intended for use on light backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](194, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](195, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](196, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](197, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](198, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](199, "img", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](200, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](201, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](202, "Data Enablement Icon Dark");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](203, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](204, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](205, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](206, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](207, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](208, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](209, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](210, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](211, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](212, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](213, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](214, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](215, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](216, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](217, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](218, "Data Enablement Icon is intended for use on dark backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](219, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](220, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](221, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](222, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](223, "img", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](224, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](225, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](226, "Data Enablement Icon Light");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](227, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](228, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](229, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](230, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](231, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](232, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](233, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](234, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](235, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](236, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](237, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](238, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](239, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](240, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](241, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](242, "Data Enablement Icon is intended for use on light backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](243, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](244, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](245, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](246, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](247, "img", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](248, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](249, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](250, "Data Enablement Logo Light");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](251, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](252, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](253, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](254, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](255, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](256, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](257, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](258, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](259, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](260, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](261, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](262, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](263, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](264, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](265, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](266, "OneTech Logo Light is intended for use on dark backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](267, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](268, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](269, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](270, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](271, "img", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](272, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](273, "h5", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](274, "Data Enablement Logo Dark");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](275, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](276, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](277, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](278, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](279, "Size: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](280, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](281, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](282, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](283, "File Format: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](284, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](285, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](286, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](287, "Description: ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](288, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](289, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](290, "OneTech Logo Dark is intended for use on light backgrounds.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](291, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](292, "Download");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, directives: [_angular_router__WEBPACK_IMPORTED_MODULE_1__.RouterLinkWithHref], styles: [".container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%] {\n  margin: 1em;\n}\n\n.container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   .card-img-top[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 2;\n  width: 302px;\n  height: 222px;\n  transform: translateY(52%);\n  transition: 0.5s;\n}\n\n.container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   .card-body[_ngcontent-%COMP%] {\n  z-index: 1;\n  box-sizing: border-box;\n  padding: 1.25em;\n  height: 0px;\n  background: white;\n  box-shadow: 0 2.8px 2.2px rgba(0, 0, 0, 0.056), 0 6.7px 5.3px rgba(0, 0, 0, 0.081), 0 12.5px 10px rgba(0, 0, 0, 0.1), 0 22.3px 17.9px rgba(0, 0, 0, 0.119), 0 41.8px 33.4px rgba(0, 0, 0, 0.144), 0 100px 80px rgba(0, 0, 0, 0.2);\n  transform: translateY(-50%);\n  transition: 0.5s;\n}\n\n.container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   .card-body[_ngcontent-%COMP%]   .card-title[_ngcontent-%COMP%] {\n  margin: 0 0 0.25em 0;\n  font-size: 0.5em;\n  font-weight: bold;\n  line-height: 1.2;\n}\n\n.card-title[_ngcontent-%COMP%] {\n  margin-bottom: 0.25rem !important;\n}\n\n.container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   .card-body[_ngcontent-%COMP%]   .card-text[_ngcontent-%COMP%] {\n  margin: 0 0 0.25em 0;\n}\n\n.container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   .card-body[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  padding: 0.375em 0.75em;\n  color: black;\n  text-decoration: none;\n  line-height: 1.5;\n  border: 1px solid black;\n  border-radius: 0.25em;\n  transition: 0.5s;\n}\n\n.container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   .card-body[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:hover {\n  color: white;\n  background: black;\n}\n\n.container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]:hover   .card-img-top[_ngcontent-%COMP%] {\n  transform: translateY(2%);\n}\n\n.container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]:hover   .card-body[_ngcontent-%COMP%] {\n  transform: translateY(0);\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2VzLWJyYW5kcy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLFdBQUE7QUFDRjs7QUFDQztFQUNDLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLFlBQUE7RUFDQSxhQUFBO0VBQ0EsMEJBQUE7RUFDQSxnQkFBQTtBQUVGOztBQUFDO0VBQ0MsVUFBQTtFQUNBLHNCQUFBO0VBQ0EsZUFBQTtFQUNBLFdBQUE7RUFDQSxpQkFBQTtFQUNBLGlPQUFBO0VBQ0EsMkJBQUE7RUFDQSxnQkFBQTtBQUdGOztBQURDO0VBQ0Msb0JBQUE7RUFDQSxnQkFBQTtFQUNBLGlCQUFBO0VBQ0EsZ0JBQUE7QUFJRjs7QUFEQTtFQUNJLGlDQUFBO0FBSUo7O0FBREE7RUFDQyxvQkFBQTtBQUlEOztBQURDO0VBQ0MsdUJBQUE7RUFDQSxZQUFBO0VBQ0EscUJBQUE7RUFDQSxnQkFBQTtFQUNBLHVCQUFBO0VBQ0EscUJBQUE7RUFDQSxnQkFBQTtBQUlGOztBQUZDO0VBQ0MsWUFBQTtFQUNBLGlCQUFBO0FBS0Y7O0FBSEM7RUFDQyx5QkFBQTtBQU1GOztBQUpDO0VBQ0Msd0JBQUE7QUFPRiIsImZpbGUiOiJwYWdlcy1icmFuZHMuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuY29udGFpbmVyIC5jYXJkIHtcblx0IG1hcmdpbjogMWVtO1xufVxuIC5jb250YWluZXIgLmNhcmQgLmNhcmQtaW1nLXRvcCB7XG5cdCBwb3NpdGlvbjogcmVsYXRpdmU7XG5cdCB6LWluZGV4OiAyO1xuXHQgd2lkdGg6IDMwMnB4O1xuXHQgaGVpZ2h0OiAyMjJweDtcblx0IHRyYW5zZm9ybTogdHJhbnNsYXRlWSg1MiUpO1xuXHQgdHJhbnNpdGlvbjogMC41cztcbn1cbiAuY29udGFpbmVyIC5jYXJkIC5jYXJkLWJvZHkge1xuXHQgei1pbmRleDogMTtcblx0IGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG5cdCBwYWRkaW5nOiAxLjI1ZW07XG5cdCBoZWlnaHQ6IDBweDtcblx0IGJhY2tncm91bmQ6IHdoaXRlO1xuXHQgYm94LXNoYWRvdzogMCAyLjhweCAyLjJweCByZ2JhKDAsIDAsIDAsIDAuMDU2KSwgMCA2LjdweCA1LjNweCByZ2JhKDAsIDAsIDAsIDAuMDgxKSwgMCAxMi41cHggMTBweCByZ2JhKDAsIDAsIDAsIDAuMSksIDAgMjIuM3B4IDE3LjlweCByZ2JhKDAsIDAsIDAsIDAuMTE5KSwgMCA0MS44cHggMzMuNHB4IHJnYmEoMCwgMCwgMCwgMC4xNDQpLCAwIDEwMHB4IDgwcHggcmdiYSgwLCAwLCAwLCAwLjIpO1xuXHQgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpO1xuXHQgdHJhbnNpdGlvbjogMC41cztcbn1cbiAuY29udGFpbmVyIC5jYXJkIC5jYXJkLWJvZHkgLmNhcmQtdGl0bGUge1xuXHQgbWFyZ2luOiAwIDAgMC4yNWVtIDA7XG5cdCBmb250LXNpemU6IDAuNTBlbTtcblx0IGZvbnQtd2VpZ2h0OiBib2xkO1xuXHQgbGluZS1oZWlnaHQ6IDEuMjtcbn1cblxuLmNhcmQtdGl0bGUge1xuICAgIG1hcmdpbi1ib3R0b206IDAuMjVyZW0gIWltcG9ydGFudDtcbn1cblxuLmNvbnRhaW5lciAuY2FyZCAuY2FyZC1ib2R5IC5jYXJkLXRleHQge1xuXHRtYXJnaW46IDAgMCAwLjI1ZW0gMDtcbn1cblxuIC5jb250YWluZXIgLmNhcmQgLmNhcmQtYm9keSAuYnRuIHtcblx0IHBhZGRpbmc6IDAuMzc1ZW0gMC43NWVtO1xuXHQgY29sb3I6IGJsYWNrO1xuXHQgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuXHQgbGluZS1oZWlnaHQ6IDEuNTtcblx0IGJvcmRlcjogMXB4IHNvbGlkIGJsYWNrO1xuXHQgYm9yZGVyLXJhZGl1czogMC4yNWVtO1xuXHQgdHJhbnNpdGlvbjogMC41cztcbn1cbiAuY29udGFpbmVyIC5jYXJkIC5jYXJkLWJvZHkgLmJ0bjpob3ZlciB7XG5cdCBjb2xvcjogd2hpdGU7XG5cdCBiYWNrZ3JvdW5kOiBibGFjaztcbn1cbiAuY29udGFpbmVyIC5jYXJkOmhvdmVyIC5jYXJkLWltZy10b3Age1xuXHQgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDIlKTtcbn1cbiAuY29udGFpbmVyIC5jYXJkOmhvdmVyIC5jYXJkLWJvZHkge1xuXHQgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xufVxuIl19 */"] });


/***/ }),

/***/ 57135:
/*!***************************************************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-documents-post-details/pages-documents-post-details.component.ts ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesDocumentsPostDetailsComponent": () => (/* binding */ PagesDocumentsPostDetailsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);

class PagesDocumentsPostDetailsComponent {
    constructor() { }
    ngOnInit() {
    }
}
PagesDocumentsPostDetailsComponent.ɵfac = function PagesDocumentsPostDetailsComponent_Factory(t) { return new (t || PagesDocumentsPostDetailsComponent)(); };
PagesDocumentsPostDetailsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesDocumentsPostDetailsComponent, selectors: [["app-pages-documents-post-details"]], decls: 2, vars: 0, template: function PagesDocumentsPostDetailsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "pages-documents-post-details works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlcy1kb2N1bWVudHMtcG9zdC1kZXRhaWxzLmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 20711:
/*!***********************************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-documents-post/pages-documents-post.component.ts ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesDocumentsPostComponent": () => (/* binding */ PagesDocumentsPostComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 36362);



function PagesDocumentsPostComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("deferLoad", function PagesDocumentsPostComponent_div_1_Template_div_deferLoad_0_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r3); const docs_r1 = restoredCtx.$implicit; return docs_r1.show = true; });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "img", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "h5", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "p", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "p", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](13, "Size: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](15, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](16, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](17, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](18, "File Format: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](20, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](21, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](22, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](23, "Description: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](24, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](25, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](26);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](27, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](28, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](29, "Platform: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](30, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](31, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](32, "img", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](33, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](34, "a", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](35, "View");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](36, "a", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](37, "Download");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](38, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const docs_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("src", docs_r1.imageUrl, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](docs_r1.heading);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](docs_r1.classification);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](docs_r1.size);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](docs_r1.format);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](docs_r1.details);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("src", docs_r1.icon, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate2"]("href", "", docs_r1.linkUrl, "", docs_r1.slug, "", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("download", docs_r1.downloadUrl);
} }
class PagesDocumentsPostComponent {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    ngOnInit() {
        this.httpClient.get("assets/resources/json/docs/doc.json").subscribe(data => {
            this.jsonDocs = data;
        });
    }
}
PagesDocumentsPostComponent.ɵfac = function PagesDocumentsPostComponent_Factory(t) { return new (t || PagesDocumentsPostComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpClient)); };
PagesDocumentsPostComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesDocumentsPostComponent, selectors: [["app-pages-documents-post"]], decls: 2, vars: 1, consts: [[1, "container-fluid"], ["class", "col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 col-12", 3, "deferLoad", 4, "ngFor", "ngForOf"], [1, "col-xl-12", "col-lg-12", "col-md-12", "col-sm-12", "col-xs-12", "col-12", 3, "deferLoad"], [1, "card", "col-xl-3", "col-lg-4", "col-md-4", "col-sm-6", "col-xs-12", "col-12", 2, "padding", "14px", "border", "0px", "float", "left"], [2, "padding", "12px", "border-radius", "4px"], [2, "width", "100%", "max-width", "175px", 3, "src"], [1, "card-body"], [1, "card-title", 2, "font-size", "14px", "font-weight", "bold", "margin-bottom", "4px"], [1, "customDocBadge"], [1, "card-text", 2, "font-size", "12px"], [2, "width", "100%", "max-width", "40px", 3, "src"], [1, "btn", "btn-dark", "btn-sm", "align-right", 2, "margin-right", "12px", "margin-right", "12px", "width", "100%", "max-width", "110px", 3, "href"], ["href", "", "download", "", 1, "btn", "btn-primary", "btn-sm", "align-right", 3, "download"]], template: function PagesDocumentsPostComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, PagesDocumentsPostComponent_div_1_Template, 39, 10, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.jsonDocs);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf], styles: [".badge[_ngcontent-%COMP%] {\n  border-radius: 1.5px !important;\n  font-weight: 500 !important;\n  padding: 0.25em 0.5em !important;\n}\n\n.customDocBadge[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 80px;\n  background-color: #cc3333 !important;\n  border-radius: 4px !important;\n  padding: 0px 10px !important;\n  margin-bottom: 8px !important;\n  color: #fff !important;\n  font-size: 12px !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2VzLWRvY3VtZW50cy1wb3N0LmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksK0JBQUE7RUFDQSwyQkFBQTtFQUNBLGdDQUFBO0FBQ0o7O0FBRUE7RUFDSSxXQUFBO0VBQ0EsZUFBQTtFQUNBLG9DQUFBO0VBQ0EsNkJBQUE7RUFDQSw0QkFBQTtFQUNBLDZCQUFBO0VBQ0Esc0JBQUE7RUFDQSwwQkFBQTtBQUNKIiwiZmlsZSI6InBhZ2VzLWRvY3VtZW50cy1wb3N0LmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmJhZGdlIHtcbiAgICBib3JkZXItcmFkaXVzOiAxLjVweCAhaW1wb3J0YW50O1xuICAgIGZvbnQtd2VpZ2h0OiA1MDAgIWltcG9ydGFudDtcbiAgICBwYWRkaW5nOiAwLjI1ZW0gMC41ZW0gIWltcG9ydGFudDtcbn1cblxuLmN1c3RvbURvY0JhZGdlIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtYXgtd2lkdGg6IDgwcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2NjMzMzMyAhaW1wb3J0YW50OyBcbiAgICBib3JkZXItcmFkaXVzOiA0cHggIWltcG9ydGFudDsgXG4gICAgcGFkZGluZzogMHB4IDEwcHggIWltcG9ydGFudDsgXG4gICAgbWFyZ2luLWJvdHRvbTogOHB4ICFpbXBvcnRhbnQ7IFxuICAgIGNvbG9yOiAjZmZmICFpbXBvcnRhbnQ7IFxuICAgIGZvbnQtc2l6ZTogMTJweCAhaW1wb3J0YW50O1xufSJdfQ== */"] });


/***/ }),

/***/ 31104:
/*!*******************************************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-media-post-details/pages-media-post-details.component.ts ***!
  \*******************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesMediaPostDetailsComponent": () => (/* binding */ PagesMediaPostDetailsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);

class PagesMediaPostDetailsComponent {
    constructor() { }
    ngOnInit() {
    }
}
PagesMediaPostDetailsComponent.ɵfac = function PagesMediaPostDetailsComponent_Factory(t) { return new (t || PagesMediaPostDetailsComponent)(); };
PagesMediaPostDetailsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesMediaPostDetailsComponent, selectors: [["app-pages-media-post-details"]], decls: 2, vars: 0, template: function PagesMediaPostDetailsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "pages-media-post-details works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlcy1tZWRpYS1wb3N0LWRldGFpbHMuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ 34074:
/*!***************************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-media-post/pages-media-post.component.ts ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesMediaPostComponent": () => (/* binding */ PagesMediaPostComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 36362);



const _c0 = ["videoPlayer"];
function PagesMediaPostComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("deferLoad", function PagesMediaPostComponent_div_1_Template_div_deferLoad_0_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r3); const media_r1 = restoredCtx.$implicit; return media_r1.show = true; });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "video", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](4, "source", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](5, "source", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](8, "img", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "h5", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "p", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](15, "Size: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](17, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](19, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](20, "File Format: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](21);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](22, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](23, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](24, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](25, "Date: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](26);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](27, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](28, "a", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](29, "Download");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](30, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const media_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("id", media_r1.slug);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("poster", media_r1.imageUrl, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("src", media_r1.mp4Url, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("src", media_r1.webmUrl, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("src", media_r1.icon, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](media_r1.heading);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](media_r1.size);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](media_r1.format);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](media_r1.date);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("download", media_r1.downloadUrl);
} }
class PagesMediaPostComponent {
    constructor(httpClient) {
        this.httpClient = httpClient;
        this.isPlay = false;
    }
    toggleVideo(event) {
        this.videoplayer.nativeElement.play();
    }
    ngOnInit() {
        this.httpClient.get("assets/resources/json/media/media.json").subscribe(data => {
            this.jsonMedia = data;
        });
    }
}
PagesMediaPostComponent.ɵfac = function PagesMediaPostComponent_Factory(t) { return new (t || PagesMediaPostComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpClient)); };
PagesMediaPostComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesMediaPostComponent, selectors: [["app-pages-media-post"]], viewQuery: function PagesMediaPostComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵviewQuery"](_c0, 5);
    } if (rf & 2) {
        let _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵloadQuery"]()) && (ctx.videoplayer = _t.first);
    } }, decls: 2, vars: 1, consts: [[1, "container-fluid"], ["class", "col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 col-12", 3, "deferLoad", 4, "ngFor", "ngForOf"], [1, "col-xl-12", "col-lg-12", "col-md-12", "col-sm-12", "col-xs-12", "col-12", 3, "deferLoad"], [1, "card", "col-xl-3", "col-lg-4", "col-md-4", "col-sm-6", "col-xs-12", "col-12", 2, "padding", "14px", "border", "0px", "float", "left"], [2, "padding", "12px", "border-radius", "4px"], ["width", "100%", "height", "auto", "controls", "", "preload", "none", "data-setup", "{ \"aspectRatio\":\"640:267\", \"playbackRates\": [1, 1.5, 2] }", 1, "video-js", "vjs-default-skin", 3, "id", "poster"], ["type", "video/mp4", 3, "src"], ["type", "video/webm", 3, "src"], [1, "card-body"], [1, "mb-2", 2, "width", "100%", "max-width", "40px", 3, "src"], [1, "card-title", 2, "font-size", "14px", "font-weight", "bold", "margin-bottom", "4px"], [1, "card-text", 2, "font-size", "12px"], ["href", "", "download", "", 1, "btn", "btn-primary", "btn-sm", "align-right", 3, "download"]], template: function PagesMediaPostComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, PagesMediaPostComponent_div_1_Template, 31, 10, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.jsonMedia);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlcy1tZWRpYS1wb3N0LmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 13493:
/*!***********************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-mind-map/pages-mind-map.component.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesMindMapComponent": () => (/* binding */ PagesMindMapComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);

class PagesMindMapComponent {
    constructor() { }
    ngOnInit() {
    }
}
PagesMindMapComponent.ɵfac = function PagesMindMapComponent_Factory(t) { return new (t || PagesMindMapComponent)(); };
PagesMindMapComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesMindMapComponent, selectors: [["app-pages-mind-map"]], decls: 2, vars: 0, consts: [["id", "pdfContainer", 2, "height", "1000px !important"], ["data", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtrustConstantResourceUrl"] `assets/docs/protected/Mind_Map.pdf`, "type", "application/pdf", "width", "100%", "height", "100%"]], template: function PagesMindMapComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "object", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlcy1taW5kLW1hcC5jb21wb25lbnQuc2NzcyJ9 */"] });


/***/ }),

/***/ 23581:
/*!***************************************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-policies-details/pages-policies-details.component.ts ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesPoliciesDetailsComponent": () => (/* binding */ PagesPoliciesDetailsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);

class PagesPoliciesDetailsComponent {
    constructor() { }
    ngOnInit() {
    }
}
PagesPoliciesDetailsComponent.ɵfac = function PagesPoliciesDetailsComponent_Factory(t) { return new (t || PagesPoliciesDetailsComponent)(); };
PagesPoliciesDetailsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesPoliciesDetailsComponent, selectors: [["app-pages-policies-details"]], decls: 2, vars: 0, template: function PagesPoliciesDetailsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "pages-policies-details works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlcy1wb2xpY2llcy1kZXRhaWxzLmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 70138:
/*!***********************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-policies/pages-policies.component.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesPoliciesComponent": () => (/* binding */ PagesPoliciesComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 36362);



function PagesPoliciesComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("deferLoad", function PagesPoliciesComponent_div_1_Template_div_deferLoad_0_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r3); const policy_r1 = restoredCtx.$implicit; return policy_r1.show = true; });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "img", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "h5", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "p", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "p", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](13, "URL: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](15, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](16, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](17, "a", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](18, "View");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](19, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const policy_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("src", policy_r1.imageUrl, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](policy_r1.heading);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](policy_r1.classification);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](policy_r1.format);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("href", policy_r1.linkUrl, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
} }
class PagesPoliciesComponent {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    ngOnInit() {
        this.httpClient.get("assets/resources/json/docs/policies.json").subscribe(data => {
            this.jsonPolicies = data;
        });
    }
}
PagesPoliciesComponent.ɵfac = function PagesPoliciesComponent_Factory(t) { return new (t || PagesPoliciesComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpClient)); };
PagesPoliciesComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesPoliciesComponent, selectors: [["app-pages-policies"]], decls: 2, vars: 1, consts: [[1, "container-fluid"], ["class", "col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 col-12", 3, "deferLoad", 4, "ngFor", "ngForOf"], [1, "col-xl-12", "col-lg-12", "col-md-12", "col-sm-12", "col-xs-12", "col-12", 3, "deferLoad"], [1, "card", "col-xl-3", "col-lg-4", "col-md-4", "col-sm-6", "col-xs-12", "col-12", 2, "padding", "14px", "border", "0px", "float", "left"], [2, "padding", "12px", "border-radius", "4px"], [2, "width", "100%", "max-width", "175px", 3, "src"], [1, "card-body"], [1, "card-title", 2, "font-size", "14px", "font-weight", "bold", "margin-bottom", "4px"], [1, "customDocBadge"], [1, "card-text", 2, "font-size", "12px"], ["target", "_blank", 1, "btn", "btn-dark", "btn-sm", "align-right", 2, "margin-right", "12px", "margin-right", "12px", "width", "100%", "max-width", "110px", 3, "href"]], template: function PagesPoliciesComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, PagesPoliciesComponent_div_1_Template, 20, 5, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.jsonPolicies);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf], styles: [".badge[_ngcontent-%COMP%] {\n  border-radius: 1.5px !important;\n  font-weight: 500 !important;\n  padding: 0.25em 0.5em !important;\n}\n\n.customDocBadge[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 80px;\n  background-color: #cc3333 !important;\n  border-radius: 4px !important;\n  padding: 0px 10px !important;\n  margin-bottom: 8px !important;\n  color: #fff !important;\n  font-size: 12px !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2VzLXBvbGljaWVzLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksK0JBQUE7RUFDQSwyQkFBQTtFQUNBLGdDQUFBO0FBQ0o7O0FBRUE7RUFDSSxXQUFBO0VBQ0EsZUFBQTtFQUNBLG9DQUFBO0VBQ0EsNkJBQUE7RUFDQSw0QkFBQTtFQUNBLDZCQUFBO0VBQ0Esc0JBQUE7RUFDQSwwQkFBQTtBQUNKIiwiZmlsZSI6InBhZ2VzLXBvbGljaWVzLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmJhZGdlIHtcbiAgICBib3JkZXItcmFkaXVzOiAxLjVweCAhaW1wb3J0YW50O1xuICAgIGZvbnQtd2VpZ2h0OiA1MDAgIWltcG9ydGFudDtcbiAgICBwYWRkaW5nOiAwLjI1ZW0gMC41ZW0gIWltcG9ydGFudDtcbn1cblxuLmN1c3RvbURvY0JhZGdlIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtYXgtd2lkdGg6IDgwcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2NjMzMzMyAhaW1wb3J0YW50OyBcbiAgICBib3JkZXItcmFkaXVzOiA0cHggIWltcG9ydGFudDsgXG4gICAgcGFkZGluZzogMHB4IDEwcHggIWltcG9ydGFudDsgXG4gICAgbWFyZ2luLWJvdHRvbTogOHB4ICFpbXBvcnRhbnQ7IFxuICAgIGNvbG9yOiAjZmZmICFpbXBvcnRhbnQ7IFxuICAgIGZvbnQtc2l6ZTogMTJweCAhaW1wb3J0YW50O1xufSJdfQ== */"] });


/***/ }),

/***/ 44429:
/*!*****************************************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-processes-details/pages-processes-details.component.ts ***!
  \*****************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesProcessesDetailsComponent": () => (/* binding */ PagesProcessesDetailsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);

class PagesProcessesDetailsComponent {
    constructor() { }
    ngOnInit() {
    }
}
PagesProcessesDetailsComponent.ɵfac = function PagesProcessesDetailsComponent_Factory(t) { return new (t || PagesProcessesDetailsComponent)(); };
PagesProcessesDetailsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesProcessesDetailsComponent, selectors: [["app-pages-processes-details"]], decls: 2, vars: 0, template: function PagesProcessesDetailsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "pages-processes-details works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlcy1wcm9jZXNzZXMtZGV0YWlscy5jb21wb25lbnQuc2NzcyJ9 */"] });


/***/ }),

/***/ 91431:
/*!*************************************************************************************!*\
  !*** ./src/app/@pages/resources/pages/pages-processes/pages-processes.component.ts ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesProcessesComponent": () => (/* binding */ PagesProcessesComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 36362);



function PagesProcessesComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("deferLoad", function PagesProcessesComponent_div_1_Template_div_deferLoad_0_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r3); const process_r1 = restoredCtx.$implicit; return process_r1.show = true; });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "img", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "h5", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "p", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "p", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](13, "Size: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](15, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](16, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](17, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](18, "File Format: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](20, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](21, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](22, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](23, "Description: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](24, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](25, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](26);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](27, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](28, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](29, "Platform: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](30, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](31, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](32, "img", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](33, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](34, "a", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](35, "View");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](36, "a", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](37, "Download");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](38, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const process_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("src", process_r1.imageUrl, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](process_r1.heading);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](process_r1.classification);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](process_r1.size);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](process_r1.format);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](process_r1.details);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("src", process_r1.icon, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate2"]("href", "", process_r1.linkUrl, "", process_r1.slug, "", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("download", process_r1.downloadUrl);
} }
class PagesProcessesComponent {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    ngOnInit() {
        this.httpClient.get("assets/resources/json/docs/processes.json").subscribe(data => {
            this.jsonProcesses = data;
        });
    }
}
PagesProcessesComponent.ɵfac = function PagesProcessesComponent_Factory(t) { return new (t || PagesProcessesComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpClient)); };
PagesProcessesComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagesProcessesComponent, selectors: [["app-pages-processes"]], decls: 2, vars: 1, consts: [[1, "container-fluid"], ["class", "col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 col-12", 3, "deferLoad", 4, "ngFor", "ngForOf"], [1, "col-xl-12", "col-lg-12", "col-md-12", "col-sm-12", "col-xs-12", "col-12", 3, "deferLoad"], [1, "card", "col-xl-3", "col-lg-4", "col-md-4", "col-sm-6", "col-xs-12", "col-12", 2, "padding", "14px", "border", "0px", "float", "left"], [2, "padding", "12px", "border-radius", "4px"], [2, "width", "100%", "max-width", "175px", 3, "src"], [1, "card-body"], [1, "card-title", 2, "font-size", "14px", "font-weight", "bold", "margin-bottom", "4px"], [1, "customDocBadge"], [1, "card-text", 2, "font-size", "12px"], [2, "width", "100%", "max-width", "40px", 3, "src"], [1, "btn", "btn-dark", "btn-sm", "align-right", 2, "margin-right", "12px", "margin-right", "12px", "width", "100%", "max-width", "110px", 3, "href"], ["href", "", "download", "", 1, "btn", "btn-primary", "btn-sm", "align-right", 3, "download"]], template: function PagesProcessesComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, PagesProcessesComponent_div_1_Template, 39, 10, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.jsonProcesses);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf], styles: [".badge[_ngcontent-%COMP%] {\n  border-radius: 1.5px !important;\n  font-weight: 500 !important;\n  padding: 0.25em 0.5em !important;\n}\n\n.customDocBadge[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 80px;\n  background-color: #cc3333 !important;\n  border-radius: 4px !important;\n  padding: 0px 10px !important;\n  margin-bottom: 8px !important;\n  color: #fff !important;\n  font-size: 12px !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2VzLXByb2Nlc3Nlcy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLCtCQUFBO0VBQ0EsMkJBQUE7RUFDQSxnQ0FBQTtBQUNKOztBQUVBO0VBQ0ksV0FBQTtFQUNBLGVBQUE7RUFDQSxvQ0FBQTtFQUNBLDZCQUFBO0VBQ0EsNEJBQUE7RUFDQSw2QkFBQTtFQUNBLHNCQUFBO0VBQ0EsMEJBQUE7QUFDSiIsImZpbGUiOiJwYWdlcy1wcm9jZXNzZXMuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuYmFkZ2Uge1xuICAgIGJvcmRlci1yYWRpdXM6IDEuNXB4ICFpbXBvcnRhbnQ7XG4gICAgZm9udC13ZWlnaHQ6IDUwMCAhaW1wb3J0YW50O1xuICAgIHBhZGRpbmc6IDAuMjVlbSAwLjVlbSAhaW1wb3J0YW50O1xufVxuXG4uY3VzdG9tRG9jQmFkZ2Uge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIG1heC13aWR0aDogODBweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2MzMzMzICFpbXBvcnRhbnQ7IFxuICAgIGJvcmRlci1yYWRpdXM6IDRweCAhaW1wb3J0YW50OyBcbiAgICBwYWRkaW5nOiAwcHggMTBweCAhaW1wb3J0YW50OyBcbiAgICBtYXJnaW4tYm90dG9tOiA4cHggIWltcG9ydGFudDsgXG4gICAgY29sb3I6ICNmZmYgIWltcG9ydGFudDsgXG4gICAgZm9udC1zaXplOiAxMnB4ICFpbXBvcnRhbnQ7XG59Il19 */"] });


/***/ }),

/***/ 83497:
/*!**************************************************************!*\
  !*** ./src/app/@pages/resources/resources-routing.module.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ResourcesRoutingModule": () => (/* binding */ ResourcesRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _components_layout_layout_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/layout/layout.component */ 34892);
/* harmony import */ var _resources_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resources.component */ 80668);
/* harmony import */ var _pages_pages_media_post_pages_media_post_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/pages-media-post/pages-media-post.component */ 34074);
/* harmony import */ var _pages_pages_media_post_details_pages_media_post_details_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/pages-media-post-details/pages-media-post-details.component */ 31104);
/* harmony import */ var _pages_pages_documents_post_pages_documents_post_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/pages-documents-post/pages-documents-post.component */ 20711);
/* harmony import */ var _pages_pages_documents_post_details_pages_documents_post_details_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages/pages-documents-post-details/pages-documents-post-details.component */ 57135);
/* harmony import */ var _pages_pages_brands_pages_brands_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pages/pages-brands/pages-brands.component */ 79635);
/* harmony import */ var _pages_pages_brands_post_details_pages_brands_post_details_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pages/pages-brands-post-details/pages-brands-post-details.component */ 90754);
/* harmony import */ var _pages_pages_policies_pages_policies_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./pages/pages-policies/pages-policies.component */ 70138);
/* harmony import */ var _pages_pages_policies_details_pages_policies_details_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./pages/pages-policies-details/pages-policies-details.component */ 23581);
/* harmony import */ var _pages_pages_processes_pages_processes_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./pages/pages-processes/pages-processes.component */ 91431);
/* harmony import */ var _pages_pages_processes_details_pages_processes_details_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./pages/pages-processes-details/pages-processes-details.component */ 44429);
/* harmony import */ var _pages_pages_mind_map_pages_mind_map_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./pages/pages-mind-map/pages-mind-map.component */ 13493);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/core */ 3184);
















const routes = [
    {
        path: '',
        component: _components_layout_layout_component__WEBPACK_IMPORTED_MODULE_0__.LayoutComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'home'
            },
            {
                path: '',
                component: _resources_component__WEBPACK_IMPORTED_MODULE_1__.ResourcesComponent
            },
            {
                path: 'brands',
                component: _pages_pages_brands_pages_brands_component__WEBPACK_IMPORTED_MODULE_6__.PagesBrandsComponent
            },
            {
                path: 'brands/details/:id',
                component: _pages_pages_brands_post_details_pages_brands_post_details_component__WEBPACK_IMPORTED_MODULE_7__.PagesBrandsPostDetailsComponent
            },
            {
                path: 'docs',
                component: _pages_pages_documents_post_pages_documents_post_component__WEBPACK_IMPORTED_MODULE_4__.PagesDocumentsPostComponent
            },
            {
                path: 'docs/details/:id',
                component: _pages_pages_documents_post_details_pages_documents_post_details_component__WEBPACK_IMPORTED_MODULE_5__.PagesDocumentsPostDetailsComponent
            },
            {
                path: 'policies',
                component: _pages_pages_policies_pages_policies_component__WEBPACK_IMPORTED_MODULE_8__.PagesPoliciesComponent
            },
            {
                path: 'policies/details/:id',
                component: _pages_pages_policies_details_pages_policies_details_component__WEBPACK_IMPORTED_MODULE_9__.PagesPoliciesDetailsComponent
            },
            {
                path: 'processes',
                component: _pages_pages_processes_pages_processes_component__WEBPACK_IMPORTED_MODULE_10__.PagesProcessesComponent
            },
            {
                path: 'processes/details/:id',
                component: _pages_pages_processes_details_pages_processes_details_component__WEBPACK_IMPORTED_MODULE_11__.PagesProcessesDetailsComponent
            },
            {
                path: 'media',
                component: _pages_pages_media_post_pages_media_post_component__WEBPACK_IMPORTED_MODULE_2__.PagesMediaPostComponent
            },
            {
                path: 'media/details/:id',
                component: _pages_pages_media_post_details_pages_media_post_details_component__WEBPACK_IMPORTED_MODULE_3__.PagesMediaPostDetailsComponent
            },
            {
                path: 'mind-map',
                component: _pages_pages_mind_map_pages_mind_map_component__WEBPACK_IMPORTED_MODULE_12__.PagesMindMapComponent
            },
        ]
    }
];
class ResourcesRoutingModule {
}
ResourcesRoutingModule.ɵfac = function ResourcesRoutingModule_Factory(t) { return new (t || ResourcesRoutingModule)(); };
ResourcesRoutingModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_13__["ɵɵdefineNgModule"]({ type: ResourcesRoutingModule });
ResourcesRoutingModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_13__["ɵɵdefineInjector"]({ imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule.forChild(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_13__["ɵɵsetNgModuleScope"](ResourcesRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_14__.RouterModule] }); })();


/***/ }),

/***/ 80668:
/*!*********************************************************!*\
  !*** ./src/app/@pages/resources/resources.component.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ResourcesComponent": () => (/* binding */ ResourcesComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);

class ResourcesComponent {
    constructor() { }
    ngOnInit() {
    }
}
ResourcesComponent.ɵfac = function ResourcesComponent_Factory(t) { return new (t || ResourcesComponent)(); };
ResourcesComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: ResourcesComponent, selectors: [["app-resources"]], decls: 5, vars: 0, consts: [["src", "../../../assets/resources/resource_bg.jpg", "alt", "resource banner", 1, "resource-banner"]], template: function ResourcesComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "img", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "h4");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "Resource Library");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4, "The Data Marketplace resource library serves as a centralized hub for various assets essential to effective data management and utilization. It includes a wide range of documents, policies, and processes that guide users in navigating the complexities of data governance. Additionally, the library features brand images and media files that enhance the visual presence of the marketplace. A mind map is also provided to facilitate a clear understanding of the interconnections among different resources, making it easier for users to find relevant information quickly. Overall, the library is designed to support users in maximizing the value of data in their operations.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: [".resource-banner[_ngcontent-%COMP%] {\n  width: 100%;\n  margin: 0px 0px 12px 0px;\n  border-radius: 12px;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc291cmNlcy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLFdBQUE7RUFDQSx3QkFBQTtFQUNBLG1CQUFBO0FBQ0oiLCJmaWxlIjoicmVzb3VyY2VzLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLnJlc291cmNlLWJhbm5lciB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgbWFyZ2luOiAwcHggMHB4IDEycHggMHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XG59Il19 */"] });


/***/ }),

/***/ 1710:
/*!******************************************************!*\
  !*** ./src/app/@pages/resources/resources.module.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ResourcesModule": () => (/* binding */ ResourcesModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _resources_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./resources-routing.module */ 83497);
/* harmony import */ var _resources_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resources.component */ 80668);
/* harmony import */ var _components_layout_layout_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/layout/layout.component */ 34892);
/* harmony import */ var _components_tab_layout_tab_layout_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/tab-layout/tab-layout.component */ 86084);
/* harmony import */ var _pages_pages_media_post_pages_media_post_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/pages-media-post/pages-media-post.component */ 34074);
/* harmony import */ var _pages_pages_media_post_details_pages_media_post_details_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages/pages-media-post-details/pages-media-post-details.component */ 31104);
/* harmony import */ var _pages_pages_documents_post_pages_documents_post_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pages/pages-documents-post/pages-documents-post.component */ 20711);
/* harmony import */ var _pages_pages_documents_post_details_pages_documents_post_details_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pages/pages-documents-post-details/pages-documents-post-details.component */ 57135);
/* harmony import */ var _pages_pages_brands_post_details_pages_brands_post_details_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./pages/pages-brands-post-details/pages-brands-post-details.component */ 90754);
/* harmony import */ var _pages_pages_brands_pages_brands_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./pages/pages-brands/pages-brands.component */ 79635);
/* harmony import */ var _pages_pages_policies_details_pages_policies_details_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./pages/pages-policies-details/pages-policies-details.component */ 23581);
/* harmony import */ var _pages_pages_policies_pages_policies_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./pages/pages-policies/pages-policies.component */ 70138);
/* harmony import */ var _pages_pages_processes_pages_processes_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./pages/pages-processes/pages-processes.component */ 91431);
/* harmony import */ var _pages_pages_processes_details_pages_processes_details_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./pages/pages-processes-details/pages-processes-details.component */ 44429);
/* harmony import */ var _pages_pages_mind_map_pages_mind_map_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./pages/pages-mind-map/pages-mind-map.component */ 13493);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/core */ 3184);

















class ResourcesModule {
}
ResourcesModule.ɵfac = function ResourcesModule_Factory(t) { return new (t || ResourcesModule)(); };
ResourcesModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_15__["ɵɵdefineNgModule"]({ type: ResourcesModule });
ResourcesModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_15__["ɵɵdefineInjector"]({ imports: [[
            _angular_common__WEBPACK_IMPORTED_MODULE_16__.CommonModule,
            _resources_routing_module__WEBPACK_IMPORTED_MODULE_0__.ResourcesRoutingModule,
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_15__["ɵɵsetNgModuleScope"](ResourcesModule, { declarations: [_resources_component__WEBPACK_IMPORTED_MODULE_1__.ResourcesComponent,
        _components_layout_layout_component__WEBPACK_IMPORTED_MODULE_2__.LayoutComponent,
        _components_tab_layout_tab_layout_component__WEBPACK_IMPORTED_MODULE_3__.TabLayoutComponent,
        _pages_pages_media_post_pages_media_post_component__WEBPACK_IMPORTED_MODULE_4__.PagesMediaPostComponent,
        _pages_pages_media_post_details_pages_media_post_details_component__WEBPACK_IMPORTED_MODULE_5__.PagesMediaPostDetailsComponent,
        _pages_pages_documents_post_pages_documents_post_component__WEBPACK_IMPORTED_MODULE_6__.PagesDocumentsPostComponent,
        _pages_pages_documents_post_details_pages_documents_post_details_component__WEBPACK_IMPORTED_MODULE_7__.PagesDocumentsPostDetailsComponent,
        _pages_pages_brands_post_details_pages_brands_post_details_component__WEBPACK_IMPORTED_MODULE_8__.PagesBrandsPostDetailsComponent,
        _pages_pages_brands_pages_brands_component__WEBPACK_IMPORTED_MODULE_9__.PagesBrandsComponent,
        _pages_pages_policies_details_pages_policies_details_component__WEBPACK_IMPORTED_MODULE_10__.PagesPoliciesDetailsComponent,
        _pages_pages_policies_pages_policies_component__WEBPACK_IMPORTED_MODULE_11__.PagesPoliciesComponent,
        _pages_pages_processes_pages_processes_component__WEBPACK_IMPORTED_MODULE_12__.PagesProcessesComponent,
        _pages_pages_processes_details_pages_processes_details_component__WEBPACK_IMPORTED_MODULE_13__.PagesProcessesDetailsComponent,
        _pages_pages_mind_map_pages_mind_map_component__WEBPACK_IMPORTED_MODULE_14__.PagesMindMapComponent], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_16__.CommonModule,
        _resources_routing_module__WEBPACK_IMPORTED_MODULE_0__.ResourcesRoutingModule], exports: [_resources_component__WEBPACK_IMPORTED_MODULE_1__.ResourcesComponent,
        _components_layout_layout_component__WEBPACK_IMPORTED_MODULE_2__.LayoutComponent,
        _components_tab_layout_tab_layout_component__WEBPACK_IMPORTED_MODULE_3__.TabLayoutComponent,
        _pages_pages_media_post_pages_media_post_component__WEBPACK_IMPORTED_MODULE_4__.PagesMediaPostComponent,
        _pages_pages_media_post_details_pages_media_post_details_component__WEBPACK_IMPORTED_MODULE_5__.PagesMediaPostDetailsComponent,
        _pages_pages_documents_post_pages_documents_post_component__WEBPACK_IMPORTED_MODULE_6__.PagesDocumentsPostComponent,
        _pages_pages_documents_post_details_pages_documents_post_details_component__WEBPACK_IMPORTED_MODULE_7__.PagesDocumentsPostDetailsComponent,
        _pages_pages_brands_post_details_pages_brands_post_details_component__WEBPACK_IMPORTED_MODULE_8__.PagesBrandsPostDetailsComponent,
        _pages_pages_brands_pages_brands_component__WEBPACK_IMPORTED_MODULE_9__.PagesBrandsComponent,
        _pages_pages_policies_details_pages_policies_details_component__WEBPACK_IMPORTED_MODULE_10__.PagesPoliciesDetailsComponent,
        _pages_pages_policies_pages_policies_component__WEBPACK_IMPORTED_MODULE_11__.PagesPoliciesComponent,
        _pages_pages_processes_pages_processes_component__WEBPACK_IMPORTED_MODULE_12__.PagesProcessesComponent,
        _pages_pages_processes_details_pages_processes_details_component__WEBPACK_IMPORTED_MODULE_13__.PagesProcessesDetailsComponent] }); })();


/***/ })

}]);
//# sourceMappingURL=src_app_pages_resources_resources_module_ts.js.map