# Deployment-hardened Django Workflow Engine
This build adds deployment hardening to the full platform version.

## Authorization model
A non-superuser must satisfy all applicable checks: active tenant membership, membership in an allowed Django group, and an active dedicated staffing assignment within its date window and workflow/instance/state scope. Policies are action-specific for view, transition, approve, comment, attach, rollback, publish, and administration.

Use `workflow_engine.secure_urls` for production runtime APIs and enable `workflow_engine.middleware.TenantMiddleware`. The legacy APIs remain for migration compatibility but should not be mounted in production until individually tenant-scoped.

## Reliability
`DurableJobQueue` provides database-backed leases, `select_for_update(skip_locked=True)`, exponential retry with jitter, idempotent enqueue and dead-letter records. `IdempotencyService` prevents duplicate API operations when integrated with write endpoints.

## Validation performed
The package is syntax-compiled and ZIP validated. Full Django tests require installing dependencies and generating project-specific migrations. Production acceptance still requires PostgreSQL integration tests, security testing, load testing and infrastructure configuration. See `DEPLOYMENT_CHECKLIST.md`.
