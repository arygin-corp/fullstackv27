"use strict";
(self["webpackChunkgdx"] = self["webpackChunkgdx"] || []).push([["src_app_pages_newsroom_newsroom_module_ts"],{

/***/ 93737:
/*!***********************************************************************!*\
  !*** ./src/app/@pages/newsroom/components/layout/layout.component.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LayoutComponent": () => (/* binding */ LayoutComponent)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ 59151);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ 36362);





const _c0 = function (a1) { return ["category", a1]; };
const _c1 = function () { return ["/newsroom"]; };
function LayoutComponent_li_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "li", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "a", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const link_r1 = ctx.$implicit;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("active", ctx_r0.selectedCategory === link_r1.category);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", link_r1.category ? _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction1"](4, _c0, link_r1.category) : _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](6, _c1));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", link_r1.label, " ");
} }
class LayoutComponent {
    constructor(router, route) {
        this.router = router;
        this.route = route;
        this.selectedCategory = '';
        this.links = [
            { label: 'Newsroom', category: '' },
            { label: 'Updates', category: 'updates' },
            { label: 'Features', category: 'features' },
            { label: 'Trending', category: 'trending' },
            { label: 'Security', category: 'security' }
        ];
    }
    ngOnInit() {
        // ✅ Sync active category with current route
        this.routerSub = this.router.events
            .pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.filter)(event => event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_2__.NavigationEnd))
            .subscribe(() => {
            var _a;
            this.selectedCategory = ((_a = this.route.snapshot.firstChild) === null || _a === void 0 ? void 0 : _a.params['category']) || '';
        });
    }
    ngOnDestroy() {
        if (this.routerSub) {
            this.routerSub.unsubscribe();
        }
    }
    setCategory(category) {
        this.selectedCategory = category;
        const path = category ? `/newsroom/${category}` : '/newsroom';
        this.router.navigateByUrl(path);
    }
}
LayoutComponent.ɵfac = function LayoutComponent_Factory(t) { return new (t || LayoutComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__.ActivatedRoute)); };
LayoutComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: LayoutComponent, selectors: [["app-layout"]], decls: 14, vars: 1, consts: [[1, "block", "jumbotron", "jumbotron-fluid"], [1, "container-fluid"], [1, "row"], [1, "col-12", "col-lg-12", "d-flex"], [1, "account-nav", "flex-grow-1"], [1, "navbar", "main-navbar", "navbar-expand-lg"], [1, "navbar-brand"], ["routerLink", "/newsroom"], ["src", "assets/images/badges/brands/marketplace-newsroom.svg", "alt", "Newsroom Logo"], [1, "navbar-nav"], ["class", "nav-item", 3, "active", 4, "ngFor", "ngForOf"], [1, "col-12", "col-lg-12", "mt-4", "mt-lg-0"], [1, "nav-item"], [3, "routerLink"]], template: function LayoutComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "nav", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "a", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](9, "img", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "ul", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, LayoutComponent_li_11_Template, 3, 7, "li", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](13, "router-outlet");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.links);
    } }, directives: [_angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterLinkWithHref, _angular_common__WEBPACK_IMPORTED_MODULE_3__.NgForOf, _angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterOutlet], styles: [".jumbotron[_ngcontent-%COMP%] {\n  background-color: #ededed;\n}\n\n.account-nav[_ngcontent-%COMP%] {\n  border: 0px solid #f0f0f0;\n  border-radius: 0px;\n}\n\n.header_logo[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: auto;\n}\n\n\n\n.navbar-brand[_ngcontent-%COMP%] {\n  width: 100% !important;\n  max-width: 340px !important;\n}\n\n.main-navbar[_ngcontent-%COMP%] {\n  background-color: #e5e5e5;\n}\n\n.navbar-expand-lg[_ngcontent-%COMP%]   .navbar-nav[_ngcontent-%COMP%] {\n  flex-direction: row;\n  margin-bottom: -20px;\n}\n\n.navbar-brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 200px;\n  height: auto;\n}\n\n.navbar-nav[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 20px;\n  list-style: none;\n}\n\n.nav-item[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  cursor: pointer;\n  padding: 8px 12px;\n}\n\n.nav-item.active[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  font-weight: bold;\n  border-bottom: 2px solid #007bff;\n}\n\n.block[_ngcontent-%COMP%] {\n  margin-bottom: 0px !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxheW91dC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLHlCQUFBO0FBQ0o7O0FBRUE7RUFDSSx5QkFBQTtFQUNBLGtCQUFBO0FBQ0o7O0FBUUE7RUFDSSxXQUFBO0VBQ0EsWUFBQTtBQUxKOztBQVFBLG9CQUFBOztBQUNBO0VBQ0ksc0JBQUE7RUFDQSwyQkFBQTtBQUxKOztBQVFBO0VBQ0kseUJBQUE7QUFMSjs7QUFRQTtFQUNJLG1CQUFBO0VBQ0Esb0JBQUE7QUFMSjs7QUFRQTtFQUNJLFlBQUE7RUFDQSxZQUFBO0FBTEo7O0FBbUJBO0VBQ0UsYUFBQTtFQUNBLFNBQUE7RUFDQSxnQkFBQTtBQWhCRjs7QUFtQkE7RUFDRSxlQUFBO0VBQ0EsaUJBQUE7QUFoQkY7O0FBbUJBO0VBQ0UsaUJBQUE7RUFDQSxnQ0FBQTtBQWhCRjs7QUFtQkE7RUFDSSw2QkFBQTtBQWhCSiIsImZpbGUiOiJsYXlvdXQuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuanVtYm90cm9uIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZWRlZGVkO1xufVxuXG4uYWNjb3VudC1uYXYge1xuICAgIGJvcmRlcjogMHB4IHNvbGlkICNmMGYwZjA7XG4gICAgYm9yZGVyLXJhZGl1czogMHB4O1xufVxuXG4vLyAuYWNjb3VudC1uYXZfX2l0ZW0tLWFjdGl2ZSBhIHtcbi8vICAgICBjb2xvcjogIzNkNDY0ZDtcbi8vICAgICBmb250LXdlaWdodDogNTAwO1xuLy8gICAgIGJvcmRlci1jb2xvcjogIzIyMjtcbi8vIH1cblxuLmhlYWRlcl9sb2dvIGltZyB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgaGVpZ2h0OiBhdXRvO1xufVxuICBcbi8qIEhlYWRlciBJdGVtIENzcyAqL1xuLm5hdmJhci1icmFuZCB7XG4gICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcbiAgICBtYXgtd2lkdGg6IDM0MHB4ICFpbXBvcnRhbnQ7XG59XG5cbi5tYWluLW5hdmJhciB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2U1ZTVlNTtcbn1cblxuLm5hdmJhci1leHBhbmQtbGcgLm5hdmJhci1uYXYge1xuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgbWFyZ2luLWJvdHRvbTogLTIwcHg7XG59XG5cbi5uYXZiYXItYnJhbmQgaW1nIHtcbiAgICB3aWR0aDogMjAwcHg7XG4gICAgaGVpZ2h0OiBhdXRvO1xufVxuXG4vLyAubmF2YmFyLW5hdiBsaSBhIHtcbi8vICAgICBmb250LXNpemU6IDE0cHg7XG4vLyAgICAgY29sb3I6ICM3YTdhN2E7XG4vLyAgICAgcGFkZGluZzogMHB4IDIwcHggIWltcG9ydGFudDtcbi8vICAgICB0cmFuc2l0aW9uOiAwLjRzO1xuLy8gfVxuXG4vLyAubmF2YmFyLW5hdiBsaSBhOmhvdmVyIHtcbi8vICAgICBjb2xvcjogIzM4MzgzODtcbi8vIH1cblxuLm5hdmJhci1uYXYge1xuICBkaXNwbGF5OiBmbGV4O1xuICBnYXA6IDIwcHg7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG5cbi5uYXYtaXRlbSBhIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBwYWRkaW5nOiA4cHggMTJweDtcbn1cblxuLm5hdi1pdGVtLmFjdGl2ZSBhIHtcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCAjMDA3YmZmO1xufVxuXG4uYmxvY2sge1xuICAgIG1hcmdpbi1ib3R0b206IDBweCAhaW1wb3J0YW50O1xufSJdfQ== */"] });


/***/ }),

/***/ 69756:
/*!************************************************************!*\
  !*** ./src/app/@pages/newsroom/newsroom-routing.module.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NewsroomRoutingModule": () => (/* binding */ NewsroomRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _components_layout_layout_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/layout/layout.component */ 93737);
/* harmony import */ var _newsroom_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./newsroom.component */ 66353);
/* harmony import */ var _pages_page_post_details_page_post_details_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/page-post-details/page-post-details.component */ 83962);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 3184);






const routes = [
    {
        path: '',
        component: _components_layout_layout_component__WEBPACK_IMPORTED_MODULE_0__.LayoutComponent,
        children: [
            { path: '', component: _newsroom_component__WEBPACK_IMPORTED_MODULE_1__.NewsroomComponent },
            { path: 'category/:category', component: _newsroom_component__WEBPACK_IMPORTED_MODULE_1__.NewsroomComponent },
            { path: 'post/:category/:slug', component: _pages_page_post_details_page_post_details_component__WEBPACK_IMPORTED_MODULE_2__.PagePostDetailsComponent } // /newsroom/post/features/...
        ]
    }
];
class NewsroomRoutingModule {
}
NewsroomRoutingModule.ɵfac = function NewsroomRoutingModule_Factory(t) { return new (t || NewsroomRoutingModule)(); };
NewsroomRoutingModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineNgModule"]({ type: NewsroomRoutingModule });
NewsroomRoutingModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjector"]({ imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterModule.forChild(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterModule] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsetNgModuleScope"](NewsroomRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterModule], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_4__.RouterModule] }); })();


/***/ }),

/***/ 66353:
/*!*******************************************************!*\
  !*** ./src/app/@pages/newsroom/newsroom.component.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NewsroomComponent": () => (/* binding */ NewsroomComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var src_app_shared_services_newsroom_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/@shared/services/newsroom.service */ 55518);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ 36362);




const _c0 = function (a1, a2) { return ["post", a1, a2]; };
function NewsroomComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "img", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "h6");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "a", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](7, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](10, "img", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](11, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](12, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](13, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](15, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](16, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](18, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const post_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", post_r1.image, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"])("alt", post_r1.title);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction2"](9, _c0, post_r1.category, post_r1.slug));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", post_r1.title, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](post_r1.summary);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", post_r1.authorImage, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](post_r1.author);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](post_r1.date);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](post_r1.category);
} }
class NewsroomComponent {
    constructor(newsroomService, route) {
        this.newsroomService = newsroomService;
        this.route = route;
        this.newsroom = [];
        this.filtered = [];
        this.category = '';
    }
    ngOnInit() {
        this.newsroom = this.newsroomService.getNewsroom();
        // ✅ Read category from route params instead of @Input
        this.routeSub = this.route.paramMap.subscribe((params) => {
            this.category = params.get('category') || '';
            this.applyFilter();
        });
    }
    ngOnDestroy() {
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }
    applyFilter() {
        if (!this.category) {
            this.filtered = this.newsroom;
        }
        else {
            this.filtered = this.newsroom.filter(post => post.category === this.category);
        }
    }
}
NewsroomComponent.ɵfac = function NewsroomComponent_Factory(t) { return new (t || NewsroomComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_shared_services_newsroom_service__WEBPACK_IMPORTED_MODULE_0__.NewsroomService), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__.ActivatedRoute)); };
NewsroomComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: NewsroomComponent, selectors: [["app-newsroom"]], decls: 3, vars: 1, consts: [[1, "container-fluid"], [1, "blog-grid"], ["class", "blog-card", 4, "ngFor", "ngForOf"], [1, "blog-card"], [1, "image"], [3, "src", "alt"], [1, "content"], [3, "routerLink"], [1, "meta"], [1, "avatar", 3, "src"], [1, "category"]], template: function NewsroomComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, NewsroomComponent_div_2_Template, 20, 12, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.filtered);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_3__.NgForOf, _angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterLinkWithHref], styles: [".blog-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n  grid-gap: 20px;\n  gap: 20px;\n}\n\n.blog-card[_ngcontent-%COMP%] {\n  background: #fff;\n  border-radius: 10px;\n  overflow: hidden;\n  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n  transition: 0.2s;\n}\n\n.blog-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-5px);\n}\n\n.image[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 180px;\n  object-fit: cover;\n}\n\n.content[_ngcontent-%COMP%] {\n  padding: 15px;\n}\n\n.meta[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-top: 10px;\n}\n\n.avatar[_ngcontent-%COMP%] {\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n}\n\n.category[_ngcontent-%COMP%] {\n  display: inline-block;\n  margin-top: 10px;\n  background: #eee;\n  padding: 5px 10px;\n  font-size: 12px;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5ld3Nyb29tLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsYUFBQTtFQUNBLDREQUFBO0VBQ0EsY0FBQTtFQUFBLFNBQUE7QUFDRjs7QUFFQTtFQUNFLGdCQUFBO0VBQ0EsbUJBQUE7RUFDQSxnQkFBQTtFQUNBLHlDQUFBO0VBQ0EsZ0JBQUE7QUFDRjs7QUFFQTtFQUNFLDJCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxXQUFBO0VBQ0EsYUFBQTtFQUNBLGlCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxhQUFBO0FBQ0Y7O0FBRUE7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxTQUFBO0VBQ0EsZ0JBQUE7QUFDRjs7QUFFQTtFQUNFLFdBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7QUFDRjs7QUFFQTtFQUNFLHFCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQkFBQTtFQUNBLGlCQUFBO0VBQ0EsZUFBQTtBQUNGIiwiZmlsZSI6Im5ld3Nyb29tLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmJsb2ctZ3JpZCB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZmlsbCwgbWlubWF4KDMwMHB4LCAxZnIpKTtcbiAgZ2FwOiAyMHB4O1xufVxuXG4uYmxvZy1jYXJkIHtcbiAgYmFja2dyb3VuZDogI2ZmZjtcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgYm94LXNoYWRvdzogMCAycHggMTBweCByZ2JhKDAsMCwwLDAuMSk7XG4gIHRyYW5zaXRpb246IDAuMnM7XG59XG5cbi5ibG9nLWNhcmQ6aG92ZXIge1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTVweCk7XG59XG5cbi5pbWFnZSBpbWcge1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxODBweDtcbiAgb2JqZWN0LWZpdDogY292ZXI7XG59XG5cbi5jb250ZW50IHtcbiAgcGFkZGluZzogMTVweDtcbn1cblxuLm1ldGEge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDEwcHg7XG4gIG1hcmdpbi10b3A6IDEwcHg7XG59XG5cbi5hdmF0YXIge1xuICB3aWR0aDogMzBweDtcbiAgaGVpZ2h0OiAzMHB4O1xuICBib3JkZXItcmFkaXVzOiA1MCU7XG59XG5cbi5jYXRlZ29yeSB7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgbWFyZ2luLXRvcDogMTBweDtcbiAgYmFja2dyb3VuZDogI2VlZTtcbiAgcGFkZGluZzogNXB4IDEwcHg7XG4gIGZvbnQtc2l6ZTogMTJweDtcbn0iXX0= */"] });


/***/ }),

/***/ 6062:
/*!****************************************************!*\
  !*** ./src/app/@pages/newsroom/newsroom.module.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NewsroomModule": () => (/* binding */ NewsroomModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../@shared/shared.module */ 32234);
/* harmony import */ var _newsroom_routing_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./newsroom-routing.module */ 69756);
/* harmony import */ var _components_layout_layout_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/layout/layout.component */ 93737);
/* harmony import */ var _newsroom_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./newsroom.component */ 66353);
/* harmony import */ var _pages_page_post_details_page_post_details_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/page-post-details/page-post-details.component */ 83962);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 3184);

//modules


//components




class NewsroomModule {
}
NewsroomModule.ɵfac = function NewsroomModule_Factory(t) { return new (t || NewsroomModule)(); };
NewsroomModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineNgModule"]({ type: NewsroomModule });
NewsroomModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjector"]({ imports: [[
            _angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule,
            _newsroom_routing_module__WEBPACK_IMPORTED_MODULE_1__.NewsroomRoutingModule,
            _shared_shared_module__WEBPACK_IMPORTED_MODULE_0__.SharedModule
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsetNgModuleScope"](NewsroomModule, { declarations: [_components_layout_layout_component__WEBPACK_IMPORTED_MODULE_2__.LayoutComponent,
        _newsroom_component__WEBPACK_IMPORTED_MODULE_3__.NewsroomComponent,
        _pages_page_post_details_page_post_details_component__WEBPACK_IMPORTED_MODULE_4__.PagePostDetailsComponent], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule,
        _newsroom_routing_module__WEBPACK_IMPORTED_MODULE_1__.NewsroomRoutingModule,
        _shared_shared_module__WEBPACK_IMPORTED_MODULE_0__.SharedModule], exports: [_components_layout_layout_component__WEBPACK_IMPORTED_MODULE_2__.LayoutComponent,
        _newsroom_component__WEBPACK_IMPORTED_MODULE_3__.NewsroomComponent,
        _pages_page_post_details_page_post_details_component__WEBPACK_IMPORTED_MODULE_4__.PagePostDetailsComponent] }); })();


/***/ }),

/***/ 83962:
/*!****************************************************************************************!*\
  !*** ./src/app/@pages/newsroom/pages/page-post-details/page-post-details.component.ts ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagePostDetailsComponent": () => (/* binding */ PagePostDetailsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var src_app_shared_services_newsroom_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/@shared/services/newsroom.service */ 55518);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ 36362);




function PagePostDetailsComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "img", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "a", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "svg", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](7, "path", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8, " Back to Newsroom ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](11, "titlecase");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](12, "h1", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](14, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](15, "img", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](16, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](17, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](19, "span", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", ctx_r0.post.image, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"])("alt", ctx_r0.post.title);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](11, 8, ctx_r0.post.category));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx_r0.post.title);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", ctx_r0.post.authorImage, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"])("alt", ctx_r0.post.author);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx_r0.post.author);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx_r0.post.date);
} }
function PagePostDetailsComponent_div_2_span_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "span", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const tag_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("#", tag_r4, "");
} }
const _c0 = function (a0) { return [a0]; };
function PagePostDetailsComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "p", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](4, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](7, PagePostDetailsComponent_div_2_span_7_Template, 2, 1, "span", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "a", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "svg", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](10, "path", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](11, " Back to Newsroom ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx_r1.post.summary);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("innerHTML", ctx_r1.post.content, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeHtml"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](3, _c0, ctx_r1.post.category));
} }
function PagePostDetailsComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "svg", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "path", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "h2");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, "Post Not Found");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7, "The article you're looking for doesn't exist or has been removed.");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "a", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9, "Return to Newsroom");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
class PagePostDetailsComponent {
    constructor(route, newsroomService) {
        this.route = route;
        this.newsroomService = newsroomService;
    }
    ngOnInit() {
        const slug = this.route.snapshot.paramMap.get('slug');
        if (slug) {
            this.post = this.newsroomService.getNewsroomBySlug(slug);
        }
        // ✅ Optional: debug
        console.log('Slug:', slug);
        console.log('Post found:', this.post);
    }
}
PagePostDetailsComponent.ɵfac = function PagePostDetailsComponent_Factory(t) { return new (t || PagePostDetailsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_shared_services_newsroom_service__WEBPACK_IMPORTED_MODULE_0__.NewsroomService)); };
PagePostDetailsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: PagePostDetailsComponent, selectors: [["app-page-post-details"]], decls: 4, vars: 3, consts: [[1, "post-detail-page"], ["class", "hero-section", 4, "ngIf"], ["class", "content-section container-fluid", 4, "ngIf"], ["class", "not-found container-fluid", 4, "ngIf"], [1, "hero-section"], [1, "hero-image-wrapper"], [1, "hero-image", 3, "src", "alt"], [1, "hero-overlay"], [1, "hero-content", "container-fluid"], ["routerLink", "/newsroom", 1, "back-link"], ["width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], ["d", "M19 12H5M12 19l-7-7 7-7"], [1, "category-badge"], [1, "post-title"], [1, "author-bar"], [1, "author-avatar", 3, "src", "alt"], [1, "author-info"], [1, "author-name"], [1, "post-date"], [1, "content-section", "container-fluid"], [1, "content-wrapper"], [1, "summary"], [1, "post-body", 3, "innerHTML"], [1, "post-footer"], [1, "tags"], ["class", "tag", 4, "ngFor", "ngForOf"], ["routerLink", "/newsroom", 1, "back-to-top"], ["width", "16", "height", "16", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "2"], [1, "tag"], [1, "not-found", "container-fluid"], [1, "not-found-content"], ["width", "64", "height", "64", "viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "1.5"], ["d", "M9.172 16.172a4 4 0 015.656 0M9 12h.01M15 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], ["routerLink", "/newsroom", 1, "btn-primary"]], template: function PagePostDetailsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, PagePostDetailsComponent_div_1_Template, 21, 10, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, PagePostDetailsComponent_div_2_Template, 12, 5, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, PagePostDetailsComponent_div_3_Template, 10, 0, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.post);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.post);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", !ctx.post);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_3__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterLinkWithHref, _angular_common__WEBPACK_IMPORTED_MODULE_3__.NgForOf], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_3__.TitleCasePipe], styles: [".post-detail-page[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  background: #f8f9fa;\n}\n\n.hero-section[_ngcontent-%COMP%] {\n  position: relative;\n  width: 100%;\n  min-height: 500px;\n  display: flex;\n  align-items: flex-end;\n  overflow: hidden;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-image-wrapper[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  z-index: 0;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-image-wrapper[_ngcontent-%COMP%]   .hero-image[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  filter: brightness(0.6);\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-image-wrapper[_ngcontent-%COMP%]   .hero-overlay[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.85) 100%);\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1;\n  padding: 60px 40px 50px;\n  max-width: 1200px;\n  margin: 0 auto;\n  width: 100%;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .back-link[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  color: rgba(255, 255, 255, 0.8);\n  text-decoration: none;\n  font-size: 14px;\n  font-weight: 500;\n  margin-bottom: 24px;\n  transition: all 0.2s ease;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .back-link[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  transition: transform 0.2s ease;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .back-link[_ngcontent-%COMP%]:hover {\n  color: #fff;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .back-link[_ngcontent-%COMP%]:hover   svg[_ngcontent-%COMP%] {\n  transform: translateX(-4px);\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .category-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 6px 16px;\n  background: rgba(255, 255, 255, 0.15);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 20px;\n  color: #fff;\n  font-size: 12px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n  margin-bottom: 16px;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .post-title[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: clamp(2rem, 5vw, 3.5rem);\n  font-weight: 800;\n  line-height: 1.15;\n  margin: 0 0 24px;\n  max-width: 900px;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .author-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .author-bar[_ngcontent-%COMP%]   .author-avatar[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 2px solid rgba(255, 255, 255, 0.3);\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .author-bar[_ngcontent-%COMP%]   .author-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .author-bar[_ngcontent-%COMP%]   .author-info[_ngcontent-%COMP%]   .author-name[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 15px;\n  font-weight: 600;\n}\n\n.hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .author-bar[_ngcontent-%COMP%]   .author-info[_ngcontent-%COMP%]   .post-date[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 13px;\n}\n\n.content-section[_ngcontent-%COMP%] {\n  padding: 50px 40px;\n  max-width: 1200px;\n  margin: 0 auto;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%] {\n  max-width: 800px;\n  margin: 0 auto;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  line-height: 1.7;\n  color: #4a5568;\n  font-weight: 400;\n  margin: 0 0 40px;\n  padding-bottom: 30px;\n  border-bottom: 2px solid #e2e8f0;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n  line-height: 1.85;\n  color: #2d3748;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     p {\n  margin: 0 0 1.5rem;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     h2, .content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     h3, .content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     h4 {\n  color: #1a202c;\n  margin: 2.5rem 0 1rem;\n  font-weight: 700;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     h2 {\n  font-size: 1.75rem;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     h3 {\n  font-size: 1.4rem;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     ul, .content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     ol {\n  margin: 0 0 1.5rem;\n  padding-left: 1.5rem;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     ul li, .content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     ol li {\n  margin-bottom: 0.5rem;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     a {\n  color: #3182ce;\n  text-decoration: none;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     a:hover {\n  text-decoration: underline;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     img {\n  max-width: 100%;\n  border-radius: 12px;\n  margin: 2rem 0;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     blockquote {\n  border-left: 4px solid #3182ce;\n  padding-left: 1.5rem;\n  margin: 2rem 0;\n  color: #4a5568;\n  font-style: italic;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     code {\n  background: #edf2f7;\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-size: 0.9em;\n  color: #e53e3e;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     pre {\n  background: #1a202c;\n  color: #e2e8f0;\n  padding: 1.5rem;\n  border-radius: 12px;\n  overflow-x: auto;\n  margin: 2rem 0;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-body[_ngcontent-%COMP%]     pre code {\n  background: none;\n  color: inherit;\n  padding: 0;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-footer[_ngcontent-%COMP%] {\n  margin-top: 60px;\n  padding-top: 30px;\n  border-top: 2px solid #e2e8f0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 20px;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-footer[_ngcontent-%COMP%]   .tags[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-footer[_ngcontent-%COMP%]   .tags[_ngcontent-%COMP%]   .tag[_ngcontent-%COMP%] {\n  padding: 6px 14px;\n  background: #edf2f7;\n  color: #4a5568;\n  border-radius: 20px;\n  font-size: 13px;\n  font-weight: 500;\n  text-transform: lowercase;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-footer[_ngcontent-%COMP%]   .back-to-top[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  color: #4a5568;\n  text-decoration: none;\n  font-size: 14px;\n  font-weight: 500;\n  transition: color 0.2s;\n}\n\n.content-section[_ngcontent-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .post-footer[_ngcontent-%COMP%]   .back-to-top[_ngcontent-%COMP%]:hover {\n  color: #2d3748;\n}\n\n.not-found[_ngcontent-%COMP%] {\n  min-height: 60vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 60px 40px;\n}\n\n.not-found[_ngcontent-%COMP%]   .not-found-content[_ngcontent-%COMP%] {\n  text-align: center;\n  max-width: 400px;\n}\n\n.not-found[_ngcontent-%COMP%]   .not-found-content[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  color: #a0aec0;\n  margin-bottom: 20px;\n}\n\n.not-found[_ngcontent-%COMP%]   .not-found-content[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  font-size: 1.75rem;\n  color: #2d3748;\n  margin: 0 0 8px;\n}\n\n.not-found[_ngcontent-%COMP%]   .not-found-content[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: #718096;\n  margin: 0 0 24px;\n}\n\n.not-found[_ngcontent-%COMP%]   .not-found-content[_ngcontent-%COMP%]   .btn-primary[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 12px 28px;\n  background: #2d3748;\n  color: #fff;\n  text-decoration: none;\n  border-radius: 8px;\n  font-weight: 600;\n  font-size: 14px;\n  transition: background 0.2s;\n}\n\n.not-found[_ngcontent-%COMP%]   .not-found-content[_ngcontent-%COMP%]   .btn-primary[_ngcontent-%COMP%]:hover {\n  background: #1a202c;\n}\n\n@media (max-width: 768px) {\n  .hero-section[_ngcontent-%COMP%] {\n    min-height: 400px;\n  }\n  .hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%] {\n    padding: 40px 20px 30px;\n  }\n  .hero-section[_ngcontent-%COMP%]   .hero-content[_ngcontent-%COMP%]   .post-title[_ngcontent-%COMP%] {\n    font-size: 1.75rem;\n  }\n\n  .content-section[_ngcontent-%COMP%] {\n    padding: 30px 20px;\n  }\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtcG9zdC1kZXRhaWxzLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQ0UsaUJBQUE7RUFDQSxtQkFBQTtBQUFGOztBQUlBO0VBQ0Usa0JBQUE7RUFDQSxXQUFBO0VBQ0EsaUJBQUE7RUFDQSxhQUFBO0VBQ0EscUJBQUE7RUFDQSxnQkFBQTtBQURGOztBQUdFO0VBQ0Usa0JBQUE7RUFDQSxRQUFBO0VBQ0EsVUFBQTtBQURKOztBQUdJO0VBQ0UsV0FBQTtFQUNBLFlBQUE7RUFDQSxpQkFBQTtFQUNBLHVCQUFBO0FBRE47O0FBSUk7RUFDRSxrQkFBQTtFQUNBLFFBQUE7RUFDQSwrR0FBQTtBQUZOOztBQVdFO0VBQ0Usa0JBQUE7RUFDQSxVQUFBO0VBQ0EsdUJBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7RUFDQSxXQUFBO0FBVEo7O0FBV0k7RUFDRSxvQkFBQTtFQUNBLG1CQUFBO0VBQ0EsUUFBQTtFQUNBLCtCQUFBO0VBQ0EscUJBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSxtQkFBQTtFQUNBLHlCQUFBO0FBVE47O0FBV007RUFDRSwrQkFBQTtBQVRSOztBQVlNO0VBQ0UsV0FBQTtBQVZSOztBQVlRO0VBQ0UsMkJBQUE7QUFWVjs7QUFlSTtFQUNFLHFCQUFBO0VBQ0EsaUJBQUE7RUFDQSxxQ0FBQTtFQUNBLDJCQUFBO0VBQ0EsMENBQUE7RUFDQSxtQkFBQTtFQUNBLFdBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSx5QkFBQTtFQUNBLG1CQUFBO0VBQ0EsbUJBQUE7QUFiTjs7QUFnQkk7RUFDRSxXQUFBO0VBQ0EsbUNBQUE7RUFDQSxnQkFBQTtFQUNBLGlCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQkFBQTtBQWROOztBQWlCSTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFNBQUE7QUFmTjs7QUFpQk07RUFDRSxXQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsaUJBQUE7RUFDQSwwQ0FBQTtBQWZSOztBQWtCTTtFQUNFLGFBQUE7RUFDQSxzQkFBQTtFQUNBLFFBQUE7QUFoQlI7O0FBa0JRO0VBQ0UsV0FBQTtFQUNBLGVBQUE7RUFDQSxnQkFBQTtBQWhCVjs7QUFtQlE7RUFDRSwrQkFBQTtFQUNBLGVBQUE7QUFqQlY7O0FBeUJBO0VBQ0Usa0JBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7QUF0QkY7O0FBd0JFO0VBQ0UsZ0JBQUE7RUFDQSxjQUFBO0FBdEJKOztBQXdCSTtFQUNFLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxjQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQkFBQTtFQUNBLG9CQUFBO0VBQ0EsZ0NBQUE7QUF0Qk47O0FBeUJJO0VBQ0UsaUJBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7QUF2Qk47O0FBMEJRO0VBQ0Usa0JBQUE7QUF4QlY7O0FBMkJRO0VBQ0UsY0FBQTtFQUNBLHFCQUFBO0VBQ0EsZ0JBQUE7QUF6QlY7O0FBNEJRO0VBQ0Usa0JBQUE7QUExQlY7O0FBNkJRO0VBQ0UsaUJBQUE7QUEzQlY7O0FBOEJRO0VBQ0Usa0JBQUE7RUFDQSxvQkFBQTtBQTVCVjs7QUE4QlU7RUFDRSxxQkFBQTtBQTVCWjs7QUFnQ1E7RUFDRSxjQUFBO0VBQ0EscUJBQUE7QUE5QlY7O0FBZ0NVO0VBQ0UsMEJBQUE7QUE5Qlo7O0FBa0NRO0VBQ0UsZUFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtBQWhDVjs7QUFtQ1E7RUFDRSw4QkFBQTtFQUNBLG9CQUFBO0VBQ0EsY0FBQTtFQUNBLGNBQUE7RUFDQSxrQkFBQTtBQWpDVjs7QUFvQ1E7RUFDRSxtQkFBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGNBQUE7QUFsQ1Y7O0FBcUNRO0VBQ0UsbUJBQUE7RUFDQSxjQUFBO0VBQ0EsZUFBQTtFQUNBLG1CQUFBO0VBQ0EsZ0JBQUE7RUFDQSxjQUFBO0FBbkNWOztBQXFDVTtFQUNFLGdCQUFBO0VBQ0EsY0FBQTtFQUNBLFVBQUE7QUFuQ1o7O0FBeUNJO0VBQ0UsZ0JBQUE7RUFDQSxpQkFBQTtFQUNBLDZCQUFBO0VBQ0EsYUFBQTtFQUNBLDhCQUFBO0VBQ0EsbUJBQUE7RUFDQSxlQUFBO0VBQ0EsU0FBQTtBQXZDTjs7QUF5Q007RUFDRSxhQUFBO0VBQ0EsU0FBQTtFQUNBLGVBQUE7QUF2Q1I7O0FBeUNRO0VBQ0UsaUJBQUE7RUFDQSxtQkFBQTtFQUNBLGNBQUE7RUFDQSxtQkFBQTtFQUNBLGVBQUE7RUFDQSxnQkFBQTtFQUNBLHlCQUFBO0FBdkNWOztBQTJDTTtFQUNFLG9CQUFBO0VBQ0EsbUJBQUE7RUFDQSxRQUFBO0VBQ0EsY0FBQTtFQUNBLHFCQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0VBQ0Esc0JBQUE7QUF6Q1I7O0FBMkNRO0VBQ0UsY0FBQTtBQXpDVjs7QUFpREE7RUFDRSxnQkFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0VBQ0Esa0JBQUE7QUE5Q0Y7O0FBZ0RFO0VBQ0Usa0JBQUE7RUFDQSxnQkFBQTtBQTlDSjs7QUFnREk7RUFDRSxjQUFBO0VBQ0EsbUJBQUE7QUE5Q047O0FBaURJO0VBQ0Usa0JBQUE7RUFDQSxjQUFBO0VBQ0EsZUFBQTtBQS9DTjs7QUFrREk7RUFDRSxjQUFBO0VBQ0EsZ0JBQUE7QUFoRE47O0FBbURJO0VBQ0UscUJBQUE7RUFDQSxrQkFBQTtFQUNBLG1CQUFBO0VBQ0EsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSwyQkFBQTtBQWpETjs7QUFtRE07RUFDRSxtQkFBQTtBQWpEUjs7QUF3REE7RUFDRTtJQUNFLGlCQUFBO0VBckRGO0VBdURFO0lBQ0UsdUJBQUE7RUFyREo7RUF1REk7SUFDRSxrQkFBQTtFQXJETjs7RUEwREE7SUFDRSxrQkFBQTtFQXZERjtBQUNGIiwiZmlsZSI6InBhZ2UtcG9zdC1kZXRhaWxzLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFnZS1wb3N0LWRldGFpbHMuY29tcG9uZW50LnNjc3Ncbi5wb3N0LWRldGFpbC1wYWdlIHtcbiAgbWluLWhlaWdodDogMTAwdmg7XG4gIGJhY2tncm91bmQ6ICNmOGY5ZmE7XG59XG5cbi8vIEhlcm8gU2VjdGlvblxuLmhlcm8tc2VjdGlvbiB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgd2lkdGg6IDEwMCU7XG4gIG1pbi1oZWlnaHQ6IDUwMHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XG4gIG92ZXJmbG93OiBoaWRkZW47XG5cbiAgLmhlcm8taW1hZ2Utd3JhcHBlciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGluc2V0OiAwO1xuICAgIHotaW5kZXg6IDA7XG5cbiAgICAuaGVyby1pbWFnZSB7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgIG9iamVjdC1maXQ6IGNvdmVyO1xuICAgICAgZmlsdGVyOiBicmlnaHRuZXNzKDAuNik7XG4gICAgfVxuXG4gICAgLmhlcm8tb3ZlcmxheSB7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICBpbnNldDogMDtcbiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudChcbiAgICAgICAgdG8gYm90dG9tLFxuICAgICAgICByZ2JhKDAsIDAsIDAsIDAuMikgMCUsXG4gICAgICAgIHJnYmEoMCwgMCwgMCwgMC41KSA1MCUsXG4gICAgICAgIHJnYmEoMCwgMCwgMCwgMC44NSkgMTAwJVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAuaGVyby1jb250ZW50IHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgei1pbmRleDogMTtcbiAgICBwYWRkaW5nOiA2MHB4IDQwcHggNTBweDtcbiAgICBtYXgtd2lkdGg6IDEyMDBweDtcbiAgICBtYXJnaW46IDAgYXV0bztcbiAgICB3aWR0aDogMTAwJTtcblxuICAgIC5iYWNrLWxpbmsge1xuICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgZ2FwOiA4cHg7XG4gICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjgpO1xuICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgIG1hcmdpbi1ib3R0b206IDI0cHg7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuXG4gICAgICBzdmcge1xuICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4ycyBlYXNlO1xuICAgICAgfVxuXG4gICAgICAmOmhvdmVyIHtcbiAgICAgICAgY29sb3I6ICNmZmY7XG5cbiAgICAgICAgc3ZnIHtcbiAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTRweCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAuY2F0ZWdvcnktYmFkZ2Uge1xuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgcGFkZGluZzogNnB4IDE2cHg7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpO1xuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpO1xuICAgICAgYm9yZGVyLXJhZGl1czogMjBweDtcbiAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICBsZXR0ZXItc3BhY2luZzogMXB4O1xuICAgICAgbWFyZ2luLWJvdHRvbTogMTZweDtcbiAgICB9XG5cbiAgICAucG9zdC10aXRsZSB7XG4gICAgICBjb2xvcjogI2ZmZjtcbiAgICAgIGZvbnQtc2l6ZTogY2xhbXAoMnJlbSwgNXZ3LCAzLjVyZW0pO1xuICAgICAgZm9udC13ZWlnaHQ6IDgwMDtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjE1O1xuICAgICAgbWFyZ2luOiAwIDAgMjRweDtcbiAgICAgIG1heC13aWR0aDogOTAwcHg7XG4gICAgfVxuXG4gICAgLmF1dGhvci1iYXIge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDE0cHg7XG5cbiAgICAgIC5hdXRob3ItYXZhdGFyIHtcbiAgICAgICAgd2lkdGg6IDQ4cHg7XG4gICAgICAgIGhlaWdodDogNDhweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICBvYmplY3QtZml0OiBjb3ZlcjtcbiAgICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xuICAgICAgfVxuXG4gICAgICAuYXV0aG9yLWluZm8ge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBnYXA6IDJweDtcblxuICAgICAgICAuYXV0aG9yLW5hbWUge1xuICAgICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTVweDtcbiAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLnBvc3QtZGF0ZSB7XG4gICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43KTtcbiAgICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gQ29udGVudCBTZWN0aW9uXG4uY29udGVudC1zZWN0aW9uIHtcbiAgcGFkZGluZzogNTBweCA0MHB4O1xuICBtYXgtd2lkdGg6IDEyMDBweDtcbiAgbWFyZ2luOiAwIGF1dG87XG5cbiAgLmNvbnRlbnQtd3JhcHBlciB7XG4gICAgbWF4LXdpZHRoOiA4MDBweDtcbiAgICBtYXJnaW46IDAgYXV0bztcblxuICAgIC5zdW1tYXJ5IHtcbiAgICAgIGZvbnQtc2l6ZTogMS4yNXJlbTtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjc7XG4gICAgICBjb2xvcjogIzRhNTU2ODtcbiAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgICBtYXJnaW46IDAgMCA0MHB4O1xuICAgICAgcGFkZGluZy1ib3R0b206IDMwcHg7XG4gICAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgI2UyZThmMDtcbiAgICB9XG5cbiAgICAucG9zdC1ib2R5IHtcbiAgICAgIGZvbnQtc2l6ZTogMS4xcmVtO1xuICAgICAgbGluZS1oZWlnaHQ6IDEuODU7XG4gICAgICBjb2xvcjogIzJkMzc0ODtcblxuICAgICAgOjpuZy1kZWVwIHtcbiAgICAgICAgcCB7XG4gICAgICAgICAgbWFyZ2luOiAwIDAgMS41cmVtO1xuICAgICAgICB9XG5cbiAgICAgICAgaDIsIGgzLCBoNCB7XG4gICAgICAgICAgY29sb3I6ICMxYTIwMmM7XG4gICAgICAgICAgbWFyZ2luOiAyLjVyZW0gMCAxcmVtO1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgICAgIH1cblxuICAgICAgICBoMiB7XG4gICAgICAgICAgZm9udC1zaXplOiAxLjc1cmVtO1xuICAgICAgICB9XG5cbiAgICAgICAgaDMge1xuICAgICAgICAgIGZvbnQtc2l6ZTogMS40cmVtO1xuICAgICAgICB9XG5cbiAgICAgICAgdWwsIG9sIHtcbiAgICAgICAgICBtYXJnaW46IDAgMCAxLjVyZW07XG4gICAgICAgICAgcGFkZGluZy1sZWZ0OiAxLjVyZW07XG5cbiAgICAgICAgICBsaSB7XG4gICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAwLjVyZW07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYSB7XG4gICAgICAgICAgY29sb3I6ICMzMTgyY2U7XG4gICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuXG4gICAgICAgICAgJjpob3ZlciB7XG4gICAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpbWcge1xuICAgICAgICAgIG1heC13aWR0aDogMTAwJTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICAgICAgICAgIG1hcmdpbjogMnJlbSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgYmxvY2txdW90ZSB7XG4gICAgICAgICAgYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCAjMzE4MmNlO1xuICAgICAgICAgIHBhZGRpbmctbGVmdDogMS41cmVtO1xuICAgICAgICAgIG1hcmdpbjogMnJlbSAwO1xuICAgICAgICAgIGNvbG9yOiAjNGE1NTY4O1xuICAgICAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvZGUge1xuICAgICAgICAgIGJhY2tncm91bmQ6ICNlZGYyZjc7XG4gICAgICAgICAgcGFkZGluZzogMnB4IDhweDtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgICAgICAgZm9udC1zaXplOiAwLjllbTtcbiAgICAgICAgICBjb2xvcjogI2U1M2UzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZSB7XG4gICAgICAgICAgYmFja2dyb3VuZDogIzFhMjAyYztcbiAgICAgICAgICBjb2xvcjogI2UyZThmMDtcbiAgICAgICAgICBwYWRkaW5nOiAxLjVyZW07XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgICAgICAgICBvdmVyZmxvdy14OiBhdXRvO1xuICAgICAgICAgIG1hcmdpbjogMnJlbSAwO1xuXG4gICAgICAgICAgY29kZSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgICAgICAgICAgY29sb3I6IGluaGVyaXQ7XG4gICAgICAgICAgICBwYWRkaW5nOiAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC5wb3N0LWZvb3RlciB7XG4gICAgICBtYXJnaW4tdG9wOiA2MHB4O1xuICAgICAgcGFkZGluZy10b3A6IDMwcHg7XG4gICAgICBib3JkZXItdG9wOiAycHggc29saWQgI2UyZThmMDtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgZmxleC13cmFwOiB3cmFwO1xuICAgICAgZ2FwOiAyMHB4O1xuXG4gICAgICAudGFncyB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGdhcDogMTBweDtcbiAgICAgICAgZmxleC13cmFwOiB3cmFwO1xuXG4gICAgICAgIC50YWcge1xuICAgICAgICAgIHBhZGRpbmc6IDZweCAxNHB4O1xuICAgICAgICAgIGJhY2tncm91bmQ6ICNlZGYyZjc7XG4gICAgICAgICAgY29sb3I6ICM0YTU1Njg7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogMjBweDtcbiAgICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgICAgICB0ZXh0LXRyYW5zZm9ybTogbG93ZXJjYXNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC5iYWNrLXRvLXRvcCB7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBnYXA6IDhweDtcbiAgICAgICAgY29sb3I6ICM0YTU1Njg7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgICB0cmFuc2l0aW9uOiBjb2xvciAwLjJzO1xuXG4gICAgICAgICY6aG92ZXIge1xuICAgICAgICAgIGNvbG9yOiAjMmQzNzQ4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIE5vdCBGb3VuZCBTdGF0ZVxuLm5vdC1mb3VuZCB7XG4gIG1pbi1oZWlnaHQ6IDYwdmg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBwYWRkaW5nOiA2MHB4IDQwcHg7XG5cbiAgLm5vdC1mb3VuZC1jb250ZW50IHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgbWF4LXdpZHRoOiA0MDBweDtcblxuICAgIHN2ZyB7XG4gICAgICBjb2xvcjogI2EwYWVjMDtcbiAgICAgIG1hcmdpbi1ib3R0b206IDIwcHg7XG4gICAgfVxuXG4gICAgaDIge1xuICAgICAgZm9udC1zaXplOiAxLjc1cmVtO1xuICAgICAgY29sb3I6ICMyZDM3NDg7XG4gICAgICBtYXJnaW46IDAgMCA4cHg7XG4gICAgfVxuXG4gICAgcCB7XG4gICAgICBjb2xvcjogIzcxODA5NjtcbiAgICAgIG1hcmdpbjogMCAwIDI0cHg7XG4gICAgfVxuXG4gICAgLmJ0bi1wcmltYXJ5IHtcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgIHBhZGRpbmc6IDEycHggMjhweDtcbiAgICAgIGJhY2tncm91bmQ6ICMyZDM3NDg7XG4gICAgICBjb2xvcjogI2ZmZjtcbiAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMnM7XG5cbiAgICAgICY6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiAjMWEyMDJjO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBSZXNwb25zaXZlXG5AbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgLmhlcm8tc2VjdGlvbiB7XG4gICAgbWluLWhlaWdodDogNDAwcHg7XG5cbiAgICAuaGVyby1jb250ZW50IHtcbiAgICAgIHBhZGRpbmc6IDQwcHggMjBweCAzMHB4O1xuXG4gICAgICAucG9zdC10aXRsZSB7XG4gICAgICAgIGZvbnQtc2l6ZTogMS43NXJlbTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAuY29udGVudC1zZWN0aW9uIHtcbiAgICBwYWRkaW5nOiAzMHB4IDIwcHg7XG4gIH1cbn0iXX0= */"] });


/***/ }),

/***/ 55518:
/*!******************************************************!*\
  !*** ./src/app/@shared/services/newsroom.service.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NewsroomService": () => (/* binding */ NewsroomService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ 84505);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 3184);


class NewsroomService {
    constructor() {
        this.selectedCategorySubject = new rxjs__WEBPACK_IMPORTED_MODULE_0__.BehaviorSubject(null);
        this.selectedCategory$ = this.selectedCategorySubject.asObservable();
        this.rawNewsroom = [
            {
                id: '1',
                title: 'Angular Standalone Components Deep Dive',
                summary: 'Explore how standalone components simplify Angular architecture.',
                content: '<p>Standalone components remove the dependency on NgModules and simplify wiring of dependencies.</p>',
                image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200',
                author: 'John Doe',
                authorImage: 'https://randomuser.me/api/portraits/men/1.jpg',
                date: 'May 2026',
                category: 'features'
            },
            {
                id: '2',
                title: 'Enterprise Angular Scaling Techniques',
                summary: 'Best approaches to scale large Angular apps efficiently.',
                content: '<p>Use lazy loading, clear boundaries and strong typing to scale.</p>',
                image: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1200',
                author: 'Jane Smith',
                authorImage: 'https://randomuser.me/api/portraits/women/2.jpg',
                date: 'May 2026',
                category: 'features'
            },
            {
                id: '3',
                title: 'Angular CLI Updates',
                summary: 'CLI improvements for faster builds.',
                content: '<p>Angular CLI  improves build speed and DX.</p>',
                image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
                author: 'Emma Walker',
                authorImage: 'https://randomuser.me/api/portraits/women/10.jpg',
                date: 'April 2026',
                category: 'updates'
            },
            {
                id: '4',
                title: 'Web Performance API Updates',
                summary: 'Track performance with new browser APIs.',
                content: '<p>New APIs help measure real user metrics more accurately.</p>',
                image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
                author: 'James King',
                authorImage: 'https://randomuser.me/api/portraits/men/13.jpg',
                date: 'March 2026',
                category: 'updates'
            },
            {
                id: '5',
                title: 'AI in Web Development',
                summary: 'AI is transforming developer workflows.',
                content: '<p>AI tools assist with coding, testing and optimization.</p>',
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
                author: 'Lucas Green',
                authorImage: 'https://randomuser.me/api/portraits/men/15.jpg',
                date: 'May 2026',
                category: 'trending'
            },
            {
                id: '6',
                title: 'Jamstack Popularity',
                summary: 'Jamstack improves performance via CDN delivery.',
                content: '<p>Static-first approaches remain popular for fast sites.</p>',
                image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
                author: 'Chloe Evans',
                authorImage: 'https://randomuser.me/api/portraits/women/18.jpg',
                date: 'April 2026',
                category: 'trending'
            },
            {
                id: '7',
                title: 'Angular Security Best Practices',
                summary: 'Secure your Angular applications.',
                content: '<p>Sanitize inputs, use HttpInterceptors for auth and follow OWASP guidance.</p>',
                image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200',
                author: 'Isabella Parker',
                authorImage: 'https://randomuser.me/api/portraits/women/22.jpg',
                date: 'May 2026',
                category: 'security'
            },
            {
                id: '8',
                title: 'JWT Authentication Guide',
                summary: 'Implement token based auth correctly.',
                content: '<p>Store tokens safely and validate on the server.</p>',
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
                author: 'Charlotte Stewart',
                authorImage: 'https://randomuser.me/api/portraits/women/24.jpg',
                date: 'May 2026',
                category: 'security'
            },
            {
                id: '9',
                title: 'New macOS Update',
                summary: 'Implementing new macODS update tonight',
                content: '<p>Run the lasest macOS 26 on you mac.</p>',
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
                author: 'Jane Doe',
                authorImage: 'https://randomuser.me/api/portraits/women/24.jpg',
                date: 'Novermber 2026',
                category: 'update'
            }
        ];
        this.newsroom = this.rawNewsroom.map(item => (Object.assign(Object.assign({}, item), { slug: this.createSlug(item.title) })));
    }
    createSlug(title) {
        return title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').trim();
    }
    setSelectedCategory(cat) {
        this.selectedCategorySubject.next(cat);
    }
    getNewsroom() {
        return [...this.newsroom];
    }
    getNewsroomById(id) {
        return this.newsroom.find(x => x.id === id);
    }
    getNewsroomBySlug(slug) {
        return this.newsroom.find(x => x.slug === slug);
    }
    getByCategory(category) {
        return this.newsroom.filter(x => x.category === category);
    }
    search(query) {
        const q = query.trim().toLowerCase();
        if (!q)
            return this.getNewsroom();
        return this.newsroom.filter(x => x.title.toLowerCase().includes(q) ||
            x.summary.toLowerCase().includes(q) ||
            (x.content && x.content.toLowerCase().includes(q)));
    }
}
NewsroomService.ɵfac = function NewsroomService_Factory(t) { return new (t || NewsroomService)(); };
NewsroomService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: NewsroomService, factory: NewsroomService.ɵfac, providedIn: 'root' });


/***/ })

}]);
//# sourceMappingURL=src_app_pages_newsroom_newsroom_module_ts.js.map