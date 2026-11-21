# TFLint configuration for ace-aws-blueprint-ecs
# This configuration manages linting rules and exceptions for the project

config {
  # Enable all rules by default
  disabled_by_default = false
  
  # Force the module to be installed before linting
  force = false
  
  # Disable color output for CI/CD compatibility  
  format = "default"
}

# Terraform ruleset configuration
plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

# AWS ruleset configuration (if needed)
plugin "aws" {
  enabled = false  # Disable for now as it requires additional setup
  version = "0.24.1"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

# Rule configurations and exceptions
rule "terraform_unused_declarations" {
  enabled = true
  
  # Note: We keep some variables for module compatibility even if currently unused
  # These variables may be needed for:
  # 1. Future module enhancements
  # 2. External module compatibility
  # 3. Consistent interface across test modules
}

# Ignore unused variable warnings for specific patterns in test modules
# This allows keeping variables for compatibility without linting errors
rule "terraform_comment_syntax" {
  enabled = true
}

rule "terraform_deprecated_index" {
  enabled = true  
}

rule "terraform_deprecated_interpolation" {
  enabled = true
}

rule "terraform_documented_outputs" {
  enabled = false  # Not enforcing output documentation in test modules
}

rule "terraform_documented_variables" {
  enabled = false  # Not enforcing variable documentation in test modules
}

rule "terraform_module_pinned_source" {
  enabled = true
  style   = "semver"  # Enforce semantic versioning for module sources
}

rule "terraform_naming_convention" {
  enabled = true
  format  = "snake_case"
}

rule "terraform_required_providers" {
  enabled = true
}

rule "terraform_required_version" {
  enabled = true
}

rule "terraform_standard_module_structure" {
  enabled = false  # Not enforcing standard structure for test modules
}

rule "terraform_typed_variables" {
  enabled = true
}

rule "terraform_unused_required_providers" {
  enabled = true
}

rule "terraform_workspace_remote" {
  enabled = false  # Not applicable for this project
}