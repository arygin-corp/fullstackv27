# Well-Architected Scorecard: [TMNA] Security Accreditation: ECS for Containerized Apps

Overall Score[<sup><u>?</u></sup>](../references/score-explanation.md "How is this score calculated?"): <sup>7</sup>&frasl;<sub>7</sub>

> This pillar is not an AWS Well-Architected pillar but rather a collection of security requirements for TMNA.
>
> Each AWS resource included in the blueprint must have the corresponding security accreditation requirements listed and satisfied below. While some considerations may not be applicable (such as terraform state bucket policy that must be provided by the App team), all applicable considerations must be satisfied.
>
> For detailed information regarding the specifics of the security accreditation checklist, please see the link to the TMNA confluence in the [References](#references) section below. Note that this checklist is a living document and requirements may change over time. If discrepancies are noted between the live checklist and the scorecard below, please reach out to [Advanced_Cloud_Engineering](mailto:Advanced_Cloud_Engineering@toyota.com)

## Scorecard

> _Note: The below considerations are taken from TMNA Confluence. Only the sections of applicable AWS services should be included._

??? note "Icon Legend"
    - Applicable
      - :x:
      - :heavy_check_mark:
    - Satisfied
      - ![ACE](../references/ace_avatar.png){width="30"} = By Blueprint
      - ![App Team](../references/app_avatar.png){width="30"} = By App Team
      - ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} = Requires Both Blueprint and App Team
       - :x: = Not Satisfied

| Number | Consideration | Applicable[<sup><u>?</u></sup>](../references/score-explanation.md#applicable) | Satisfied[<sup><u>?</u></sup>](../references/score-explanation.md#satisfied) | Comments[<sup><u>?</u></sup>](../references/score-explanation.md#comments) |
| :--: | :-- | :--: | :--: | :-- |
| [Terraform](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-Terraform) | Is Terraform state locked down and sanitized to ensure secured data is not stored in plain text? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Secured Data: The blueprint does not require or produce any secured data in plain text within the state<br/>**App Team to Fulfill:**<li>Terraform State Bucket: The app team is responsible for providing and securing the Terraform state bucket<li>Securing Variables: The app team is responsible for not entering any secured data as plain text variables |
| [Security](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-Security) | Does your AWS account have TMNA security standard controls configured and active? | :x: | | |
| [CloudFront](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-CloudFront) | Does CloudFront utilize appropriate network security, logging, and OAI? | :x: | | |
| [WAF](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-AWSWAF(WebApplicationFirewall)) | Is the AWS WAF set to use AWS managed rulesets (with possible extensions) and have access locked down to prevent introduced vulnerabilities? | :x: | | |
| [API Gateway](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-APIGateway) | Is the API Gateway appropriately locked down and use encryption for data in transit? | :x: | | |
| [S3](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-S3) | Do S3 buckets utilize encryption, logging, and least-privilege to secure data? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Least Privilege: Load Balancers log buckets are restricted to only required principals<li>Encryption: Server-side encryption at rest and HTTPS connections for encryption in transit are utilized<li>Logging: Access and object-level logging is enabled<li>Public Access Restricted: All S3 buckets block public access<br/>**App Team to Fulfill:**<li>VPC Endpoint: The app team is responsible for deploying in an environment with a S3 VPC endpoint<li>Security Review: The app team must provide all relevant bucket policies and IAM policies to the security team for review |
| [Lambda](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-Lambda) | Does the Lambda utilize least privilege in IAM and networking and are variables appropriately secured? | :x: | | |
| [ECS / Fargate / EKS / ECR](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-ECS/Fargate/EKS/ECR) | Does your containerized solution follow TMNA security standards for secure container access, encryption, and secrets management? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li> ECS Blueprint can be used to provision any containerized application using Amazon ECS on AWS Fargate<li>ECS is accessible only via Load Balancers, restricted to only required principals. Deployed in private subnets<li>Security Groups: Access via only the specified inbound IP addresses<br/>**App Team to Fulfill:**<li>The app team is responsible to ensure the containerized app is adhering to security standards. |
| [IAM](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-IdentityandAccessManagement(IAM)) | Do you use IAM Roles over Users and utilize least-privilege? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Least Privilege Roles: All AWS services utilize IAM roles with least privilege policies<br/>**App Team to Fulfill:**<li>Securing AWS Account: The app team is responsible for ensuring no Users are created with access to the blueprint's resources |
| [VPC](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-VirtualPrivateCloud(VPC)) | Does your VPC utilize endpoints & flow logs? | :x: | | |
| [SFTP](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-AWSSFTP) | Does your SFTP solution use least privilege and scope user data? | :x: | | |
| [DynamoDB](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-DynamoDB) | Does DynamoDB use encryption, least privilege, and VPC endpoints? | :x: | | |
| [RDS](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-RDS) | Does RDS use least privilege and encryption in transit and at rest? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>Least Privilege: Amazon RDS restricted to only required principals. Deployed in private subnets accessible only via respective ECS service<li>Encryption: Amazon RDS does encrypt your Amazon RDS DB instances. Data that is encrypted at rest includes the underlying storage for DB instances, its automated backups, read replicas, and snapshots. Data that is in transit between the source and the read replicas is encrypted |
| [Secret Manager](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-SecretManager) | Does Secret Manager use least privilege and encryption at rest? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>Least Privilege: Secret manager restricted to only required principals. Encryption enabled in rest |
| [Parameter Store](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-ParameterStore) | Does Parameter Store use least privilege and encryption at rest? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>Least Privilege: Parameter Store restricted to only required principals. Encryption enabled in rest |
| [EMR](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-AmazonEMR) | Does EMR use least privilege, encryption in transit and at rest, the Toyota hardened AMI, and VPC endpoints? | :x: | | |
| [EFS](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-EFS) | Does EFS use least privilege, encryption, and VPC endpoints? | :x: | | |
| [SageMaker](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-SageMaker) | Does SageMaker use encryption with KMS CMKs and live within a private VPC? | :x: | | |
| [Kinesis Firehose](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-KinesisFirehose) | Does Kinesis have server side and in flight encryption enabled? | :x: | | |
| [Elastic Search](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-ElasticSearch) | Does Elastic Search have enryption in transit and at rest enabled? | :x: | | |
| [Glue](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-Glue) | Does Glue use least privilege and server side encryption? | :x: | | |
| [EC2](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-EC2) | Does EC2 use EBS encryption, least privilege IAM roles, and tightened security groups? | :x: | | |
| [Step Function](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-StepFunction) | Does your Step Function use least privilege IAM roles? | :x: | | |
| [SNS](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670#AccreditationChecklist(AWS)-SNS) | Does your SNS encrypt messages? | :x: | | |

## References

* [Security Accreditation Confluence](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670)
