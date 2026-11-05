# GDXP Admin Django AWS deployment package v2

Includes the supplied `gdx/settings/base.py` plus normalized environment/runtime/storage settings.

Key changes:
- PostgreSQL local Compose baseline updated from 16 to 18.
- AWS target is RDS PostgreSQL major version 18; choose an RDS-supported PostgreSQL 18 minor in the target region when Chofer creates RDS.
- `base.py` is preserved as the feature/common settings layer, with SECRET_KEY initialization made safe for ECS-injected environment/secrets.
- `demo.py`, `dev.py`, `qa.py`, `stage.py`, `prod.py` import base + environment + runtime + storage.
- Runtime PostgreSQL, Redis/Celery, hosts/CSRF and S3 values override duplicate legacy defaults from base.py.
- `data/` and `media/` are excluded from images/Git and live in an environment S3 bucket under `data/` and `media/` prefixes.
- One immutable image supports Web, Worker, Beat and Migration through separate ECS commands.

Before merging, reconcile legacy duplicate settings in base.py in a normal code review. The import order in environment modules makes runtime.py/storage.py/environment.py authoritative for deployment values.
