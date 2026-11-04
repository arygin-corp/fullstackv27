# Django Changelog Notification App, Phases 1, 2, 3, 4, and 5

This is the complete app module assembled from the supplied changelog code and templates.

## Included

Phase 1:

- release status workflow
- scheduled publishing
- approval workflow
- full-text search
- email and in-app notifications

Phase 2:

- side-by-side release comparison
- dashboard analytics
- HTML and REST access to both features

Phase 3 adds the timeline HTML page, sanitized rich HTML sections, structured timeline API, and HTML fragment endpoint.

Phase 4 adds the anonymous read-only public API, latest and version endpoints, public HTML release fragments, filters, pagination, caching, and ETag revalidation.

Phase 5 adds permission-protected audit history, field-level before/after views, release/user/date filters, and streaming CSV export.

The A-J content model remains unchanged, and manually authored product or page information remains inside CKEditor list content.

## Install

Copy this directory to `apps/changelog`, confirm `apps.changelog.apps.ChangelogConfig` is installed, and preserve the included template directory.

Run:

```bash
python manage.py check
python manage.py showmigrations changelog
python manage.py migrate
python manage.py grant_changelog_admin
python manage.py test apps.changelog
python manage.py check --deploy
```

Configure production email and schedule:

```bash
python manage.py publish_due_releases
```

Read `PHASE1_IMPLEMENTATION.md`, `PHASE2_IMPLEMENTATION.md`, and `PHASE3_IMPLEMENTATION.md`, and `PHASE4_IMPLEMENTATION.md`, and `PHASE5_IMPLEMENTATION.md` before deployment. For an existing environment, compare applied migration records and the real schema before replacing previously applied migration files.
