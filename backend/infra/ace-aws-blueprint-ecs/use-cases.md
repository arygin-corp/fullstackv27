Use cases:
* As a user, I want to deploy one or more ECS service consisting of one application container and optional sidecar container(s) to either existing or new ECS cluster
* As a user, I want to use Application Load Balancer or Network Load Balancer with HTTPS listener OR use an existing load balancer
* As a user, I want to create custom DNS name for my load balancer endpoint in a Route53 zone delegated to my AWS account
* As a user, I want to have valid SSL certificate created via AWS Certificate Manager (public CA) and attached to the load balancer 
* As a user, I want basic auto-scaling capabilities based on CPU utilization and/or memory utilization to be pre-configured with possibility to customize auto-scaling settings (such as thresholds over certain amount of time, and step increments for the load increase)
* As a user, I want basic monitoring at infrastructure level and log collection capabilities via AWS CloudWatch to be pre-configured
* As a user, I want an optional possibility to provision RDS database and make database credentials securely available to my application container
* As a user, I want an optional possibility to customize IAM roles used for provisioning and running my application container
* As a user, I want an optional possibility to pass environment variables and AWS Secrets Manager secrets to my containers
* As a user, I want to set resource allocation either in exact memory and cpu units or as T-shirt size (S, M, L, XL)
