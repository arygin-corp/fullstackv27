# Well-Architected Scorecard: Security: ECS for Containerized Apps

Overall Score[<sup><u>?</u></sup>](../references/score-explanation.md "How is this score calculated?"): <sup>8</sup>&frasl;<sub>8</sub>

> "The Security pillar encompasses the ability to protect data, systems, and assets to take advantage of cloud technologies to improve your security."

## Scorecard

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
| [SEC 1](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-security.html) | How do you securely operate your workload? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>General Security: The blueprint is kept up to date to handle the latest security threats & recommendations for general security threats<br/>**App Team to Fulfill:**<li>App Team Responsibility: Securing AWS accounts and what workloads are deployed to them. Updating to latest blueprint versions.Review threats specific to their use case <br/>**Future Enhancements:**<li>Automated Testing: Automated testing will improve general security handling |
| [SEC 2](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-iam.html) | How do you manage authentication for people and machines? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} [App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Amazon RDS: The blueprint creates master credential for Amazon RDS<br/>**App Team to Fulfill:**<li>Authentication: The app team is responsible for enabling authentication and permissions for their respective application access |
| [SEC 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-iam.html) | How do you manage permissions for people and machines? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>IAM Roles: Blueprint provides inbuilt IAM policies and roles for allowing ECS, RDS to execute workload<br/>**App Team to Fulfill:**<li>App team to ensure building authentication/authorization to secure the application<li>App team need to ensure bulding IAM policies with least privilege as per their application requirment |
| [SEC 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-detection.html) | How do you detect and investigate security events? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Logs: The blueprint configures execution & access logs as well as CloudWatch metrics for all services<br/>**App Team to Fulfill:**<li>Analysis & Alerting: The app team is responsible for analyzing collected logs and metrics as well as creating alerts appropriate for their use case to detect security events. Ideally, responses to these events should also be automated to reduce effort & error<br/>**Future Enhancements:**<li>Provides visibility into these metrics through a Datadog dashboard. Such as Load Balancers, RDS and ECS Logs |
| [SEC 5](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-infrastructure.html) | How do you protect your network resources? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>VPC: The blueprint provides the infrastructure and option to configure all services with in a VPC with a Security Group<li>SSL Certificate enabled, only secure connections allowed<br/>**App Team to Fulfill:**<li>VPC: The app team must configure VPC and required subnets for their use case |
| [SEC 6](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-infrastructure.html) | How do you protect your compute resources? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>VPC: This blueprint creates all Compute resources with in the provided VPC |
| [SEC 7](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-dataprot.html) | How do you classify your data? | :x: | | <li>Not Applicable: There is no data in the blueprint to classify |
| [SEC 8](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-dataprot.html) | How do you protect your data at rest? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>Encryption: Amazon RDS as well as all logs uses encryption at rest. Encryption keys are stored securely in KMS & certificats are stored securely in ACM<li>Least Privilege: Access to data is granted on a least privilege basis<br/>**Future Enhancements:**<li>Testing: Tests (ideally automated) verifying that there are only encrypted storage resources |
| [SEC 9](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-dataprot.html) | How do you protect your data in transit? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>Encryption: Load Balancers encrypts HTTP payloads in transit via TLS across all communication |
| [SEC 10](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-incresp.html) | How do you anticipate, respond to, and recover from incidents? | :x: | ![App Team](../references/app_avatar.png){width="30"} | <li>Not Applicable: The blueprint does not presuppose app context to determine how to recover from incidents<br/>**App Team to Fulfill:**<li>Incident Planning: The app team must plan for incident response and recovery |

## References

* [Documentation Home](https://docs.aws.amazon.com/wellarchitected/latest/framework/security.html)
* [Design Principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-design.html)
* [Definition](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-def.html)
