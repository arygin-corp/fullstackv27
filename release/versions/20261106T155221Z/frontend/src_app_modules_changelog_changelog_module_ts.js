"use strict";
(self["webpackChunkgdx"] = self["webpackChunkgdx"] || []).push([["src_app_modules_changelog_changelog_module_ts"],{

/***/ 7976:
/*!****************************************************************!*\
  !*** ./src/app/@modules/changelog/changelog-routing.module.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChangelogRoutingModule": () => (/* binding */ ChangelogRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _pages_page_category_page_category_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pages/page-category/page-category.component */ 43609);
/* harmony import */ var _pages_page_post_page_post_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pages/page-post/page-post.component */ 35518);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);





const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'post'
    },
    {
        path: 'post-list',
        component: _pages_page_category_page_category_component__WEBPACK_IMPORTED_MODULE_0__.PageCategoryComponent,
        data: {
            sidebarPosition: 'end',
            layout: 'list' // one of [classic, grid, list]
        }
    },
    {
        path: 'post',
        component: _pages_page_post_page_post_component__WEBPACK_IMPORTED_MODULE_1__.PagePostComponent,
        data: {
            sidebarPosition: 'end',
            layout: 'classic'
        }
    },
];
class ChangelogRoutingModule {
}
ChangelogRoutingModule.ɵfac = function ChangelogRoutingModule_Factory(t) { return new (t || ChangelogRoutingModule)(); };
ChangelogRoutingModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({ type: ChangelogRoutingModule });
ChangelogRoutingModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjector"]({ imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule.forChild(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsetNgModuleScope"](ChangelogRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule] }); })();


/***/ }),

/***/ 51812:
/*!********************************************************!*\
  !*** ./src/app/@modules/changelog/changelog.module.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChangelogModule": () => (/* binding */ ChangelogModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _changelog_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./changelog-routing.module */ 7976);
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../@shared/shared.module */ 32234);
/* harmony import */ var _widgets_widgets_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../widgets/widgets.module */ 85289);
/* harmony import */ var _components_comments_list_comments_list_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/comments-list/comments-list.component */ 69021);
/* harmony import */ var _components_post_post_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/post/post.component */ 97228);
/* harmony import */ var _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/sidebar/sidebar.component */ 75513);
/* harmony import */ var _pages_page_category_page_category_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pages/page-category/page-category.component */ 43609);
/* harmony import */ var _pages_page_post_page_post_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pages/page-post/page-post.component */ 35518);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ 3184);
// modules (angular)

// modules



// components



// pages



class ChangelogModule {
}
ChangelogModule.ɵfac = function ChangelogModule_Factory(t) { return new (t || ChangelogModule)(); };
ChangelogModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdefineNgModule"]({ type: ChangelogModule });
ChangelogModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdefineInjector"]({ imports: [[
            // modules (angular)
            _angular_common__WEBPACK_IMPORTED_MODULE_9__.CommonModule,
            // modules
            _changelog_routing_module__WEBPACK_IMPORTED_MODULE_0__.ChangelogRoutingModule,
            _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule,
            _widgets_widgets_module__WEBPACK_IMPORTED_MODULE_2__.WidgetsModule
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsetNgModuleScope"](ChangelogModule, { declarations: [
        // components
        _components_comments_list_comments_list_component__WEBPACK_IMPORTED_MODULE_3__.CommentsListComponent,
        _components_post_post_component__WEBPACK_IMPORTED_MODULE_4__.PostComponent,
        _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_5__.SidebarComponent,
        // pages
        _pages_page_category_page_category_component__WEBPACK_IMPORTED_MODULE_6__.PageCategoryComponent,
        _pages_page_post_page_post_component__WEBPACK_IMPORTED_MODULE_7__.PagePostComponent], imports: [
        // modules (angular)
        _angular_common__WEBPACK_IMPORTED_MODULE_9__.CommonModule,
        // modules
        _changelog_routing_module__WEBPACK_IMPORTED_MODULE_0__.ChangelogRoutingModule,
        _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule,
        _widgets_widgets_module__WEBPACK_IMPORTED_MODULE_2__.WidgetsModule] }); })();


/***/ }),

/***/ 69021:
/*!****************************************************************************************!*\
  !*** ./src/app/@modules/changelog/components/comments-list/comments-list.component.ts ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CommentsListComponent": () => (/* binding */ CommentsListComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);

class CommentsListComponent {
    constructor() {
        this.comments = [];
        this.level = 0;
    }
}
CommentsListComponent.ɵfac = function CommentsListComponent_Factory(t) { return new (t || CommentsListComponent)(); };
CommentsListComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: CommentsListComponent, selectors: [["app-comments-list"]], inputs: { comments: "comments", level: "level" }, decls: 0, vars: 0, template: function CommentsListComponent_Template(rf, ctx) { }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjb21tZW50cy1saXN0LmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 97228:
/*!**********************************************************************!*\
  !*** ./src/app/@modules/changelog/components/post/post.component.ts ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PostComponent": () => (/* binding */ PostComponent)
/* harmony export */ });
/* harmony import */ var _data_changelog_posts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../data/changelog-posts */ 15019);
/* harmony import */ var _data_changelog_post_comments__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../data/changelog-post-comments */ 54261);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 36362);





const _c0 = function (a0) { return { "typography--expanded": a0 }; };
class PostComponent {
    constructor() {
        this.layout = 'classic';
        this.posts = _data_changelog_posts__WEBPACK_IMPORTED_MODULE_0__.posts;
        this.comments = _data_changelog_post_comments__WEBPACK_IMPORTED_MODULE_1__.postComments;
    }
}
PostComponent.ɵfac = function PostComponent_Factory(t) { return new (t || PostComponent)(); };
PostComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: PostComponent, selectors: [["app-post-details"]], inputs: { layout: "layout" }, decls: 37, vars: 9, consts: [[1, "post-header__categories", "justify-content-center"], ["routerLink", "../", 1, "text-center"], [1, "post-header__meta", "justify-content-center"], [1, "post-header__meta-item"], [1, "post-header__title", "text-center"], [1, "post__tags", "tags"], [1, "tags__list"], [1, "post__content", "typography", "text-center", 3, "ngClass"], ["href", ""]], template: function PostComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "a", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](4, "Latest Updates");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](8, "By: Data Marketplace Team");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](10, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](11, "November 30, 2018");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](12, "h4", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](13, "Morbi Interdum Velit Quis Magna Placerat Lobortis Eget");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](14, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](15, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](16, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](17, "a");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](18, "Updates");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](19, "a");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](20, "Power Tool");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](21, "a");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](22, "Wrench");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](23, "a");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](24, "Electrodes");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](25, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](26, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](27, " Vestibulum sagittis justo sit amet nisl semper, et pulvinar elit maximus. Morbi interdum velit quis magna placerat lobortis eget pharetra magna. Nulla tristique sollicitudin turpis, eget maximus risus faucibus non. Nulla vestibulum ipsum risus, vitae maximus nunc bibendum quis. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](28, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](29, " raesent eu consequat nibh. Quisque ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](30, "i");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](31, "ullamcorper");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](32, ", augue eu fringilla sodales, leo metus volutpat risus, at suscipit ipsum diam eget sem. Maecenas dictum elit in enim molestie, ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](33, "a", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](34, "vel sollicitudin erat ultricies");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](35, ". Sed risus tellus, molestie finibus dui quis, suscipit consequat ex. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](36, "hr");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassMapInterpolate1"]("block post post--layout--", ctx.layout, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassMapInterpolate1"]("post__header post-header post-header--layout--", ctx.layout, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](24);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction1"](7, _c0, ctx.layout === "full"));
    } }, directives: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterLinkWithHref, _angular_common__WEBPACK_IMPORTED_MODULE_4__.NgClass], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwb3N0LmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 75513:
/*!****************************************************************************!*\
  !*** ./src/app/@modules/changelog/components/sidebar/sidebar.component.ts ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SidebarComponent": () => (/* binding */ SidebarComponent)
/* harmony export */ });
/* harmony import */ var _data_blog_posts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../data/blog-posts */ 31622);
/* harmony import */ var _data_blog_widget_latest_comments__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../data/blog-widget-latest-comments */ 35468);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_api_changelog_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../@shared/api/changelog.service */ 22388);




class SidebarComponent {
    constructor(changelog) {
        this.changelog = changelog;
        this.position = 'start';
        this.posts = _data_blog_posts__WEBPACK_IMPORTED_MODULE_0__.posts;
        this.domains = [];
        this.latestComments = _data_blog_widget_latest_comments__WEBPACK_IMPORTED_MODULE_1__.latestComments;
    }
    ngOnInit() {
        //this.changelog.getDomains(null, 1).subscribe(x => this.domains = x);
    }
}
SidebarComponent.ɵfac = function SidebarComponent_Factory(t) { return new (t || SidebarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_shared_api_changelog_service__WEBPACK_IMPORTED_MODULE_2__.ChangelogService)); };
SidebarComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: SidebarComponent, selectors: [["app-sidebar"]], inputs: { position: "position" }, decls: 0, vars: 0, template: function SidebarComponent_Template(rf, ctx) { }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzaWRlYmFyLmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 43609:
/*!***********************************************************************************!*\
  !*** ./src/app/@modules/changelog/pages/page-category/page-category.component.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageCategoryComponent": () => (/* binding */ PageCategoryComponent)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 92218);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs/operators */ 85921);
/* harmony import */ var _data_blog_posts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../data/blog-posts */ 31622);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/sidebar/sidebar.component */ 75513);
/* harmony import */ var _shared_components_post_card_post_card_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../@shared/components/post-card/post-card.component */ 93694);
/* harmony import */ var _shared_components_pagination_pagination_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../@shared/components/pagination/pagination.component */ 19363);










function PageCategoryComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "app-sidebar", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function PageCategoryComponent_div_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "app-post-card", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const post_r3 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("post", post_r3)("layout", ctx_r1.getPostCardLayout());
} }
function PageCategoryComponent_div_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "app-sidebar", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
const _c0 = function () { return { label: "Home", url: "../../" }; };
const _c1 = function () { return { label: "Changelog", url: "../" }; };
const _c2 = function () { return { label: "Latest Updates", url: "" }; };
const _c3 = function (a0, a1, a2) { return [a0, a1, a2]; };
class PageCategoryComponent {
    constructor(route) {
        this.route = route;
        this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_6__.Subject();
        this.sidebarPosition = 'end'; // For LTR scripts "start" is "left" and "end" is "right"
        this.layout = 'classic';
        this.posts = _data_blog_posts__WEBPACK_IMPORTED_MODULE_0__.posts;
        this.route.data.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_7__.takeUntil)(this.destroy$)).subscribe(data => {
            this.sidebarPosition = data.sidebarPosition;
            this.layout = data.layout;
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    getPostCardLayout() {
        return {
            classic: 'grid-lg',
            grid: 'grid-nl',
            list: 'list-nl'
        }[this.layout];
    }
}
PageCategoryComponent.ɵfac = function PageCategoryComponent_Factory(t) { return new (t || PageCategoryComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_8__.ActivatedRoute)); };
PageCategoryComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({ type: PageCategoryComponent, selectors: [["app-category"]], decls: 13, vars: 18, consts: [[3, "header", "breadcrumbs"], [1, "container"], [1, "row"], ["class", "col-12 col-lg-4 order-1 order-lg-0", 4, "ngIf"], [1, "col-12", "col-lg-8"], [1, "block"], [1, "posts-view"], [1, "posts-list__body"], ["class", "posts-list__item", 4, "ngFor", "ngForOf"], [1, "posts-view__pagination"], [3, "current", "siblings", "total"], ["class", "col-12 col-lg-4", 4, "ngIf"], [1, "col-12", "col-lg-4", "order-1", "order-lg-0"], ["position", "start"], [1, "posts-list__item"], [3, "post", "layout"], [1, "col-12", "col-lg-4"], ["position", "end"]], template: function PageCategoryComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "app-page-header", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](3, PageCategoryComponent_div_3_Template, 2, 0, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](9, PageCategoryComponent_div_9_Template, 2, 2, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](10, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](11, "app-pagination", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](12, PageCategoryComponent_div_12_Template, 2, 0, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("header", "Latest News")("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction3"](14, _c3, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](11, _c0), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](12, _c1), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](13, _c2)));
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.sidebarPosition === "start");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("posts-view__list posts-list posts-list--layout--", ctx.layout, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.posts);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("current", 1)("siblings", 2)("total", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.sidebarPosition === "end");
    } }, directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_1__.PageHeaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgIf, _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_2__.SidebarComponent, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgForOf, _shared_components_post_card_post_card_component__WEBPACK_IMPORTED_MODULE_3__.PostCardComponent, _shared_components_pagination_pagination_component__WEBPACK_IMPORTED_MODULE_4__.PaginationComponent], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlLWNhdGVnb3J5LmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 35518:
/*!***************************************************************************!*\
  !*** ./src/app/@modules/changelog/pages/page-post/page-post.component.ts ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagePostComponent": () => (/* binding */ PagePostComponent)
/* harmony export */ });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ 85921);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 92218);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../components/sidebar/sidebar.component */ 75513);
/* harmony import */ var _components_post_post_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/post/post.component */ 97228);








function PagePostComponent_ng_container_2_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "app-sidebar", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function PagePostComponent_ng_container_2_div_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "app-sidebar", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function PagePostComponent_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, PagePostComponent_ng_container_2_div_2_Template, 2, 0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](4, "app-post-details", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](5, PagePostComponent_ng_container_2_div_5_Template, 2, 0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r0.sidebarPosition === "start");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r0.sidebarPosition === "end");
} }
function PagePostComponent_ng_container_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](3, "app-post-details", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
} }
const _c0 = function () { return { label: "Home", url: "../../" }; };
const _c1 = function () { return { label: "Changelog", url: "../" }; };
const _c2 = function () { return { label: "Latest Updates", url: "" }; };
const _c3 = function (a0, a1, a2) { return [a0, a1, a2]; };
class PagePostComponent {
    constructor(route) {
        this.route = route;
        this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_4__.Subject();
        this.sidebarPosition = 'end'; // For LTR scripts "start" is "left" and "end" is "right"
        this.layout = 'classic';
        this.route.data.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.takeUntil)(this.destroy$)).subscribe(data => {
            this.sidebarPosition = data.sidebarPosition;
            this.layout = data.layout;
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
PagePostComponent.ɵfac = function PagePostComponent_Factory(t) { return new (t || PagePostComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.ActivatedRoute)); };
PagePostComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: PagePostComponent, selectors: [["app-post"]], decls: 4, vars: 10, consts: [[3, "breadcrumbs"], [1, "container"], [4, "ngIf"], [1, "row"], ["class", "col-12 col-lg-4 order-1 order-lg-0", 4, "ngIf"], [1, "col-12", "col-lg-12"], ["layout", "classic"], ["class", "col-12 col-lg-4", 4, "ngIf"], [1, "col-12", "col-lg-4", "order-1", "order-lg-0"], ["position", "start"], [1, "col-12", "col-lg-4"], ["position", "end"], [1, "row", "justify-content-center"], [1, "col-md-12", "col-lg-9", "col-xl-8"], ["layout", "full"]], template: function PagePostComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](0, "app-page-header", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, PagePostComponent_ng_container_2_Template, 6, 2, "ng-container", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](3, PagePostComponent_ng_container_3_Template, 4, 0, "ng-container", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction3"](6, _c3, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction0"](3, _c0), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction0"](4, _c1), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction0"](5, _c2)));
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.layout === "classic");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.layout === "full");
    } }, directives: [_shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_0__.PageHeaderComponent, _angular_common__WEBPACK_IMPORTED_MODULE_7__.NgIf, _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_1__.SidebarComponent, _components_post_post_component__WEBPACK_IMPORTED_MODULE_2__.PostComponent], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlLXBvc3QuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ 22388:
/*!**************************************************!*\
  !*** ./src/app/@shared/api/changelog.service.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChangelogService": () => (/* binding */ ChangelogService)
/* harmony export */ });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ 28784);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../environments/environment */ 92340);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);

 // Assuming environment file exists


class ChangelogService {
    constructor(http) {
        this.http = http;
        this.apiBase = `${_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl}/changelog`;
    }
    getCategories(parent = null, depth = 0) {
        let params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams();
        if (parent === null || parent === void 0 ? void 0 : parent.slug)
            params = params.set('parent', parent.slug);
        params = params.set('depth', depth.toString());
        return this.http.get(`${this.apiBase}/categories/`, { params });
    }
}
ChangelogService.ɵfac = function ChangelogService_Factory(t) { return new (t || ChangelogService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpClient)); };
ChangelogService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({ token: ChangelogService, factory: ChangelogService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 54261:
/*!*********************************************!*\
  !*** ./src/data/changelog-post-comments.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "postComments": () => (/* binding */ postComments)
/* harmony export */ });
const postComments = {
    count: 4,
    items: [
        {
            avatar: 'assets/images/avatars/avatar-1',
            author: 'Jessica Moore',
            date: 'November 30, 2018',
            text: 'Aliquam ullamcorper elementum sagittis. Etiam lacus lacus, mollis in mattis in, vehicula eu nulla. ' +
                'Nulla nec tellus pellentesque.',
            children: [
                {
                    avatar: 'assets/images/avatars/avatar-2',
                    author: 'Adam Taylor',
                    date: 'December 4, 2018',
                    text: 'Ut vitae finibus nisl, suscipit porttitor urna. Integer efficitur efficitur velit non pulvinar. ' +
                        'Aliquam blandit volutpat arcu vel tristique. Integer commodo ligula id augue tincidunt faucibus.'
                },
                {
                    avatar: 'assets/images/avatars/avatar-3',
                    author: 'Helena Garcia',
                    date: 'December 12, 2018',
                    text: 'Suspendisse dignissim luctus metus vitae aliquam. Vestibulum sem odio, ullamcorper a imperdiet a, ' +
                        'tincidunt sed lacus. Sed magna felis, consequat a erat ut, rutrum finibus odio.'
                }
            ]
        },
        {
            avatar: 'assets/images/avatars/avatar-4',
            author: 'Ryan Ford',
            date: 'December 5, 2018',
            text: 'Nullam at varius sapien. Sed sit amet condimentum elit.'
        }
    ]
};


/***/ }),

/***/ 15019:
/*!*************************************!*\
  !*** ./src/data/changelog-posts.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "posts": () => (/* binding */ posts)
/* harmony export */ });
const posts = [
    {
        title: 'Philosophy That Addresses Topics Such As Goodness',
        image: 'assets/images/posts/post-1.jpg',
        categories: ['Special Offers'],
        date: 'October 19, 2019'
    },
    {
        title: 'Logic Is The Study Of Reasoning And Argument Part 2',
        image: 'assets/images/posts/post-2.jpg',
        categories: ['Latest News'],
        date: 'September 5, 2019'
    },
    {
        title: 'Some Philosophers Specialize In One Or More Historical Periods',
        image: 'assets/images/posts/post-3.jpg',
        categories: ['New Arrivals'],
        date: 'August 12, 2019'
    },
    {
        title: 'A Variety Of Other Academic And Non-Academic Approaches Have Been Explored',
        image: 'assets/images/posts/post-4.jpg',
        categories: ['Special Offers'],
        date: 'Jule 30, 2019'
    },
    {
        title: 'Germany Was The First Country To Professionalize Philosophy',
        image: 'assets/images/posts/post-5.jpg',
        categories: ['New Arrivals'],
        date: 'June 12, 2019'
    },
    {
        title: 'Logic Is The Study Of Reasoning And Argument Part 1',
        image: 'assets/images/posts/post-6.jpg',
        categories: ['Special Offers'],
        date: 'May 21, 2019'
    },
    {
        title: 'Many Inquiries Outside Of Academia Are Philosophical In The Broad Sense',
        image: 'assets/images/posts/post-7.jpg',
        categories: ['Special Offers'],
        date: 'April 3, 2019'
    },
    {
        title: 'An Advantage Of Digital Circuits When Compared To Analog Circuits',
        image: 'assets/images/posts/post-8.jpg',
        categories: ['Latest News'],
        date: 'Mart 29, 2019'
    },
    {
        title: 'A Digital Circuit Is Typically Constructed From Small Electronic Circuits',
        image: 'assets/images/posts/post-9.jpg',
        categories: ['New Arrivals'],
        date: 'February 10, 2019'
    },
    {
        title: 'Engineers Use Many Methods To Minimize Logic Functions',
        image: 'assets/images/posts/post-10.jpg',
        categories: ['Special Offers'],
        date: 'January 1, 2019'
    }
];


/***/ })

}]);
//# sourceMappingURL=src_app_modules_changelog_changelog_module_ts.js.map