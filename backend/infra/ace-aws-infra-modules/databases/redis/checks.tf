check "validate_port" {
  assert {
    condition     = var.port >= 1024 && var.port <= 65535
    error_message = "Port must be between 1024 and 65535."
  }
}

check "validate_snapshot_retention" {
  assert {
    condition     = var.snapshot_retention_limit >= 0 && var.snapshot_retention_limit <= 35
    error_message = "Snapshot retention limit must be between 0 and 35 days."
  }
}

check "validate_maintenance_window" {
  assert {
    condition = (
      var.maintenance_window == null ||
      can(regex("^[a-z]{3}:[0-9]{2}:[0-9]{2}-[a-z]{3}:[0-9]{2}:[0-9]{2}$", var.maintenance_window))
    )
    error_message = "Maintenance window must be in the format 'ddd:hh24:mi-ddd:hh24:mi' (e.g., 'sun:07:00-sun:08:00')."
  }
}

check "validate_snapshot_window" {
  assert {
    condition = (
      var.snapshot_window == null ||
      can(regex("^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$", var.snapshot_window))
    )
    error_message = "Snapshot window must be in the format 'hh24:mi-hh24:mi' (e.g., '06:00-07:00')."
  }
}