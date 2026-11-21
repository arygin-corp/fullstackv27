# Environment S3 ownership

Create/use one application bucket per environment and inject the bucket name through Infra-Live:

- DEMO: `edmp-gdxp-admin-demo-<globally-unique-suffix>`
- DEV: `edmp-gdxp-admin-dev-<globally-unique-suffix>`
- QA: `edmp-gdxp-admin-qa-<globally-unique-suffix>`
- STAGE: `edmp-gdxp-admin-stage-<globally-unique-suffix>`
- PROD: `edmp-gdxp-admin-prod-<globally-unique-suffix>`

Within each bucket:
- `media/` stores Django user-uploaded media through django-storages.
- `data/` stores application datasets and reference files through boto3 or an application storage service.

Do not bake `data/` or `media/` into the Docker image. Existing local contents are migrated once with the provided sync scripts, then excluded by `.dockerignore` and `.gitignore`.
