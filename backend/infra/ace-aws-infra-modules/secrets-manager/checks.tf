check "rotation_lambda_name_required_for_all_secrets" {
  assert {
    condition = alltrue([
      for k, v in var.secrets : (
        v.existing_rotation_lambda_name != null && v.existing_rotation_lambda_name != ""
      )
    ])
    error_message = "All secrets must specify existing_rotation_lambda_name. Each secret must have its own rotation lambda."
  }
}

check "secrets_required" {
  assert {
    condition     = var.secrets != null && length(var.secrets) > 0
    error_message = "secrets map is required and cannot be empty. At least one secret must be defined."
  }
}


check "rotation_schedule_expression_format" {
  assert {
    condition     = can(regex("^(rate\\(.*\\)|cron\\(.*\\))$", var.default_rotation_schedule_expression))
    error_message = "rotation_schedule_expression must be a valid rate or cron expression (e.g., 'rate(30 days)' or 'cron(0 2 ? * MON *)')."
  }
}

check "rotation_schedule_format" {
  assert {
    condition = alltrue([
      for k, v in var.secrets : (
        v.rotation_schedule == null || can(regex("^(rate\\(.*\\)|cron\\(.*\\))$", v.rotation_schedule))
      )
    ])
    error_message = "rotation_schedule must be a valid rate or cron expression."
  }
}
