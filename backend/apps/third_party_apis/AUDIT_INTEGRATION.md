# Audit integration points

Wrap each module API view with `@audit_integration_call("module_key")`.
After successful metadata edits call `record_audit(module_key, "UPDATE", "SUCCESS", request=request, changes=<sanitized diff>)`.
After icon/source-logo upload or removal call `record_audit(..., action="UPLOAD" or "DELETE")`.
After readiness execution call `record_audit(module_key, "TEST", result, request=request, metadata={"run_id": run.pk, "status": run.status})`.
The audit helper redacts common secret/token/password/session keys before persistence.
