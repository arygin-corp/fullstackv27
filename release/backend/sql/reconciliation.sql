SELECT mo.id, mo.marketplace_order_id FROM orders_marketplaceorder mo LEFT JOIN orders_request r ON r.marketplace_order_id = mo.id WHERE r.id IS NULL;
SELECT r.id, r.marketplace_order_id, r.number, r.ritm_id, r.ritm_number, r.object_id FROM orders_request r LEFT JOIN orders_marketplaceorder mo ON mo.id = r.marketplace_order_id WHERE mo.id IS NULL;
SELECT t.id, t.request_id, t.number FROM orders_task t LEFT JOIN orders_request r ON r.id = t.request_id WHERE r.id IS NULL;
SELECT marketplace_order_id, COUNT(*) FROM orders_marketplaceorder GROUP BY marketplace_order_id HAVING COUNT(*) > 1;
SELECT id, marketplace_order_id, number, object_id FROM orders_request WHERE ritm_id IS NULL OR ritm_id = '';
SELECT marketplace_order_id, ritm_id, COUNT(*) FROM orders_request GROUP BY marketplace_order_id, ritm_id HAVING COUNT(*) > 1;
SELECT id, correlation_id, sync_run_id, entity_type, operation, status, servicenow_ritm_id, error_message, started_at FROM orders_servicenowsyncaudit WHERE status IN ('FAILED', 'QUARANTINED') ORDER BY started_at DESC;
