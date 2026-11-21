<!-- BEGIN_TF_DOCS -->
## Prerequisites
<!-- * AWS account where you want to deploy the Blueprint.
* **terraform:** `>= 1.5.7` installed to your local machine. -->


* AWS account with appropriate permissions for Secrets Manager, KMS, Lambda, and CloudWatch
* **terraform:** `>= 1.5.7`
* **aws provider:** `>= 5.0.0, < 6.0.0`
* VPC with private subnets
* IAM permissions for:
  - Secrets Manager
  - KMS
  - Lambda
* Existing Lambda rotation function implementing AWS Secrets Manager rotation interface

## Deployment Information
### Deploy the service using GitHub Actions

See documentation on general steps for Blueprint creation and deployment here: https://chofer.cloud.toyota.com/docs/default/Component/ACE-TECH-DOCS/blueprints/blueprintdeployment/

For more information on the CD Terraform Standalone pipeline, see here: https://chofer.cloud.toyota.com/docs/default/Component/developer-platform-guides/building-and-deploying/gha-ci-cd-pipelines/available-pipelines/cd-pipeline-terraform-standalone-gha/

## Blueprint Features
# Secrets Manager Features

### Secret Management
- **Secure Storage**: Encrypted storage using AWS KMS with automatic key creation or existing key support
- **Automatic Rotation**: Lambda-based rotation with configurable schedules (cron/rate) and immediate rotation option
- **Version Control**: Multiple versions with staging labels (AWSCURRENT, AWSPENDING, AWSPREVIOUS)
- **Access Control**: Fine-grained resource policies and IAM integration with least-privilege permissions

### Security & Compliance
- **Encryption**: KMS encryption at rest and TLS in transit with comprehensive audit trails
- **TMNA Standards**: Built-in data classification and standard TMNA tagging for organization

## Upgrading


## Notes
## Important Notes

- **⚠️ CRITICAL**: Never store actual secret values in Terraform state files. This module only manages infrastructure, not secret content.
- **⚠️ IMPORTANT**: Always implement proper rotation for production secrets. The `rotate_immediately = true` setting triggers immediate rotation.
- **🔐 ENCRYPTION**: Each secret will be encrypted with its own KMS key unless a custom `existing_kms_key_id` is specified.
- **🔄 ROTATION**: Each secret must specify its own `existing_rotation_lambda_name`. See: [Rotation by Lambda function](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda.html)
- **📚 LAMBDA CREATION**: For creating rotation Lambda functions, see: [CI Pipeline for Python Serverless](https://chofer.cloud.toyota.com/docs/default/component/developer-platform-guides/building-and-deploying/gha-ci-cd-pipelines/available-pipelines/ci-pipeline-cipysls-gha/) and [TDP Samples Python Serverless](https://github.com/Toyota-Motor-North-America/tdp-samples-python-serverless)
## KMS Key Management
- **🔒 Safe Key Updates**: Changing `existing_kms_key_id` is safe and non-disruptive - your secrets remain accessible during updates
- **🔄 Flexible Encryption**: Switch between auto-generated and custom KMS keys anytime without recreating secrets or losing data

## Use Cases
# Secrets Manager Use Cases

This document outlines the common use cases for the Secrets Manager module, which supports managing multiple secrets in a single module instance with automatic rotation and per-secret rotation lambda configuration.

## Prerequisites

1. **Existing Rotation Lambdas**: Pre-deployed Lambda functions that implement the AWS Secrets Manager rotation interface (one per secret)
2. **KMS Key**: Either create one with the secret manager blueprint or use existing KMS keys
3. **AWS Provider**: Configured AWS provider with appropriate permissions

## Use Cases

### 1. Multiple Secrets for Single Application

```hcl
module "app_secrets" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//secrets-manager?ref=vX.Y.Z"
  
  
  environment = "YOUR_ENVIRONMENT"           
  team        = "YOUR_TEAM_NAME"            
  resource_slug = "YOUR_APP_NAME"         
  
  secrets = {
    "database" = {
      
      name                          = "SECRET_NAME"        
      existing_rotation_lambda_name = "YOUR_DATABASE_ROTATION_LAMBDA"
      description                   = "YOUR_DESCRIPTION"                
      rotation_schedule             = "rate(30 days)"                   
      custom_tags = {
        "secret-type" = "SERVICE"
        "application" = "YOUR_APP_NAME"     
        "service"     = "SERVICE"
      }
    }
    
    "api-keys" = {
      
        name                          = "SECRET_NAME"        
      existing_rotation_lambda_name = "YOUR_API_ROTATION_LAMBDA"        
      description                   = "YOUR_DESCRIPTION"              
      rotation_schedule             = "cron(0 2 ? * MON *)"        
      custom_tags = {
        "secret-type"   = "SECRET_TYPE"
        "application"   = "YOUR_APP_NAME"
      }
    }
  }
}
```

### 2. Multiple Secrets with Different Configurations

```hcl
module "multiple_secrets" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//secrets-manager?ref=vX.Y.Z"
  
  
  environment = "YOUR_ENVIRONMENT"          
  team        = "YOUR_TEAM_NAME"            
  resource_slug = "YOUR_APP_NAME"           
  
  # Global rotation schedule (fallback for secrets that don't specify their own)
  default_rotation_schedule_expression = "rate(30 days)"
  
  # Custom tags
  custom_tags = {
    "purpose" = "YOUR_PURPOSE"            
    "owner"   = "YOUR_OWNER"                
  }
  
  secrets = {
    "app-config" = {
      
        name                          = "SECRET_NAME"       
      existing_rotation_lambda_name = "YOUR_CONFIG_ROTATION_LAMBDA"
      description                   = "YOUR_DESCRIPTION"          
      rotation_schedule             = "rate(7 days)"                  
      custom_tags = {
        "secret-type" = "SECRET_TYPE"
        "application" = "YOUR_APP_NAME" 
        "service"     = "SERVICE"
      }
    }
    
    "database-credentials" = {
      
        name                          = "SECRET_NAME"
      existing_rotation_lambda_name = "YOUR_DATABASE_ROTATION_LAMBDA"
      description                   = "YOUR_DESCRIPTION"
      rotation_schedule             = "rate(14 days)" 
      custom_tags = {
        "secret-type" = "database"
        "application" = "YOUR_APP_NAME"
        "service"     = "database"
      }
    }
  }
}
```

### 3. Custom KMS Keys per Secret

```hcl
module "custom_kms_secrets" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//secrets-manager?ref=vX.Y.Z"
  
  
  environment = "YOUR_ENVIRONMENT"           
  team        = "YOUR_TEAM_NAME"            
  resource_slug = "YOUR_APP_NAME"         

  # Global rotation schedule (fallback for secrets that don't specify their own)
  default_rotation_schedule_expression = "rate(30 days)"  # Optional: customize default schedule
  
  # Custom tags
  custom_tags = {
    "purpose"        = "YOUR_PURPOSE"        
    "owner"          = "YOUR_OWNER"         
    "classification" = "YOUR_CLASSIFICATION"
  }
  
  secrets = {
    "high-security" = {
      
        name                          = "SECRET_NAME"    
      existing_rotation_lambda_name = "YOUR_HIGH_SECURITY_ROTATION_LAMBDA"
      description                   = "YOUR_DESCRIPTION"                  
      existing_kms_key_id          = "YOUR_KMS_KEY_ARN"                
      rotation_schedule             = "rate(7 days)"                
      custom_tags = {
        "secret-type"    = "high-security"
        "application"    = "YOUR_APP_NAME"   
        "classification" = "YOUR_CLASSIFICATION" 
        "rotation-type"  = "custom"
      }
    }
    
    "standard" = {
      
        name                          = "SECRET_NAME"       
      existing_rotation_lambda_name = "YOUR_STANDARD_ROTATION_LAMBDA" 
      description                   = "YOUR_DESCRIPTION"              
      rotation_schedule             = "rate(30 days)"                  
      custom_tags = {
        "secret-type"   = "standard"
        "application"   = "YOUR_APP_NAME"
      }
    }
  }
}
```

### 4. Service-Specific Rotation Lambdas

```hcl
module "service_specific_secrets" {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//secrets-manager?ref=vX.Y.Z"
  
  
  environment = "YOUR_ENVIRONMENT"           
  team        = "YOUR_TEAM_NAME"            
  resource_slug = "YOUR_APP_NAME"           
  
  # Global rotation schedule (fallback for secrets that don't specify their own)
  default_rotation_schedule_expression = "rate(30 days)"  # Optional: customize default schedule
  
  # Custom tags
  custom_tags = {
    "purpose" = "YOUR_PURPOSE"              
    "owner"   = "YOUR_OWNER"                
    "architecture" = "YOUR_ARCHITECTURE"    
  }
  
  secrets = {
    "user-service-db" = {
      
        name                          = "SECRET_NAME"  
      existing_rotation_lambda_name = "YOUR_USER_SERVICE_ROTATION_LAMBDA"       
      description                   = "YOUR_DESCRIPTION"                        
      rotation_schedule             = "rate(14 days)"                           
      custom_tags = {
        "secret-type"   = "database"
        "application"   = "YOUR_APP_NAME"     
        "service"       = "YOUR_SERVICE_NAME" 
        "rotation-type" = "service-specific"
      }
    }
    
    "payment-service-db" = {
        name                          = "SECRET_NAME"  
      description                   = "YOUR_DESCRIPTION"                          
      rotation_schedule             = "rate(7 days)"                              
      existing_rotation_lambda_name = "YOUR_PAYMENT_SERVICE_ROTATION_LAMBDA"      
      custom_tags = {
        "secret-type"   = "database"
        "application"   = "YOUR_APP_NAME"    
        "service"       = "YOUR_SERVICE_NAME" 
        "rotation-type" = "service-specific"
      }
    }
    
    "notification-service-api" = {
        name                          = "SECRET_NAME"   
      existing_rotation_lambda_name = "YOUR_NOTIFICATION_SERVICE_ROTATION_LAMBDA" 
      description                   = "YOUR_DESCRIPTION"                          
      rotation_schedule             = "rate(30 days)"                             
      custom_tags = {
        "secret-type"   = "api-keys"
        "application"   = "YOUR_APP_NAME"     
        "service"       = "YOUR_SERVICE_NAME" 
        "rotation-type" = "service-specific"
      }
    }
  }
}
```

## Benefits

- **Centralized Management**: All secrets for an application in one place
- **Consistent Standards**: Uniform tagging, naming, and rotation policies
- **Cost Efficiency**: Shared infrastructure
- **Automatic Rotation**: All secrets have rotation enabled by default
- **Service-Specific Rotation**: Each secret can use its own specialized rotation lambda
- **Granular Control**: Per-secret rotation schedules and lambda functions

## Observability


## Example Terragrunt Usage
```hcl
# ---------------------------------------------------------------------------------------------------------------------
# TERRAGRUNT CONFIGURATION
# This is the configuration for Terragrunt, a thin wrapper for Terraform that supports locking and enforces best practices: https://github.com/gruntwork-io/terragrunt
# ---------------------------------------------------------------------------------------------------------------------

# Terragrunt will copy the Terraform configurations specified by the source parameter, along with any files in the working directory, into a temporary folder, and execute your Terraform commands in that folder.
terraform {
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//secrets-manager?ref=vX.Y.Z"
  source = "git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//secrets-manager?ref=master"
}

# Include all settings from the root terragrunt.hcl file
include { path = find_in_parent_folders() }

# Local variables
# Pull required parameters set in the parameter files of this relative path to be used as values.
locals {
  global_vars      = read_terragrunt_config(find_in_parent_folders("global.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  environment_vars = read_terragrunt_config(find_in_parent_folders("environment.hcl"))
  name_prefix      = local.global_vars.locals.name_prefix
  application_id   = local.global_vars.locals.application_id
  application_name = local.global_vars.locals.application_name
  environment      = local.environment_vars.locals.environment
  aws_region_cd    = local.region_vars.locals.aws_region_cd
}

# ---------------------------------------------------------------------------------------------------------------------
# MODULE PARAMETERS
# These are the variables we have to pass in to use the module specified in the Terragrunt configuration above
# ---------------------------------------------------------------------------------------------------------------------

inputs = { 
name_prefix         = "YOUR_NAME_PREFIX"
application_id      = "YOUR_APPLICATION_ID"
application_name    = "YOUR_APPLICATION_NAME"
created_by_email    = "YOUR_EMAIL"
team                = "YOUR_TEAM"
environment         = "YOUR_ENVIRONMENT"
data_classification = "YOUR_DATA_CLASSIFICATION"
infra_live_repo     = "YOUR_INFRA_LIVE_REPO"

# Multiple secrets configuration with service-specific rotation lambdas
secrets = {
  # Database secret with database-specific rotation lambda
  "app-database" = {
    name                          = "SECRET_NAME"
    existing_rotation_lambda_name = "EXISTING_ROTATION_LAMBDA"
    existing_kms_key_id           = "YOUR_KMS_KEY_ARN"
    description                   = "YOUR_DESCRIPTION"
    rotation_schedule             = "rate(7 days)"
    custom_tags = {
      "secret-type" = "SECRET_TYPE"
      "application" = "YOUR_APP_NAME"
      "service"     = "SERVICE"
    }
  }

  # API keys using default rotation lambda
  "api-keys" = {
    name                          = "SECRET_NAME"
    existing_rotation_lambda_name = "EXISTING_ROTATION_LAMBDA"
    description                   = "YOUR_DESCRIPTION"
    rotation_schedule             = "cron(0 2 ? * MON *)"
    custom_tags = {
      "secret-type"   = "SECRET_TYPE"
      "application"   = "YOUR_APP_NAME"
    }
  }

  # Redis credentials with custom rotation lambda
  "redis-credentials" = {
    name                          = "SECRET_NAME"
    existing_rotation_lambda_name = "EXISTING_ROTATION_LAMBDA"
    description                   = "YOUR_DESCRIPTION"
    rotation_schedule             = "rate(14 days)"
    custom_tags = {
      "secret-type"   = "SECRET_TYPE"
      "application"   = "YOUR_APP_NAME"
    }
  }

}

default_rotation_schedule_expression = "rate(30 days)"

custom_tags = {
  "purpose" = "YOUR_PURPOSE"
  "owner"   = "YOUR_OWNER"
}
}
```

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.5.7 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 6.0.0, < 7.0.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_kms_master_key"></a> [kms\_master\_key](#module\_kms\_master\_key) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//security/encryption/kms/kms-master-key | v47.3.3 |
| <a name="module_platform_roles"></a> [platform\_roles](#module\_platform\_roles) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//helpers/platform_roles | v47.3.3 |
| <a name="module_standard_tags"></a> [standard\_tags](#module\_standard\_tags) | git@github.com:Toyota-Motor-North-America/ace-aws-infra-modules.git//tagging/tmna-standard-tags | v47.3.3 |

## Resources

| Name | Type |
|------|------|
| [aws_iam_policy.rotation_lambda_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_role_policy_attachment.rotation_lambda_policy_attachment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_lambda_permission.rotation_lambdas](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission) | resource |
| [aws_lambda_permission.secretsmanager_invoke](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission) | resource |
| [aws_secretsmanager_secret.secrets](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/secretsmanager_secret) | resource |
| [aws_secretsmanager_secret_rotation.secret_rotation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/secretsmanager_secret_rotation) | resource |
| [aws_secretsmanager_secret_version.secret_versions](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/secretsmanager_secret_version) | resource |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_lambda_function.rotation_lambdas](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/lambda_function) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_app_team_oidc_arn"></a> [app\_team\_oidc\_arn](#input\_app\_team\_oidc\_arn) | The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline.The GHA OIDC role ARN for AWS.  This role arn specifically identifies the principal caller for Blueprints executed in the pipelines.  It is normally supplied by the pipeline. | `string` | n/a | yes |
| <a name="input_application_id"></a> [application\_id](#input\_application\_id) | Unique identifier for the application | `string` | n/a | yes |
| <a name="input_application_name"></a> [application\_name](#input\_application\_name) | Name of the application | `string` | n/a | yes |
| <a name="input_created_by_email"></a> [created\_by\_email](#input\_created\_by\_email) | Email of the person who created the resource | `string` | n/a | yes |
| <a name="input_custom_tags"></a> [custom\_tags](#input\_custom\_tags) | A map of custom tags to apply to resources. | `map(string)` | `null` | no |
| <a name="input_data_classification"></a> [data\_classification](#input\_data\_classification) | Data classification level | `string` | `"no_classification"` | no |
| <a name="input_default_rotation_schedule_expression"></a> [default\_rotation\_schedule\_expression](#input\_default\_rotation\_schedule\_expression) | Default rotation schedule for secrets that don't specify their own. Examples: 'rate(7 days)', 'cron(0 2 ? * MON *)' for every Monday at 2 AM, 'rate(12 hours)' for every 12 hours. | `string` | `"rate(30 days)"` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment in which the secret is being deployed | `string` | n/a | yes |
| <a name="input_infra_live_repo"></a> [infra\_live\_repo](#input\_infra\_live\_repo) | The name of the infrastructure live repository | `string` | `"ace-aws-infra-modules"` | no |
| <a name="input_name_prefix"></a> [name\_prefix](#input\_name\_prefix) | Prefix to be used in naming resources. Must follow standard resource naming conventions: https://chofer.cloud.toyota.com/docs/default/component/ace-tech-docs/cloud-platform/aws/standards/cloud-resource-naming/#resource-naming-convention | `string` | n/a | yes |
| <a name="input_resource_slug"></a> [resource\_slug](#input\_resource\_slug) | An identifier to uniquely name this resource. This is often the service name, or a unique identifier. | `string` | `"secrets-manager"` | no |
| <a name="input_secrets"></a> [secrets](#input\_secrets) | Map of secrets to manage. All secrets are created by this module with automatic rotation enabled.<br/><br/>ROTATION LAMBDAS: Each secret must specify its rotation lambda via existing\_rotation\_lambda\_name. <br/>This allows for service-specific rotation logic (e.g., database vs. Datadog vs. API keys). <br/>All rotation lambdas must exist and implement the AWS Secrets Manager rotation interface.<br/><br/>Example:<pre>hcl<br/>secrets = {<br/>  # Database secret with database-specific rotation lambda<br/>  "app-database" = {<br/>    name                        = "ksf-app-database-secret"<br/>    description                 = "Database credentials for KSF application"<br/>    existing_rotation_lambda_name = "database-rotation-lambda" # Database-specific lambda<br/>    rotation_schedule           = "rate(7 days)"<br/>    custom_tags = {<br/>      "secret-type" = "database"<br/>      "application" = "ksf-app"<br/>    }<br/>  }<br/><br/>  # Datadog API keys with Datadog-specific rotation lambda<br/>  "datadog-keys" = {<br/>    name                        = "ksf-datadog-api-keys"<br/>    description                 = "Datadog API keys for monitoring"<br/>    existing_rotation_lambda_name = "datadog-rotation-lambda" # Datadog-specific lambda<br/>    rotation_schedule           = "rate(30 days)"<br/>    custom_tags = {<br/>      "secret-type" = "datadog"<br/>      "application" = "ksf-app"<br/>    }<br/>  }<br/><br/>  # API keys with general API rotation lambda<br/>  "api-keys" = {<br/>    name                        = "ksf-api-keys-secret"<br/>    description                 = "API keys for external services"<br/>    existing_rotation_lambda_name = "api-rotation-lambda" # API-specific lambda<br/>    rotation_schedule           = "cron(0 2 ? * MON *)" # Every Monday at 2 AM<br/>    custom_tags = {<br/>      "secret-type" = "api-keys"<br/>      "application" = "ksf-app"<br/>    }<br/>  }<br/><br/>  # New secret with custom rotation lambda<br/>  "database-credentials" = {<br/>    name                  = "ksf-database-credentials"<br/>    description           = "Database credentials with custom rotation"<br/>    existing_rotation_lambda_name = "custom-db-rotation-lambda" # ← Custom rotation lambda<br/>    rotation_schedule     = "rate(7 days)"<br/>    custom_tags = {<br/>      "secret-type" = "database"<br/>    }<br/>  }<br/><br/>  # New secret with custom KMS key<br/>  "sensitive-data" = {<br/>    name              = "ksf-sensitive-data-secret"<br/>    description       = "Highly sensitive application data"<br/>    existing_kms_key_id = "arn:aws:kms:us-west-2:123456789012:key/abcd1234-ef56-7890-abcd-ef1234567890"<br/>    rotation_schedule = "rate(7 days)" # Weekly rotation for sensitive data<br/>    custom_tags = {<br/>      "secret-type"    = "sensitive"<br/>      "classification" = "highly_confidential"<br/>    }<br/>  }<br/>}</pre> | <pre>map(object({<br/>    name                          = string<br/>    existing_rotation_lambda_name = string<br/>    description                   = optional(string)<br/>    existing_kms_key_id           = optional(string)<br/>    resource_policy               = optional(string)<br/>    rotation_schedule             = optional(string, "rate(30 days)")<br/>    custom_tags                   = optional(map(string))<br/>  }))</pre> | n/a | yes |
| <a name="input_team"></a> [team](#input\_team) | Name of the team responsible for the secret | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_lambda_permissions_summary"></a> [lambda\_permissions\_summary](#output\_lambda\_permissions\_summary) | Summary of all Lambda permissions created for easy reference |
<!-- END_TF_DOCS -->