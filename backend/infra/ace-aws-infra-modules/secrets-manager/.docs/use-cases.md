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
