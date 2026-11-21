# Secrets Manager Features

### Secret Management
- **Secure Storage**: Encrypted storage using AWS KMS with automatic key creation or existing key support
- **Automatic Rotation**: Lambda-based rotation with configurable schedules (cron/rate) and immediate rotation option
- **Version Control**: Multiple versions with staging labels (AWSCURRENT, AWSPENDING, AWSPREVIOUS)
- **Access Control**: Fine-grained resource policies and IAM integration with least-privilege permissions

### Security & Compliance
- **Encryption**: KMS encryption at rest and TLS in transit with comprehensive audit trails
- **TMNA Standards**: Built-in data classification and standard TMNA tagging for organization