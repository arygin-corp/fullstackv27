# PostgreSQL 18 baseline

Local Compose uses `postgres:18-alpine`.
AWS Infra-Live/Chofer should request RDS for PostgreSQL major version `18`; select an actually available RDS PostgreSQL 18 minor version in the target region/account during deployment.

NonProd uses one shared RDS instance. The instance is requested as `GDXPAdminNonProd` and Django connects to `gdxpadminnonprod`.
PROD uses its own RDS instance. The instance is requested as `GDXPAdminProd` and Django connects to `gdxpadminprod`.
