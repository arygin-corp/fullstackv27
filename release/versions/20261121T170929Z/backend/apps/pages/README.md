# Master Pages Django App

This package uses the exact project structure requested:

```text
project-root/
├── apps/
│   ├── __init__.py
│   └── pages/
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── forms.py
│       ├── management/
│       ├── migrations/
│       ├── models.py
│       ├── tests.py
│       ├── urls.py
│       └── views.py
├── templates/
│   └── gdx_admin/
│       ├── base.html                 # supplied by the host project
│       ├── partials/                 # supplied by the host project
│       └── apps/
│           └── pages/
│               ├── approvals/
│               ├── audit/
│               ├── dashboard/
│               ├── errors/
│               ├── governance/
│               ├── includes/
│               ├── inventory/
│               ├── notifications/
│               ├── ownership/
│               ├── page/
│               ├── partials/
│               ├── retention/
│               ├── search/
│               ├── tasks/
│               └── workflow/
├── README.md
└── requirements.txt
```

The package does not overwrite the existing `templates/gdx_admin/base.html` or global `templates/gdx_admin/partials/` files.

## Django settings

```python
INSTALLED_APPS += ["apps.pages.apps.PagesConfig"]
TEMPLATES[0]["DIRS"] = [BASE_DIR / "templates"]
```

## Project URLs

```python
from django.urls import include, path

urlpatterns += [
    path("gdx/pages/", include("apps.pages.urls")),
]
```

## Install

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py test apps.pages
python manage.py check
```

Schedule `python manage.py purge_deleted_pages` daily. Use `--dry-run` before production execution.
