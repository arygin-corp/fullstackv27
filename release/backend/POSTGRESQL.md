# PostgreSQL 18 baseline

Local Compose uses `postgres:18-alpine`.
AWS Infra-Live/Chofer should request RDS for PostgreSQL major version `18`; select an actually available RDS PostgreSQL 18 minor version in the target region/account during deployment.

NonProd uses one shared RDS instance and one shared logical database: `edmp_gdxp_admin_nonprod`.
PROD uses a dedicated RDS instance and database: `edmp_gdxp_admin_prod`.
