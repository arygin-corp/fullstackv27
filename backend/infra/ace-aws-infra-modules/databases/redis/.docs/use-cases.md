# Redis Blueprint Use Cases

This document outlines the common use cases for the Redis Blueprint module.

## Prerequisites

Before connecting to Redis, ensure you have:

1. SSM VPC Connection Blueprint deployed in your environment
2. Required IAM permissions for SSM Session Manager
3. Redis cluster fully deployed and available

## Connecting to Redis using SSM VPC Connection

### Step 1: Deploy SSM VPC Connection Blueprint

First, deploy the [SSM VPC Connection Blueprint](https://chofer.cloud.toyota.com/create/templates/aws-infra-live-module-ssm-vpc-connection?learnMore=https:/github.com/Toyota-Motor-North-America/ace-aws-infra-modules/tree/master/compute/ssm-vpc-connection/README.md) in your environment:

### Step 2: Connect to Redis

You'll need two terminal windows to establish the connection:

#### Terminal 1: Set Up Port Forwarding

In your first terminal, establish port forwarding to your Redis instance using the SSM VPC Connection:

```bash
# For Redis with auth - requires SSM Session Manager access
aws ssm start-session \
  --target i-0123456789abcdef0 \  # Replace with your SSM VPC Connection instance ID
  --document-name "AWS-StartPortForwardingSessionToRemoteHost" \
  --parameters '{"host":["clustercfg.name_prefix-environment-region_cd-rc-bh.jezufk.region_cd.cache.amazonaws.com"],"portNumber":["6379"],"localPortNumber":["6443"]}' \
  --region us-west-2 \
  --profile default
```

**⚠️ IMPORTANT:**
- Keep this terminal window open as long as you need the connection
- Replace the endpoint with your actual Redis endpoint
- The port forwarding (6379 -> 6443) allows secure access to Redis through the SSM VPC Connection
- If you close this terminal, you'll lose the connection

#### Terminal 2: Connect to Redis

In your second terminal, use redis-cli to connect to the port-forwarded Redis instance:

```bash
# Test the connection
nc -vz 127.0.0.1 6443
```