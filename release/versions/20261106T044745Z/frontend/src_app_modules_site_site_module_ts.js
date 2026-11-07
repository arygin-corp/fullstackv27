"use strict";
(self["webpackChunkgdx"] = self["webpackChunkgdx"] || []).push([["src_app_modules_site_site_module_ts"],{

/***/ 93379:
/*!******************************************************************************!*\
  !*** ./src/app/@modules/site/pages/page-about-us/page-about-us.component.ts ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageAboutUsComponent": () => (/* binding */ PageAboutUsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_direction_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/services/direction.service */ 22113);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var ngx_owl_carousel_o__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ngx-owl-carousel-o */ 37297);
/* harmony import */ var _shared_directives_owl_prevent_click_directive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../@shared/directives/owl-prevent-click.directive */ 84837);





function PageAboutUsComponent_ng_template_24_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "img", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](4, "Michael Russo");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](6, "Chief Executive Officer");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function PageAboutUsComponent_ng_template_25_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "img", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](4, "Katherine Miller");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](6, "Marketing Officer");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function PageAboutUsComponent_ng_template_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "img", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](4, "Anthony Harris");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](6, "Finance Director");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
class PageAboutUsComponent {
    constructor(direction) {
        this.direction = direction;
        this.carouselOptions = {
            nav: false,
            dots: true,
            responsive: {
                580: { items: 3, margin: 32 },
                280: { items: 2, margin: 24 },
                0: { items: 1 }
            },
            rtl: this.direction.isRTL()
        };
    }
}
PageAboutUsComponent.ɵfac = function PageAboutUsComponent_Factory(t) { return new (t || PageAboutUsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_shared_services_direction_service__WEBPACK_IMPORTED_MODULE_0__.DirectionService)); };
PageAboutUsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: PageAboutUsComponent, selectors: [["app-about-us"]], decls: 27, vars: 1, consts: [[1, "block", "about-us"], [1, "about-us__image"], [1, "container"], [1, "row", "justify-content-center"], [1, "col-12", "col-xl-10"], [1, "about-us__body"], [1, "about-us__title"], [1, "about-us__text", "typography"], [1, "about-us__team"], [1, "about-us__team-title"], [1, "about-us__team-subtitle", "text-muted"], ["routerLink", "../contact-us"], [1, "about-us__teammates", "teammates"], ["appOwlPreventClick", "", 3, "options"], ["carouselSlide", ""], [1, "teammates__item", "teammate"], [1, "teammate__avatar"], ["src", "assets/images/teammates/teammate-1.jpg", "alt", ""], [1, "teammate__name"], [1, "teammate__position", "text-muted"], ["src", "assets/images/teammates/teammate-2.jpg", "alt", ""], ["src", "assets/images/teammates/teammate-3.jpg", "alt", ""]], template: function PageAboutUsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "h1", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](7, "About Us");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](8, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](10, " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lacus metus, convallis ut leo nec, tincidunt eleifend justo. Ut felis orci, hendrerit a pulvinar et, gravida ac lorem. Sed vitae molestie sapien, at sollicitudin tortor. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](11, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](12, " Duis id volutpat libero, id vestibulum purus.Donec euismod accumsan felis,egestas lobortis velit tempor vitae. Integer eget velit fermentum, dignissim odio non, bibendum velit. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](13, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](14, "h2", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](15, "Meat Our Team");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](16, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](17, "Want to work in our friendly team?");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](18, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](19, "a", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](20, "Contact us");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](21, " and we will consider your candidacy.");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](22, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](23, "owl-carousel-o", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](24, PageAboutUsComponent_ng_template_24_Template, 7, 0, "ng-template", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](25, PageAboutUsComponent_ng_template_25_Template, 7, 0, "ng-template", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](26, PageAboutUsComponent_ng_template_26_Template, 7, 0, "ng-template", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](23);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("options", ctx.carouselOptions);
    } }, directives: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterLinkWithHref, ngx_owl_carousel_o__WEBPACK_IMPORTED_MODULE_4__.CarouselComponent, _shared_directives_owl_prevent_click_directive__WEBPACK_IMPORTED_MODULE_1__.OwlPreventClickDirective, ngx_owl_carousel_o__WEBPACK_IMPORTED_MODULE_4__.CarouselSlideDirective], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYWdlLWFib3V0LXVzLmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 64353:
/*!********************************************************************************!*\
  !*** ./src/app/@modules/site/pages/page-changelog/page-changelog.component.ts ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageChangelogComponent": () => (/* binding */ PageChangelogComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_changelog_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/services/changelog.service */ 59279);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 36362);



function PageChangelogComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Loading changelog...");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function PageChangelogComponent_div_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx_r1.error);
} }
function PageChangelogComponent_li_19_Template(rf, ctx) { if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function PageChangelogComponent_li_19_Template_button_click_1_listener() { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r6); const release_r4 = restoredCtx.$implicit; const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r5.scrollToRelease(release_r4.id); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const release_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("Version ", release_r4.version, "");
} }
const _c0 = function (a0, a1, a2, a3, a4, a5, a6) { return { "new": a0, "updates": a1, "feature": a2, "enhancements": a3, "fixes": a4, "issues": a5, "remove": a6 }; };
function PageChangelogComponent_div_23_div_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "h5", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](6, "div", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const section_r9 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction7"](4, _c0, section_r9.category === "New", section_r9.category === "Updates", section_r9.category === "Feature", section_r9.category === "Enhancements", section_r9.category === "Fixes", section_r9.category === "Issues", section_r9.category === "Remove"));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", section_r9.category, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](section_r9.subtitle);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("innerHTML", section_r9.content, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeHtml"]);
} }
function PageChangelogComponent_div_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](8, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](10, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](11, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](12, "h3", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](14, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](16, PageChangelogComponent_div_23_div_16_Template, 7, 12, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const release_r7 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("id", "release-" + release_r7.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("Version ", release_r7.version, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](8, 6, release_r7.release_date, "MMMM d, y"));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("Yahoo!\uD83C\uDF89 ", release_r7.title, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](release_r7.description);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", release_r7.sections);
} }
class PageChangelogComponent {
    constructor(changelogService) {
        this.changelogService = changelogService;
        this.changelogs = [];
        this.loading = true;
        this.error = '';
    }
    ngOnInit() {
        this.loadChangelogs();
        setTimeout(() => {
            this.loading = false;
        }, 5000); // 5 seconds
    }
    loadChangelogs() {
        this.loading = true;
        this.changelogService.getChangelogs().subscribe({
            next: (response) => {
                this.changelogs = response;
                this.loading = false;
            },
            error: (error) => {
                console.error(error);
                this.error = 'Unable to load changelog releases.';
                this.loading = false;
            }
        });
    }
    scrollToRelease(id) {
        const element = document.getElementById(`release-${id}`);
        if (!element) {
            return;
        }
        const yOffset = -116;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}
PageChangelogComponent.ɵfac = function PageChangelogComponent_Factory(t) { return new (t || PageChangelogComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_shared_services_changelog_service__WEBPACK_IMPORTED_MODULE_0__.ChangelogService)); };
PageChangelogComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: PageChangelogComponent, selectors: [["app-page-changelog"]], decls: 48, vars: 4, consts: [[1, "jumbotron", "jumbotron-fluid"], [1, "jumbotron-sticky"], [1, "container"], [1, "display-4", "text-center", 2, "font-size", "28px", "font-weight", "700"], [1, "lead", "text-center", 2, "font-size", "14px", "font-weight", "300", "margin-top", "12px"], ["id", "page-container"], ["class", "alert alert-success", 4, "ngIf"], ["class", "alert alert-danger", 4, "ngIf"], [1, "changelog-layout", 2, "position", "relative", "top", "-40px"], [1, "version-nav", 2, "margin-top", "30px", "position", "sticky", "top", "148px"], ["type", "text", "placeholder", "Search version...", 1, "form-control", 2, "border-radius", "20px", "margin-bottom", "10px"], [4, "ngFor", "ngForOf"], [1, "changelog-content", 2, "position", "relative", "top", "18px"], ["id", "changelogs"], ["id", "items"], ["class", "item", 3, "id", 4, "ngFor", "ngForOf"], [1, "sidebar", 2, "margin-top", "-4px", "position", "sticky", "top", "108px"], ["id", "subscribe", 2, "width", "480px"], [1, "row"], [1, "text-center", 2, "font-size", "24px", "font-weight", "800"], [1, "text-center"], [1, "text-center", "mt-4", "mb-4"], [1, "sidebar", 2, "margin-top", "18px"], [1, "release-summary", "text-center"], [2, "font-weight", "bold"], [1, "alert", "alert-success"], [1, "alert", "alert-danger"], ["type", "button", 1, "version-link", 3, "click"], [1, "item", 3, "id"], [1, "timeline", "has-next", 2, "margin-top", "30px"], [1, "meta"], [1, "version", 2, "font-size", "16px !important", "font-weight", "bold"], [1, "release-date", 2, "font-size", "14px !important"], [1, "connector"], [1, "content", 2, "margin-top", "30px"], [2, "font-size", "22px !important", "font-weight", "bold"], ["class", "feature-section", 4, "ngFor", "ngForOf"], [1, "feature-section"], [1, "feature", "feature-padding", 2, "margin-top", "12px"], [1, "tag", 2, "font-size", "14px", 3, "ngClass"], [2, "line-height", "32px", "font-weight", "bold"], [1, "section-content", 3, "innerHTML"]], template: function PageChangelogComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "h1", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4, "Changelog");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "p", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](6, " Explore the latest updates, enhancements, bug fixes, and new features delivered in each release. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](7, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8, " Use this changelog to stay informed about product improvements and upcoming capabilities. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](10, PageChangelogComponent_div_10_Template, 2, 0, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](11, PageChangelogComponent_div_11_Template, 2, 1, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](12, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](13, "aside", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](14, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](15, "input", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](16, "h4");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](17, "Releases");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](18, "ul");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](19, PageChangelogComponent_li_19_Template, 3, 1, "li", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](20, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](21, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](22, "div", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](23, PageChangelogComponent_div_23_Template, 17, 9, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](24, "aside", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](25, "form", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](26, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](27, "h2", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](28, "Stay Up To Date!");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](29, "div", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](30, "Want to be the first to hear about changes?");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](31, "h3", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](32, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](33, "Email Subscriptions Coming Soon");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](34, "aside", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](35, "div", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](36, "h2", 24);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](37, "Releases Includes:");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](38, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](39, "\uD83D\uDE80 New Features");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](40, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](41, "\u26A1 Enhancements");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](42, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](43, "\uD83D\uDC1E Bug Fixes");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](44, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](45, "\u26A0\uFE0F Known Issues");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](46, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](47, "\uD83D\uDD27 Technical Updates");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](10);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.error);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.changelogs);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.changelogs);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgClass], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.DatePipe], styles: [".jumbotron[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  color: inherit;\n  background-color: #ededed;\n  text-align: center;\n  color: #363636;\n  z-index: 500;\n  padding: 20px 0;\n  margin-bottom: 30px;\n  background: #ededed;\n  border-bottom: 1px solid #d8d8d8;\n}\n\n#page-container[_ngcontent-%COMP%] {\n  max-width: 1800px;\n  margin: 0 auto;\n  padding: 0 20px 40px;\n}\n\n.changelog-layout[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 24px;\n}\n\n.version-nav[_ngcontent-%COMP%] {\n  width: 240px;\n  flex-shrink: 0;\n  position: sticky;\n  top: 100px;\n  height: calc(100vh - 140px);\n  overflow-y: auto;\n  background: #fff;\n  border-radius: 16px;\n  padding: 20px;\n  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);\n}\n.version-nav[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n  font-weight: 700;\n}\n.version-nav[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n.version-nav[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n.version-link[_ngcontent-%COMP%] {\n  width: 100%;\n  text-align: left;\n  border: none;\n  background: transparent;\n  padding: 8px 12px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 14px;\n  transition: all 0.2s ease;\n}\n.version-link[_ngcontent-%COMP%]:hover {\n  background: #f5f5f5;\n}\n.version-link[_ngcontent-%COMP%]:focus {\n  outline: none;\n  background: #ebfbff;\n}\n\n.changelog-content[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n\n#items[_ngcontent-%COMP%] {\n  width: 100%;\n}\n#items[_ngcontent-%COMP%]   .item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: stretch;\n  margin-bottom: 48px;\n}\n\n.timeline[_ngcontent-%COMP%] {\n  width: 180px;\n  padding-right: 16px;\n  flex-shrink: 0;\n  display: flex;\n  flex-direction: column;\n}\n.timeline[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 100%;\n}\n.meta[_ngcontent-%COMP%] {\n  text-align: center;\n}\n.meta[_ngcontent-%COMP%]   .version[_ngcontent-%COMP%] {\n  font-weight: 700;\n  white-space: nowrap;\n}\n.meta[_ngcontent-%COMP%]   .release-date[_ngcontent-%COMP%] {\n  font-size: 12px;\n  margin-top: 4px;\n}\n\n.connector[_ngcontent-%COMP%] {\n  position: relative;\n  flex: 1;\n  width: 100%;\n  min-height: 100px;\n}\n.connector[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 50%;\n  transform: translateX(-50%);\n  top: 0;\n  bottom: 0;\n  width: 2px;\n  background: #25204c;\n}\n.connector[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]::before, .connector[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]::after {\n  content: \"\";\n  position: absolute;\n  width: 8px;\n  height: 8px;\n  background: #25204c;\n  border-radius: 50%;\n  left: 50%;\n  transform: translateX(-50%);\n}\n.connector[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]::before {\n  top: 0;\n}\n.connector[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]::after {\n  bottom: 0;\n}\n\n#items[_ngcontent-%COMP%]   .item[_ngcontent-%COMP%]:last-child   .connector[_ngcontent-%COMP%] {\n  display: none;\n}\n\n.content[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.content[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n.content[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n\n.feature-section[_ngcontent-%COMP%] {\n  margin-bottom: 0px;\n}\n.feature[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 10px;\n}\n.feature[_ngcontent-%COMP%]   h5[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n.tag[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 90px;\n  height: 28px;\n  border-radius: 16px;\n  font-size: 12px;\n  font-weight: bold;\n}\n.tag.new[_ngcontent-%COMP%], .tag.feature[_ngcontent-%COMP%] {\n  background: #00f5d4;\n  color: #363636;\n}\n.tag.updates[_ngcontent-%COMP%] {\n  background: #00bbf9;\n  color: white;\n}\n.tag.enhancements[_ngcontent-%COMP%] {\n  background: #fee440;\n  color: #363636;\n  padding: 0px 24px;\n}\n.tag.fixes[_ngcontent-%COMP%] {\n  background: #ef476f;\n  color: white;\n}\n.tag.remove[_ngcontent-%COMP%] {\n  background: #ef476f;\n  color: white;\n}\n.tag.issues[_ngcontent-%COMP%] {\n  background: #424c55;\n  color: white;\n}\n\n.section-content[_ngcontent-%COMP%] {\n  line-height: 1.7;\n}\n[_nghost-%COMP%]     .section-content ul {\n  padding-left: 26px !important;\n  list-style-type: disc !important;\n}\n[_nghost-%COMP%]     .section-content ul ul {\n  list-style-type: circle !important;\n}\n\n.sidebar[_ngcontent-%COMP%] {\n  width: 500px;\n  flex-shrink: 0;\n  position: sticky;\n  top: 100px;\n}\n.release-summary[_ngcontent-%COMP%] {\n  background: #fff;\n  border-radius: 16px;\n  padding: 24px;\n  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);\n}\n.release-summary[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.release-summary[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin-bottom: 10px;\n}\n\n#subscribe[_ngcontent-%COMP%] {\n  max-width: 420px;\n  margin: 40px auto 0;\n}\n#subscribe[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] {\n  background: #f2f2f2;\n  border-radius: 16px;\n  padding: 32px;\n}\n#subscribe[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 36px;\n  margin: 16px 0;\n  border-radius: 18px;\n  border: none;\n  padding: 0 16px;\n}\n.button[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 100%;\n  height: 36px;\n  border: none;\n  border-radius: 18px;\n  background: #25204c;\n  color: white;\n  font-weight: 700;\n  cursor: pointer;\n}\n\n@media (max-width: 1200px) {\n  .sidebar[_ngcontent-%COMP%] {\n    display: none;\n  }\n\n  .version-nav[_ngcontent-%COMP%] {\n    width: 220px;\n  }\n}\n\n@media (max-width: 768px) {\n  .changelog-layout[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n\n  .version-nav[_ngcontent-%COMP%] {\n    width: 100%;\n    position: relative;\n    top: auto;\n    height: auto;\n    max-height: 260px;\n  }\n\n  .changelog-content[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n\n  #items[_ngcontent-%COMP%]   .item[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n\n  .timeline[_ngcontent-%COMP%] {\n    width: 100%;\n    margin-bottom: 12px;\n  }\n\n  .connector[_ngcontent-%COMP%] {\n    display: none;\n  }\n\n  .sidebar[_ngcontent-%COMP%] {\n    width: 100%;\n    display: block;\n    position: relative;\n    top: auto;\n  }\n}\n\n@media (max-width: 480px) {\n  .feature[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: flex-start;\n  }\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtY2hhbmdlbG9nLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzt1REFBQTtBQUlBO0VBQ0ksZ0JBQUE7RUFDQSxNQUFBO0VBQ0EsY0FBQTtFQUNBLHlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxjQUFBO0VBQ0EsWUFBQTtFQUNBLGVBQUE7RUFDQSxtQkFBQTtFQUNBLG1CQUFBO0VBQ0EsZ0NBQUE7QUFBSjtBQUdBOzt1REFBQTtBQUlBO0VBQ0ksaUJBQUE7RUFDQSxjQUFBO0VBQ0Esb0JBQUE7QUFESjtBQUlBOzt1REFBQTtBQUlBO0VBQ0ksYUFBQTtFQUNBLHVCQUFBO0VBQ0EsU0FBQTtBQUZKO0FBS0E7O3VEQUFBO0FBSUE7RUFDSSxZQUFBO0VBQ0EsY0FBQTtFQUVBLGdCQUFBO0VBQ0EsVUFBQTtFQUVBLDJCQUFBO0VBRUEsZ0JBQUE7RUFFQSxnQkFBQTtFQUVBLG1CQUFBO0VBRUEsYUFBQTtFQUVBLDBDQUFBO0FBVko7QUFhQTtFQUNJLG1CQUFBO0VBQ0EsZ0JBQUE7QUFWSjtBQWFBO0VBQ0ksU0FBQTtFQUNBLFVBQUE7RUFDQSxnQkFBQTtBQVZKO0FBYUE7RUFDSSxrQkFBQTtBQVZKO0FBYUE7RUFDSSxXQUFBO0VBQ0EsZ0JBQUE7RUFDQSxZQUFBO0VBQ0EsdUJBQUE7RUFFQSxpQkFBQTtFQUVBLGtCQUFBO0VBRUEsZUFBQTtFQUVBLGVBQUE7RUFFQSx5QkFBQTtBQWZKO0FBa0JBO0VBQ0ksbUJBQUE7QUFmSjtBQWtCQTtFQUNJLGFBQUE7RUFDQSxtQkFBQTtBQWZKO0FBa0JBOzt1REFBQTtBQUlBO0VBQ0ksT0FBQTtFQUNBLFlBQUE7QUFoQko7QUFtQkE7O3VEQUFBO0FBSUE7RUFDSSxXQUFBO0FBakJKO0FBb0JBO0VBQ0ksYUFBQTtFQUNBLG9CQUFBO0VBQ0EsbUJBQUE7QUFqQko7QUFvQkE7O3VEQUFBO0FBSUE7RUFDSSxZQUFBO0VBQ0EsbUJBQUE7RUFDQSxjQUFBO0VBQ0EsYUFBQTtFQUNBLHNCQUFBO0FBbEJKO0FBcUJBO0VBQ0ksYUFBQTtFQUNBLHNCQUFBO0VBQ0EsbUJBQUE7RUFDQSxZQUFBO0FBbEJKO0FBcUJBO0VBQ0ksa0JBQUE7QUFsQko7QUFxQkE7RUFDSSxnQkFBQTtFQUNBLG1CQUFBO0FBbEJKO0FBcUJBO0VBQ0ksZUFBQTtFQUNBLGVBQUE7QUFsQko7QUFxQkE7O3VEQUFBO0FBSUE7RUFDSSxrQkFBQTtFQUVBLE9BQUE7RUFFQSxXQUFBO0VBRUEsaUJBQUE7QUF0Qko7QUF5QkE7RUFDSSxrQkFBQTtFQUVBLFNBQUE7RUFFQSwyQkFBQTtFQUVBLE1BQUE7RUFDQSxTQUFBO0VBRUEsVUFBQTtFQUVBLG1CQUFBO0FBM0JKO0FBeUNBOztFQUVJLFdBQUE7RUFDQSxrQkFBQTtFQUVBLFVBQUE7RUFDQSxXQUFBO0VBRUEsbUJBQUE7RUFFQSxrQkFBQTtFQUVBLFNBQUE7RUFFQSwyQkFBQTtBQTNDSjtBQThDQTtFQUNJLE1BQUE7QUEzQ0o7QUE4Q0E7RUFDSSxTQUFBO0FBM0NKO0FBOENBLG1DQUFBO0FBRUE7RUFDSSxhQUFBO0FBNUNKO0FBK0NBOzt1REFBQTtBQUlBO0VBQ0ksT0FBQTtFQUNBLFlBQUE7QUE3Q0o7QUFnREE7RUFDSSxrQkFBQTtBQTdDSjtBQWdEQTtFQUNJLG1CQUFBO0FBN0NKO0FBZ0RBOzt1REFBQTtBQUlBO0VBQ0ksa0JBQUE7QUE5Q0o7QUFpREE7RUFDSSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxTQUFBO0VBQ0EsbUJBQUE7QUE5Q0o7QUFpREE7RUFDSSxTQUFBO0FBOUNKO0FBaURBOzt1REFBQTtBQUlBO0VBQ0ksYUFBQTtFQUNBLG1CQUFBO0VBQ0EsdUJBQUE7RUFFQSxlQUFBO0VBQ0EsWUFBQTtFQUVBLG1CQUFBO0VBRUEsZUFBQTtFQUNBLGlCQUFBO0FBbERKO0FBcURBOztFQUVJLG1CQUFBO0VBQ0EsY0FBQTtBQWxESjtBQXFEQTtFQUNJLG1CQUFBO0VBQ0EsWUFBQTtBQWxESjtBQXFEQTtFQUNJLG1CQUFBO0VBQ0EsY0FBQTtFQUNBLGlCQUFBO0FBbERKO0FBcURBO0VBQ0ksbUJBQUE7RUFDQSxZQUFBO0FBbERKO0FBcURBO0VBQ0ksbUJBQUE7RUFDQSxZQUFBO0FBbERKO0FBcURBO0VBQ0ksbUJBQUE7RUFDQSxZQUFBO0FBbERKO0FBcURBOzt1REFBQTtBQUlBO0VBQ0ksZ0JBQUE7QUFuREo7QUFzREE7RUFDSSw2QkFBQTtFQUNBLGdDQUFBO0FBbkRKO0FBc0RBO0VBQ0ksa0NBQUE7QUFuREo7QUFzREE7O3VEQUFBO0FBSUE7RUFDSSxZQUFBO0VBQ0EsY0FBQTtFQUNBLGdCQUFBO0VBQ0EsVUFBQTtBQXBESjtBQXVEQTtFQUNJLGdCQUFBO0VBRUEsbUJBQUE7RUFFQSxhQUFBO0VBRUEsMENBQUE7QUF2REo7QUEwREE7RUFDSSxtQkFBQTtBQXZESjtBQTBEQTtFQUNJLG1CQUFBO0FBdkRKO0FBMERBOzt1REFBQTtBQUlBO0VBQ0ksZ0JBQUE7RUFDQSxtQkFBQTtBQXhESjtBQTJEQTtFQUNJLG1CQUFBO0VBQ0EsbUJBQUE7RUFDQSxhQUFBO0FBeERKO0FBMkRBO0VBQ0ksV0FBQTtFQUNBLFlBQUE7RUFDQSxjQUFBO0VBQ0EsbUJBQUE7RUFDQSxZQUFBO0VBQ0EsZUFBQTtBQXhESjtBQTJEQTtFQUNJLGFBQUE7RUFDQSx1QkFBQTtFQUNBLG1CQUFBO0VBRUEsV0FBQTtFQUNBLFlBQUE7RUFFQSxZQUFBO0VBRUEsbUJBQUE7RUFFQSxtQkFBQTtFQUNBLFlBQUE7RUFFQSxnQkFBQTtFQUVBLGVBQUE7QUE5REo7QUFpRUE7O3VEQUFBO0FBSUE7RUFFSTtJQUNJLGFBQUE7RUFoRU47O0VBbUVFO0lBQ0ksWUFBQTtFQWhFTjtBQUNGO0FBb0VBOzt1REFBQTtBQUlBO0VBRUk7SUFDSSxzQkFBQTtFQXBFTjs7RUF1RUU7SUFDSSxXQUFBO0lBQ0Esa0JBQUE7SUFDQSxTQUFBO0lBQ0EsWUFBQTtJQUNBLGlCQUFBO0VBcEVOOztFQXVFRTtJQUNJLFdBQUE7RUFwRU47O0VBdUVFO0lBQ0ksc0JBQUE7RUFwRU47O0VBdUVFO0lBQ0ksV0FBQTtJQUNBLG1CQUFBO0VBcEVOOztFQXVFRTtJQUNJLGFBQUE7RUFwRU47O0VBdUVFO0lBQ0ksV0FBQTtJQUNBLGNBQUE7SUFDQSxrQkFBQTtJQUNBLFNBQUE7RUFwRU47QUFDRjtBQXdFQTs7dURBQUE7QUFJQTtFQUVJO0lBQ0ksc0JBQUE7SUFDQSx1QkFBQTtFQXhFTjtBQUNGIiwiZmlsZSI6InBhZ2UtY2hhbmdlbG9nLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFBBR0UgSEVBREVSXG49PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4uanVtYm90cm9uIHtcbiAgICBwb3NpdGlvbjogc3RpY2t5O1xuICAgIHRvcDogMDtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZWRlZGVkO1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICBjb2xvcjogIzM2MzYzNjtcbiAgICB6LWluZGV4OiA1MDA7XG4gICAgcGFkZGluZzogMjBweCAwO1xuICAgIG1hcmdpbi1ib3R0b206IDMwcHg7XG4gICAgYmFja2dyb3VuZDogI2VkZWRlZDtcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2Q4ZDhkODtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFBBR0UgQ09OVEFJTkVSXG49PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4jcGFnZS1jb250YWluZXIge1xuICAgIG1heC13aWR0aDogMTgwMHB4O1xuICAgIG1hcmdpbjogMCBhdXRvO1xuICAgIHBhZGRpbmc6IDAgMjBweCA0MHB4O1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgTUFJTiBMQVlPVVRcbj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi5jaGFuZ2Vsb2ctbGF5b3V0IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICAgIGdhcDogMjRweDtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIExFRlQgVkVSU0lPTiBOQVZcbj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi52ZXJzaW9uLW5hdiB7XG4gICAgd2lkdGg6IDI0MHB4O1xuICAgIGZsZXgtc2hyaW5rOiAwO1xuXG4gICAgcG9zaXRpb246IHN0aWNreTtcbiAgICB0b3A6IDEwMHB4O1xuXG4gICAgaGVpZ2h0OiBjYWxjKDEwMHZoIC0gMTQwcHgpO1xuXG4gICAgb3ZlcmZsb3cteTogYXV0bztcblxuICAgIGJhY2tncm91bmQ6ICNmZmY7XG5cbiAgICBib3JkZXItcmFkaXVzOiAxNnB4O1xuXG4gICAgcGFkZGluZzogMjBweDtcblxuICAgIGJveC1zaGFkb3c6IDAgMnB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjA4KTtcbn1cblxuLnZlcnNpb24tbmF2IGg0IHtcbiAgICBtYXJnaW4tYm90dG9tOiAxNnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG59XG5cbi52ZXJzaW9uLW5hdiB1bCB7XG4gICAgbWFyZ2luOiAwO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgbGlzdC1zdHlsZTogbm9uZTtcbn1cblxuLnZlcnNpb24tbmF2IGxpIHtcbiAgICBtYXJnaW4tYm90dG9tOiA4cHg7XG59XG5cbi52ZXJzaW9uLWxpbmsge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgYm9yZGVyOiBub25lO1xuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuXG4gICAgcGFkZGluZzogOHB4IDEycHg7XG5cbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XG5cbiAgICBjdXJzb3I6IHBvaW50ZXI7XG5cbiAgICBmb250LXNpemU6IDE0cHg7XG5cbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xufVxuXG4udmVyc2lvbi1saW5rOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiAjZjVmNWY1O1xufVxuXG4udmVyc2lvbi1saW5rOmZvY3VzIHtcbiAgICBvdXRsaW5lOiBub25lO1xuICAgIGJhY2tncm91bmQ6ICNlYmZiZmY7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBDRU5URVIgQ09OVEVOVFxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLmNoYW5nZWxvZy1jb250ZW50IHtcbiAgICBmbGV4OiAxO1xuICAgIG1pbi13aWR0aDogMDtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFRJTUVMSU5FIENPTlRBSU5FUlxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuI2l0ZW1zIHtcbiAgICB3aWR0aDogMTAwJTtcbn1cblxuI2l0ZW1zIC5pdGVtIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBzdHJldGNoO1xuICAgIG1hcmdpbi1ib3R0b206IDQ4cHg7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBMRUZUIFRJTUVMSU5FXG49PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4udGltZWxpbmUge1xuICAgIHdpZHRoOiAxODBweDtcbiAgICBwYWRkaW5nLXJpZ2h0OiAxNnB4O1xuICAgIGZsZXgtc2hyaW5rOiAwO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbn1cblxuLnRpbWVsaW5lID4gZGl2IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBoZWlnaHQ6IDEwMCU7XG59XG5cbi5tZXRhIHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG5cbi5tZXRhIC52ZXJzaW9uIHtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG59XG5cbi5tZXRhIC5yZWxlYXNlLWRhdGUge1xuICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICBtYXJnaW4tdG9wOiA0cHg7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBDT05ORUNUT1IgRklYXG49PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4uY29ubmVjdG9yIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cbiAgICBmbGV4OiAxO1xuXG4gICAgd2lkdGg6IDEwMCU7XG5cbiAgICBtaW4taGVpZ2h0OiAxMDBweDtcbn1cblxuLmNvbm5lY3RvciA+IGRpdiB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuXG4gICAgbGVmdDogNTAlO1xuXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xuXG4gICAgdG9wOiAwO1xuICAgIGJvdHRvbTogMDtcblxuICAgIHdpZHRoOiAycHg7XG5cbiAgICBiYWNrZ3JvdW5kOiAjMjUyMDRjO1xufVxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuLmNvbm5lY3RvciA+IGRpdjo6YmVmb3JlLFxuLmNvbm5lY3RvciA+IGRpdjo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6ICcnO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcblxuICAgIHdpZHRoOiA4cHg7XG4gICAgaGVpZ2h0OiA4cHg7XG5cbiAgICBiYWNrZ3JvdW5kOiAjMjUyMDRjO1xuXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuXG4gICAgbGVmdDogNTAlO1xuXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xufVxuXG4uY29ubmVjdG9yID4gZGl2OjpiZWZvcmUge1xuICAgIHRvcDogMDtcbn1cblxuLmNvbm5lY3RvciA+IGRpdjo6YWZ0ZXIge1xuICAgIGJvdHRvbTogMDtcbn1cblxuLyogaGlkZSBjb25uZWN0b3Igb24gbGFzdCByZWxlYXNlICovXG5cbiNpdGVtcyAuaXRlbTpsYXN0LWNoaWxkIC5jb25uZWN0b3Ige1xuICAgIGRpc3BsYXk6IG5vbmU7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBSRUxFQVNFIENPTlRFTlRcbj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi5jb250ZW50IHtcbiAgICBmbGV4OiAxO1xuICAgIG1pbi13aWR0aDogMDtcbn1cblxuLmNvbnRlbnQgaDMge1xuICAgIG1hcmdpbi1ib3R0b206IDhweDtcbn1cblxuLmNvbnRlbnQgcCB7XG4gICAgbWFyZ2luLWJvdHRvbTogMTZweDtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIEZFQVRVUkUgU0VDVElPTlxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLmZlYXR1cmUtc2VjdGlvbiB7XG4gICAgbWFyZ2luLWJvdHRvbTogMHB4O1xufVxuXG4uZmVhdHVyZSB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogMTJweDtcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xufVxuXG4uZmVhdHVyZSBoNSB7XG4gICAgbWFyZ2luOiAwO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgVEFHU1xuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLnRhZyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuXG4gICAgbWluLXdpZHRoOiA5MHB4O1xuICAgIGhlaWdodDogMjhweDtcblxuICAgIGJvcmRlci1yYWRpdXM6IDE2cHg7XG5cbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG59XG5cbi50YWcubmV3LFxuLnRhZy5mZWF0dXJlIHtcbiAgICBiYWNrZ3JvdW5kOiAjMDBmNWQ0O1xuICAgIGNvbG9yOiAjMzYzNjM2O1xufVxuXG4udGFnLnVwZGF0ZXMge1xuICAgIGJhY2tncm91bmQ6ICMwMGJiZjk7XG4gICAgY29sb3I6IHdoaXRlO1xufVxuXG4udGFnLmVuaGFuY2VtZW50cyB7XG4gICAgYmFja2dyb3VuZDogI2ZlZTQ0MDtcbiAgICBjb2xvcjogIzM2MzYzNjtcbiAgICBwYWRkaW5nOiAwcHggMjRweDtcbn1cblxuLnRhZy5maXhlcyB7XG4gICAgYmFja2dyb3VuZDogI2VmNDc2ZjtcbiAgICBjb2xvcjogd2hpdGU7XG59XG5cbi50YWcucmVtb3ZlIHtcbiAgICBiYWNrZ3JvdW5kOiAjZWY0NzZmO1xuICAgIGNvbG9yOiB3aGl0ZTtcbn1cblxuLnRhZy5pc3N1ZXMge1xuICAgIGJhY2tncm91bmQ6ICM0MjRjNTU7XG4gICAgY29sb3I6IHdoaXRlO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgQ0tFRElUT1IgSFRNTFxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLnNlY3Rpb24tY29udGVudCB7XG4gICAgbGluZS1oZWlnaHQ6IDEuNztcbn1cblxuOmhvc3QgOjpuZy1kZWVwIC5zZWN0aW9uLWNvbnRlbnQgdWwge1xuICAgIHBhZGRpbmctbGVmdDogMjZweCAhaW1wb3J0YW50O1xuICAgIGxpc3Qtc3R5bGUtdHlwZTogZGlzYyAhaW1wb3J0YW50O1xufVxuXG46aG9zdCA6Om5nLWRlZXAgLnNlY3Rpb24tY29udGVudCB1bCB1bCB7XG4gICAgbGlzdC1zdHlsZS10eXBlOiBjaXJjbGUgIWltcG9ydGFudDtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFJJR0hUIFNJREVCQVJcbj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi5zaWRlYmFyIHtcbiAgICB3aWR0aDogNTAwcHg7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gICAgcG9zaXRpb246IHN0aWNreTtcbiAgICB0b3A6IDEwMHB4O1xufVxuXG4ucmVsZWFzZS1zdW1tYXJ5IHtcbiAgICBiYWNrZ3JvdW5kOiAjZmZmO1xuXG4gICAgYm9yZGVyLXJhZGl1czogMTZweDtcblxuICAgIHBhZGRpbmc6IDI0cHg7XG5cbiAgICBib3gtc2hhZG93OiAwIDhweCAyMHB4IHJnYmEoMCwgMCwgMCwgMC4wOCk7XG59XG5cbi5yZWxlYXNlLXN1bW1hcnkgaDIge1xuICAgIG1hcmdpbi1ib3R0b206IDE2cHg7XG59XG5cbi5yZWxlYXNlLXN1bW1hcnkgcCB7XG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFNVQlNDUklCRSBCT1hcbj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbiNzdWJzY3JpYmUge1xuICAgIG1heC13aWR0aDogNDIwcHg7XG4gICAgbWFyZ2luOiA0MHB4IGF1dG8gMDtcbn1cblxuI3N1YnNjcmliZSA+IGRpdiB7XG4gICAgYmFja2dyb3VuZDogI2YyZjJmMjtcbiAgICBib3JkZXItcmFkaXVzOiAxNnB4O1xuICAgIHBhZGRpbmc6IDMycHg7XG59XG5cbiNzdWJzY3JpYmUgaW5wdXQge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMzZweDtcbiAgICBtYXJnaW46IDE2cHggMDtcbiAgICBib3JkZXItcmFkaXVzOiAxOHB4O1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBwYWRkaW5nOiAwIDE2cHg7XG59XG5cbi5idXR0b24ge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcblxuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMzZweDtcblxuICAgIGJvcmRlcjogbm9uZTtcblxuICAgIGJvcmRlci1yYWRpdXM6IDE4cHg7XG5cbiAgICBiYWNrZ3JvdW5kOiAjMjUyMDRjO1xuICAgIGNvbG9yOiB3aGl0ZTtcblxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG5cbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBSRVNQT05TSVZFIFRBQkxFVFxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuQG1lZGlhIChtYXgtd2lkdGg6IDEyMDBweCkge1xuXG4gICAgLnNpZGViYXIge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cblxuICAgIC52ZXJzaW9uLW5hdiB7XG4gICAgICAgIHdpZHRoOiAyMjBweDtcbiAgICB9XG5cbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFJFU1BPTlNJVkUgTU9CSUxFXG49PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5AbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcblxuICAgIC5jaGFuZ2Vsb2ctbGF5b3V0IHtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG5cbiAgICAudmVyc2lvbi1uYXYge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICB0b3A6IGF1dG87XG4gICAgICAgIGhlaWdodDogYXV0bztcbiAgICAgICAgbWF4LWhlaWdodDogMjYwcHg7XG4gICAgfVxuXG4gICAgLmNoYW5nZWxvZy1jb250ZW50IHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgfVxuXG4gICAgI2l0ZW1zIC5pdGVtIHtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG5cbiAgICAudGltZWxpbmUge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMTJweDtcbiAgICB9XG5cbiAgICAuY29ubmVjdG9yIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG5cbiAgICAuc2lkZWJhciB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICB0b3A6IGF1dG87XG4gICAgfVxuXG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBFWFRSQSBTTUFMTFxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuQG1lZGlhIChtYXgtd2lkdGg6IDQ4MHB4KSB7XG5cbiAgICAuZmVhdHVyZSB7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICAgIH1cblxufSJdfQ== */"] });


/***/ }),

/***/ 6279:
/*!**********************************************************************************!*\
  !*** ./src/app/@modules/site/pages/page-contact-us/page-contact-us.component.ts ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageContactUsComponent": () => (/* binding */ PageContactUsComponent)
/* harmony export */ });
/* harmony import */ var src_data_toyota__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/data/toyota */ 44026);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _blocks_block_map_block_map_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../blocks/block-map/block-map.component */ 54977);
/* harmony import */ var _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../@shared/components/page-header/page-header.component */ 4849);




const _c0 = function () { return { label: "Home", url: "../../" }; };
const _c1 = function () { return { label: "Contact Us", url: "" }; };
const _c2 = function (a0, a1) { return [a0, a1]; };
class PageContactUsComponent {
    constructor() {
        this.toyota = src_data_toyota__WEBPACK_IMPORTED_MODULE_0__.toyota;
    }
}
PageContactUsComponent.ɵfac = function PageContactUsComponent_Factory(t) { return new (t || PageContactUsComponent)(); };
PageContactUsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: PageContactUsComponent, selectors: [["app-contact-us"]], decls: 78, vars: 22, consts: [[3, "header", "breadcrumbs"], [1, "block"], [1, "container-fluid"], [1, "card", "mb-0"], [1, "card-body", "contact-us"], [1, "contact-us__container"], [1, "row"], [1, "col-12", "col-lg-6", "pb-4", "pb-lg-0"], [1, "contact-us__header", "card-title"], [1, "contact-us__address"], [3, "href"], [1, "col-12", "col-lg-6"], [1, "form-row"], [1, "form-group", "col-md-6"], ["for", "form-name"], ["type", "text", "id", "form-name", "placeholder", "Your Name", 1, "form-control"], ["for", "form-email"], ["type", "email", "id", "form-email", "placeholder", "Email Address", 1, "form-control"], [1, "form-group"], ["for", "form-subject"], ["type", "text", "id", "form-subject", "placeholder", "Subject", 1, "form-control"], ["for", "form-message"], ["id", "form-message", "rows", "4", 1, "form-control"], ["type", "submit", 1, "btn", "btn-primary"]], template: function PageContactUsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](0, "app-block-map");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "app-page-header", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](7, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "h4", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](10, "Our Address");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](13, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](14, "Address:");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](15, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](17, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](18);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](19, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](20);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](21, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](22, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](23, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](24, "Emails:");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](25, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](26, "a", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](27, "Data Marketplace Team");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](28, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](29, "a", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](30, "Data Marketplace Content");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](31, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](32, "a", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](33, "Data Marketplace Tech");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](34, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](35, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](36, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](37, "Opening Hours");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](38, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](39, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](40);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](41);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](42, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](43, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](44);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](45);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](46, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](47, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](48);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](49);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](50, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](51, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](52, "Holiday Schedule");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](53, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](54, " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur suscipit suscipit mi, non tempor nulla finibus eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](55, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](56, "h4", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](57, "Leave us a Message");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](58, "form");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](59, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](60, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](61, "label", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](62, "Your Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](63, "input", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](64, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](65, "label", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](66, "Email");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](67, "input", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](68, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](69, "label", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](70, "Subject");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](71, "input", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](72, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](73, "label", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](74, "Message");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](75, "textarea", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](76, "button", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](77, "Send Message");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("header", "Contact Us")("breadcrumbs", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction2"](19, _c2, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction0"](17, _c0), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction0"](18, _c1)));
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](15);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.toyota.address.line1, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate3"](" ", ctx.toyota.address.city, ", ", ctx.toyota.address.state, " ", ctx.toyota.address.zip, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.toyota.address.country, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate1"]("href", "mailto:", ctx.toyota.team.email, "?cc=secondemail@example.com&subject=Inquiry From Data Marketplace Web App", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate1"]("href", "mailto:", ctx.toyota.team.contentEmail, "?cc=secondemail@example.com&subject=Inquiry From Data Marketplace Web App", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate1"]("href", "mailto:", ctx.toyota.team.techEmail, "?cc=secondemail@example.com&subject=Inquiry From Data Marketplace Web App", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate2"]("", ctx.toyota.operationDays.mon, " - ", ctx.toyota.operationDays.fri, ":");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.toyota.operationHours.open, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("", ctx.toyota.operationDays.sat, ":");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.toyota.operationHours.close, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("", ctx.toyota.operationDays.sun, ":");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.toyota.operationHours.close, " ");
    } }, directives: [_blocks_block_map_block_map_component__WEBPACK_IMPORTED_MODULE_1__.BlockMapComponent, _shared_components_page_header_page_header_component__WEBPACK_IMPORTED_MODULE_2__.PageHeaderComponent], styles: ["a[_ngcontent-%COMP%] {\n  color: #363636;\n}\n\na[_ngcontent-%COMP%]:hover {\n  color: blue;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtY29udGFjdC11cy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGNBQUE7QUFDSjs7QUFFQTtFQUNHLFdBQUE7QUFDSCIsImZpbGUiOiJwYWdlLWNvbnRhY3QtdXMuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJhIHtcbiAgICBjb2xvcjogIzM2MzYzNlxufVxuXG5hOmhvdmVyIHtcbiAgIGNvbG9yOiBibHVlOyBcbn0iXX0= */"] });


/***/ }),

/***/ 99221:
/*!**********************************************************************************!*\
  !*** ./src/app/@modules/site/pages/page-disclaimer/page-disclaimer.component.ts ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageDisclaimerComponent": () => (/* binding */ PageDisclaimerComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_pages_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/services/pages.service */ 29622);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 36362);



function PageDisclaimerComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "h1", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "p", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, " This application is intended solely for authorized users within the organization. Information contained within the application may be confidential");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](6, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7, " or proprietary and must be handled in accordance with company policies and applicable data protection requirements.");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx_r0.page.title);
} }
function PageDisclaimerComponent_div_1_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const block_r3 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("innerHTML", block_r3.content, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeHtml"]);
} }
function PageDisclaimerComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, PageDisclaimerComponent_div_1_ng_container_1_Template, 2, 1, "ng-container", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r1.page.blocks);
} }
class PageDisclaimerComponent {
    constructor(pagesService) {
        this.pagesService = pagesService;
    }
    ngOnInit() {
        this.pagesService.getPage('disclaimer').subscribe((response) => {
            console.log('Disclaimer Response', response);
            response.blocks.sort((a, b) => a.position - b.position);
            this.page = response;
        });
    }
}
PageDisclaimerComponent.ɵfac = function PageDisclaimerComponent_Factory(t) { return new (t || PageDisclaimerComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_shared_services_pages_service__WEBPACK_IMPORTED_MODULE_0__.PagesService)); };
PageDisclaimerComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: PageDisclaimerComponent, selectors: [["app-page-disclaimer"]], decls: 2, vars: 2, consts: [["class", "jumbotron jumbotron-fluid", 4, "ngIf"], ["class", "container", 4, "ngIf"], [1, "jumbotron", "jumbotron-fluid"], [1, "container"], [1, "display-4", "text-center", 2, "font-size", "28px", "font-weight", "700"], [1, "lead", "text-center", 2, "font-size", "18px", "font-weight", "300"], [4, "ngFor", "ngForOf"], [3, "innerHTML"]], template: function PageDisclaimerComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](0, PageDisclaimerComponent_div_0_Template, 8, 1, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, PageDisclaimerComponent_div_1_Template, 2, 1, "div", 1);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.page);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.page);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf], styles: [".jumbotron[_ngcontent-%COMP%] {\n  padding-top: 30px;\n  padding-bottom: 30px;\n  margin-bottom: 30px;\n  color: inherit;\n  background-color: #ededed;\n  text-align: center;\n  color: #363636;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtZGlzY2xhaW1lci5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGlCQUFBO0VBQ0Esb0JBQUE7RUFDQSxtQkFBQTtFQUNBLGNBQUE7RUFDQSx5QkFBQTtFQUNBLGtCQUFBO0VBQ0EsY0FBQTtBQUNKIiwiZmlsZSI6InBhZ2UtZGlzY2xhaW1lci5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5qdW1ib3Ryb24ge1xuICAgIHBhZGRpbmctdG9wOiAzMHB4O1xuICAgIHBhZGRpbmctYm90dG9tOiAzMHB4O1xuICAgIG1hcmdpbi1ib3R0b206IDMwcHg7XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2VkZWRlZDtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgY29sb3I6ICMzNjM2MzY7XG59Il19 */"] });


/***/ }),

/***/ 57459:
/*!********************************************************************!*\
  !*** ./src/app/@modules/site/pages/page-faq/page-faq.component.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageFaqComponent": () => (/* binding */ PageFaqComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ 36362);


function PageFaqComponent_div_11_p_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const child_r5 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", child_r5.propertyName, " ");
} }
function PageFaqComponent_div_11_Template(rf, ctx) { if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function PageFaqComponent_div_11_Template_button_click_1_listener($event) { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r7); const i_r3 = restoredCtx.index; const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r6.toggleAccordian($event, i_r3); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, PageFaqComponent_div_11_p_4_Template, 2, 1, "p", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r2 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", item_r2.parentName, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", item_r2.childProperties);
} }
function PageFaqComponent_div_15_p_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const child_r11 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", child_r11.propertyName, " ");
} }
function PageFaqComponent_div_15_Template(rf, ctx) { if (rf & 1) {
    const _r13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function PageFaqComponent_div_15_Template_button_click_1_listener($event) { const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r13); const i_r9 = restoredCtx.index; const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r12.toggleAccordian($event, i_r9); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, PageFaqComponent_div_15_p_4_Template, 2, 1, "p", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r8 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", item_r8.parentName, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", item_r8.childProperties);
} }
class PageFaqComponent {
    constructor() {
        this.data = [
            {
                "parentName": "Parent One",
                "childProperties": [
                    { "propertyName": "Property One" }
                ]
            },
            {
                "parentName": "Parent Two",
                "childProperties": [
                    { "propertyName": "Property Three" }
                ]
            },
            {
                "parentName": "Parent Three",
                "childProperties": [
                    { "propertyName": "Property Six" }
                ]
            }
        ];
    }
    toggleAccordian(event, index) {
        const element = event.target;
        element.classList.toggle("active");
        if (this.data[index].isActive) {
            this.data[index].isActive = false;
        }
        else {
            this.data[index].isActive = true;
        }
        const panel = element.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        }
        else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    }
}
PageFaqComponent.ɵfac = function PageFaqComponent_Factory(t) { return new (t || PageFaqComponent)(); };
PageFaqComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PageFaqComponent, selectors: [["app-faq"]], decls: 16, vars: 2, consts: [[1, "jumbotron", "jumbotron-fluid"], [1, "container"], [1, "display-4", "text-center", 2, "font-size", "28px", "font-weight", "700"], [1, "lead", "text-center", 2, "font-size", "14px", "font-weight", "300"], [1, "container-fluid"], [1, "col-12"], [1, "col-6", 2, "float", "left", "padding-right", "12px"], [4, "ngFor", "ngForOf"], [1, "col-6", 2, "float", "left", "padding-left", "12px"], [1, "accordion", 3, "click"], ["hide", "!item.isActive", 1, "panel"], ["style", "margin-top: 12px;", 4, "ngFor", "ngForOf"], [2, "margin-top", "12px"]], template: function PageFaqComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "h1", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, "FAQ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "p", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, "This is a Sample FAQ page.");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "h5");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](10, "Testing 1");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, PageFaqComponent_div_11_Template, 5, 2, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "h5");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](14, "Testing 2");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](15, PageFaqComponent_div_15_Template, 5, 2, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.data);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.data);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_1__.NgForOf], styles: ["@charset \"UTF-8\";\n.jumbotron[_ngcontent-%COMP%] {\n  padding-top: 30px;\n  padding-bottom: 30px;\n  margin-bottom: 30px;\n  color: inherit;\n  background-color: #ededed;\n  text-align: center;\n  color: #363636;\n}\n.accordion[_ngcontent-%COMP%] {\n  background-color: #eee;\n  color: #444;\n  cursor: pointer;\n  padding: 18px;\n  width: 100%;\n  border: none;\n  text-align: left;\n  outline: none;\n  font-size: 15px;\n  transition: 0.4s;\n}\n.active[_ngcontent-%COMP%], .accordion[_ngcontent-%COMP%]:hover {\n  background-color: #ccc;\n}\n.accordion[_ngcontent-%COMP%]:after {\n  content: \"+\";\n  color: #777;\n  font-weight: bold;\n  float: right;\n  margin-left: 5px;\n}\n.active[_ngcontent-%COMP%]:after {\n  content: \"\u2212\";\n}\n.panel[_ngcontent-%COMP%] {\n  padding: 0 18px;\n  background-color: white;\n  max-height: 0;\n  overflow: hidden;\n  transition: max-height 0.2s ease-out;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtZmFxLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGdCQUFnQjtBQUFoQjtFQUNJLGlCQUFBO0VBQ0Esb0JBQUE7RUFDQSxtQkFBQTtFQUNBLGNBQUE7RUFDQSx5QkFBQTtFQUNBLGtCQUFBO0VBQ0EsY0FBQTtBQUVKO0FBQUE7RUFDSSxzQkFBQTtFQUNBLFdBQUE7RUFDQSxlQUFBO0VBQ0EsYUFBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0EsZ0JBQUE7RUFDQSxhQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0FBR0o7QUFBQTtFQUNJLHNCQUFBO0FBR0o7QUFBQTtFQUNJLFlBQUE7RUFDQSxXQUFBO0VBQ0EsaUJBQUE7RUFDQSxZQUFBO0VBQ0EsZ0JBQUE7QUFHSjtBQUFBO0VBQ0ksWUFBQTtBQUdKO0FBQUE7RUFDSSxlQUFBO0VBQ0EsdUJBQUE7RUFDQSxhQUFBO0VBQ0EsZ0JBQUE7RUFDQSxvQ0FBQTtBQUdKIiwiZmlsZSI6InBhZ2UtZmFxLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmp1bWJvdHJvbiB7XG4gICAgcGFkZGluZy10b3A6IDMwcHg7XG4gICAgcGFkZGluZy1ib3R0b206IDMwcHg7XG4gICAgbWFyZ2luLWJvdHRvbTogMzBweDtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZWRlZGVkO1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICBjb2xvcjogIzM2MzYzNjtcbn1cbi5hY2NvcmRpb24ge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNlZWU7XG4gICAgY29sb3I6ICM0NDQ7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIHBhZGRpbmc6IDE4cHg7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgYm9yZGVyOiBub25lO1xuICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgb3V0bGluZTogbm9uZTtcbiAgICBmb250LXNpemU6IDE1cHg7XG4gICAgdHJhbnNpdGlvbjogMC40cztcbn1cbiAgXG4uYWN0aXZlLCAuYWNjb3JkaW9uOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2NjO1xufVxuICBcbi5hY2NvcmRpb246YWZ0ZXIge1xuICAgIGNvbnRlbnQ6ICdcXDAwMkInO1xuICAgIGNvbG9yOiAjNzc3O1xuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIGZsb2F0OiByaWdodDtcbiAgICBtYXJnaW4tbGVmdDogNXB4O1xufVxuICBcbi5hY3RpdmU6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6ICdcXDIyMTInO1xufVxuICBcbi5wYW5lbCB7XG4gICAgcGFkZGluZzogMCAxOHB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgIG1heC1oZWlnaHQ6IDA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB0cmFuc2l0aW9uOiBtYXgtaGVpZ2h0IDAuMnMgZWFzZS1vdXQ7XG59XG4gIFxuIl19 */"] });


/***/ }),

/***/ 12681:
/*!******************************************************************************************!*\
  !*** ./src/app/@modules/site/pages/page-privacy-policy/page-privacy-policy.component.ts ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagePrivacyPolicyComponent": () => (/* binding */ PagePrivacyPolicyComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 3184);

class PagePrivacyPolicyComponent {
    constructor() { }
    ngOnInit() {
    }
}
PagePrivacyPolicyComponent.ɵfac = function PagePrivacyPolicyComponent_Factory(t) { return new (t || PagePrivacyPolicyComponent)(); };
PagePrivacyPolicyComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PagePrivacyPolicyComponent, selectors: [["app-page-privacy-policy"]], decls: 6, vars: 0, consts: [[1, "jumbotron", "jumbotron-fluid"], [1, "container"], [1, "display-4", "text-center", 2, "font-size", "28px", "font-weight", "700"], [1, "lead", "text-center", 2, "font-size", "14px", "font-weight", "300"]], template: function PagePrivacyPolicyComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "h1", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, "Privacy Policy");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "p", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, "Updated on 07/13/2021");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: [".jumbotron[_ngcontent-%COMP%] {\n  padding-top: 30px;\n  padding-bottom: 30px;\n  margin-bottom: 30px;\n  color: inherit;\n  background-color: #ededed;\n  text-align: center;\n  color: #363636;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtcHJpdmFjeS1wb2xpY3kuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxpQkFBQTtFQUNBLG9CQUFBO0VBQ0EsbUJBQUE7RUFDQSxjQUFBO0VBQ0EseUJBQUE7RUFDQSxrQkFBQTtFQUNBLGNBQUE7QUFDSiIsImZpbGUiOiJwYWdlLXByaXZhY3ktcG9saWN5LmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmp1bWJvdHJvbiB7XG4gICAgcGFkZGluZy10b3A6IDMwcHg7XG4gICAgcGFkZGluZy1ib3R0b206IDMwcHg7XG4gICAgbWFyZ2luLWJvdHRvbTogMzBweDtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZWRlZGVkO1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICBjb2xvcjogIzM2MzYzNjtcbn0iXX0= */"] });


/***/ }),

/***/ 25601:
/*!************************************************************************!*\
  !*** ./src/app/@modules/site/pages/page-terms/page-terms.component.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PageTermsComponent": () => (/* binding */ PageTermsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _shared_services_pages_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../@shared/services/pages.service */ 29622);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 36362);



function PageTermsComponent_div_8_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const block_r2 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("innerHTML", block_r2.content, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeHtml"]);
} }
function PageTermsComponent_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, PageTermsComponent_div_8_ng_container_1_Template, 2, 1, "ng-container", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r0.page.blocks);
} }
class PageTermsComponent {
    constructor(pagesService) {
        this.pagesService = pagesService;
    }
    ngOnInit() {
        this.pagesService.getPage('terms-of-use').subscribe((response) => {
            console.log('Terms of Use Response', response);
            response.blocks.sort((a, b) => a.position - b.position);
            this.page = response;
        });
    }
}
PageTermsComponent.ɵfac = function PageTermsComponent_Factory(t) { return new (t || PageTermsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_shared_services_pages_service__WEBPACK_IMPORTED_MODULE_0__.PagesService)); };
PageTermsComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: PageTermsComponent, selectors: [["app-terms"]], decls: 9, vars: 1, consts: [[1, "jumbotron", "jumbotron-fluid"], [1, "container"], [1, "display-4", "text-center", 2, "font-size", "28px", "font-weight", "700"], [1, "lead", "text-center", 2, "font-size", "14px", "font-weight", "300"], ["class", "container", 4, "ngIf"], [4, "ngFor", "ngForOf"], [3, "innerHTML"]], template: function PageTermsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "h1", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "Terms of Use");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "p", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, " For authorized TMNA users only. By using this platform, you agree to follow TMNA data governance, privacy, and");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](6, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7, " security policies and use data solely for legitimate business purposes.");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](8, PageTermsComponent_div_8_Template, 2, 1, "div", 4);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.page);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf], styles: [".jumbotron[_ngcontent-%COMP%] {\n  padding-top: 30px;\n  padding-bottom: 30px;\n  margin-bottom: 30px;\n  color: inherit;\n  background-color: #ededed;\n  text-align: center;\n  color: #363636;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtdGVybXMuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxpQkFBQTtFQUNBLG9CQUFBO0VBQ0EsbUJBQUE7RUFDQSxjQUFBO0VBQ0EseUJBQUE7RUFDQSxrQkFBQTtFQUNBLGNBQUE7QUFDSiIsImZpbGUiOiJwYWdlLXRlcm1zLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmp1bWJvdHJvbiB7XG4gICAgcGFkZGluZy10b3A6IDMwcHg7XG4gICAgcGFkZGluZy1ib3R0b206IDMwcHg7XG4gICAgbWFyZ2luLWJvdHRvbTogMzBweDtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZWRlZGVkO1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICBjb2xvcjogIzM2MzYzNjtcbn0iXX0= */"] });


/***/ }),

/***/ 66710:
/*!******************************************************!*\
  !*** ./src/app/@modules/site/site-routing.module.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SiteRoutingModule": () => (/* binding */ SiteRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 52816);
/* harmony import */ var _pages_page_about_us_page_about_us_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pages/page-about-us/page-about-us.component */ 93379);
/* harmony import */ var _pages_page_contact_us_page_contact_us_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pages/page-contact-us/page-contact-us.component */ 6279);
/* harmony import */ var _pages_page_terms_page_terms_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/page-terms/page-terms.component */ 25601);
/* harmony import */ var _pages_page_faq_page_faq_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/page-faq/page-faq.component */ 57459);
/* harmony import */ var _pages_page_changelog_page_changelog_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/page-changelog/page-changelog.component */ 64353);
/* harmony import */ var _pages_page_disclaimer_page_disclaimer_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages/page-disclaimer/page-disclaimer.component */ 99221);
/* harmony import */ var _pages_page_privacy_policy_page_privacy_policy_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pages/page-privacy-policy/page-privacy-policy.component */ 12681);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 3184);










const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'about-us'
    },
    {
        path: 'about-us',
        component: _pages_page_about_us_page_about_us_component__WEBPACK_IMPORTED_MODULE_0__.PageAboutUsComponent
    },
    {
        path: 'contact-us',
        component: _pages_page_contact_us_page_contact_us_component__WEBPACK_IMPORTED_MODULE_1__.PageContactUsComponent
    },
    {
        path: 'terms-use',
        component: _pages_page_terms_page_terms_component__WEBPACK_IMPORTED_MODULE_2__.PageTermsComponent
    },
    {
        path: 'faq',
        component: _pages_page_faq_page_faq_component__WEBPACK_IMPORTED_MODULE_3__.PageFaqComponent
    },
    {
        path: 'changelog',
        component: _pages_page_changelog_page_changelog_component__WEBPACK_IMPORTED_MODULE_4__.PageChangelogComponent
    },
    {
        path: 'disclaimer',
        component: _pages_page_disclaimer_page_disclaimer_component__WEBPACK_IMPORTED_MODULE_5__.PageDisclaimerComponent
    },
    {
        path: 'privacy-policy',
        component: _pages_page_privacy_policy_page_privacy_policy_component__WEBPACK_IMPORTED_MODULE_6__.PagePrivacyPolicyComponent
    }
];
class SiteRoutingModule {
}
SiteRoutingModule.ɵfac = function SiteRoutingModule_Factory(t) { return new (t || SiteRoutingModule)(); };
SiteRoutingModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineNgModule"]({ type: SiteRoutingModule });
SiteRoutingModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineInjector"]({ imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterModule.forChild(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterModule] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵsetNgModuleScope"](SiteRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterModule], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterModule] }); })();


/***/ }),

/***/ 81071:
/*!**********************************************!*\
  !*** ./src/app/@modules/site/site.module.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SiteModule": () => (/* binding */ SiteModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/common */ 36362);
/* harmony import */ var ngx_owl_carousel_o__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ngx-owl-carousel-o */ 37297);
/* harmony import */ var _blocks_blocks_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../blocks/blocks.module */ 65955);
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../@shared/shared.module */ 32234);
/* harmony import */ var _site_routing_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./site-routing.module */ 66710);
/* harmony import */ var _pages_page_about_us_page_about_us_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/page-about-us/page-about-us.component */ 93379);
/* harmony import */ var _pages_page_contact_us_page_contact_us_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/page-contact-us/page-contact-us.component */ 6279);
/* harmony import */ var _pages_page_faq_page_faq_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages/page-faq/page-faq.component */ 57459);
/* harmony import */ var _pages_page_terms_page_terms_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pages/page-terms/page-terms.component */ 25601);
/* harmony import */ var _pages_page_changelog_page_changelog_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pages/page-changelog/page-changelog.component */ 64353);
/* harmony import */ var _pages_page_disclaimer_page_disclaimer_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./pages/page-disclaimer/page-disclaimer.component */ 99221);
/* harmony import */ var _pages_page_privacy_policy_page_privacy_policy_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./pages/page-privacy-policy/page-privacy-policy.component */ 12681);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/core */ 3184);
// modules (angular)

// modules (third-party)

// modules



// pages








class SiteModule {
}
SiteModule.ɵfac = function SiteModule_Factory(t) { return new (t || SiteModule)(); };
SiteModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_10__["ɵɵdefineNgModule"]({ type: SiteModule });
SiteModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_10__["ɵɵdefineInjector"]({ imports: [[
            // modules (angular)
            _angular_common__WEBPACK_IMPORTED_MODULE_11__.CommonModule,
            // modules (third-party)
            ngx_owl_carousel_o__WEBPACK_IMPORTED_MODULE_12__.CarouselModule,
            // modules
            _blocks_blocks_module__WEBPACK_IMPORTED_MODULE_0__.BlocksModule,
            _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule,
            _site_routing_module__WEBPACK_IMPORTED_MODULE_2__.SiteRoutingModule
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_10__["ɵɵsetNgModuleScope"](SiteModule, { declarations: [
        // pages
        _pages_page_about_us_page_about_us_component__WEBPACK_IMPORTED_MODULE_3__.PageAboutUsComponent,
        _pages_page_contact_us_page_contact_us_component__WEBPACK_IMPORTED_MODULE_4__.PageContactUsComponent,
        _pages_page_faq_page_faq_component__WEBPACK_IMPORTED_MODULE_5__.PageFaqComponent,
        _pages_page_terms_page_terms_component__WEBPACK_IMPORTED_MODULE_6__.PageTermsComponent,
        _pages_page_changelog_page_changelog_component__WEBPACK_IMPORTED_MODULE_7__.PageChangelogComponent,
        _pages_page_disclaimer_page_disclaimer_component__WEBPACK_IMPORTED_MODULE_8__.PageDisclaimerComponent,
        _pages_page_privacy_policy_page_privacy_policy_component__WEBPACK_IMPORTED_MODULE_9__.PagePrivacyPolicyComponent], imports: [
        // modules (angular)
        _angular_common__WEBPACK_IMPORTED_MODULE_11__.CommonModule,
        // modules (third-party)
        ngx_owl_carousel_o__WEBPACK_IMPORTED_MODULE_12__.CarouselModule,
        // modules
        _blocks_blocks_module__WEBPACK_IMPORTED_MODULE_0__.BlocksModule,
        _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule,
        _site_routing_module__WEBPACK_IMPORTED_MODULE_2__.SiteRoutingModule] }); })();


/***/ }),

/***/ 59279:
/*!*******************************************************!*\
  !*** ./src/app/@shared/services/changelog.service.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChangelogService": () => (/* binding */ ChangelogService)
/* harmony export */ });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ 86942);
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/environments/environment */ 92340);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ 28784);




class ChangelogService {
    constructor(http) {
        this.http = http;
        this.apiUrl = `${src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl}/api/changelog/public/releases/`;
    }
    getChangelogs() {
        return this.http.get(this.apiUrl).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.map)(response => response.results.map((release) => (Object.assign(Object.assign({}, release), { sections: release.sections.map((section) => ({
                category: section.category,
                subtitle: section.subtitle,
                content: section.html
            })) })))));
    }
}
ChangelogService.ɵfac = function ChangelogService_Factory(t) { return new (t || ChangelogService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_3__.HttpClient)); };
ChangelogService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({ token: ChangelogService, factory: ChangelogService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 29622:
/*!***************************************************!*\
  !*** ./src/app/@shared/services/pages.service.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesService": () => (/* binding */ PagesService)
/* harmony export */ });
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/environments/environment */ 92340);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ 28784);



class PagesService {
    constructor(http) {
        this.http = http;
    }
    getPage(slug) {
        return this.http.get(`${src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl}/api/pages/public/by-slug/${slug}/`);
    }
}
PagesService.ɵfac = function PagesService_Factory(t) { return new (t || PagesService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_2__.HttpClient)); };
PagesService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: PagesService, factory: PagesService.ɵfac, providedIn: 'root' });


/***/ })

}]);
//# sourceMappingURL=src_app_modules_site_site_module_ts.js.map