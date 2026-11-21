# Well-Architected Scorecard: ECS for Containerized Apps

**Overall Score[<sup><u>?</u></sup>](./references/score-explanation.md "How is this score calculated?"): <sup>40</sup>&frasl;<sub>44</sub>**

*Disclaimer:* All scoring is performed within the scope of the blueprint itself. This will account for only the considerations that are applicable to the blueprint, and the applicable considerations will only be considered from within the scope of the blueprint. All considerations (applicable to the blueprint or not) should be considered applicable and holisticly by the App Team within the context of the entire application. This scorecard is only giving the scoped review of the blueprint in isolation.

## Section Summary

> For more detailed breakdowns of each pillar, please use the links below

| WA Pillar | Highlights | Applicable Considerations[<sup><u>?</u></sup>](./references/score-explanation.md#applicable-considerations "What do the applicable considerations numbers mean?") | Score[<sup><u>?</u></sup>](./references/score-explanation.md "How is this score calculated?") |
| :--: | :-- | :--: | :--: |
| [Operational Excellence](./pillars/operational-excellence.md) | <li>The app team must consider the priorities, organization, and culture of the team to determine alignment with the overall architecture<li>The blueprint collects logs and metrics, but the app team must convert those to meaningful KPIs<li>IaC, Testing, and CI/CD mitigate risks and reduce defects | <sup>4</sup>&frasl;<sub>11</sub> | <sup>3</sup>&frasl;<sub>4</sub> |
| [Security](./pillars/security.md) | <li>ECS Task deployed by blueprint uses an IAM Role with the least privilege permissions defined by the app team through blueprint parameters <li>The blueprint will protect compute resource by deploying ECS running tasks in private subnets and RDS Database in persistence subnet of a TMNA Standard/Spoke VPC<li>Metrics and logs are collected across all services, but the app team must provide meaningful alerts and responses within the greater application context | <sup>8</sup>&frasl;<sub>10</sub> | <sup>8</sup>&frasl;<sub>8</sub> |
| [Reliability](./pillars/reliability.md) | <li>High Availability:Fargate automatically ensures tasks are spread across AZs which helps provide HA <li>While the blueprint is designed within [AWS Service Quotas](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html), the application team must evaluate how application usage will affect these quotas<li>Multi-AZ is used for high availability, although multi-region is not supported<li>Testing and planning for failure and disaster recovery should be handled by the app team within the application's context | <sup>12</sup>&frasl;<sub>13</sub> | <sup>10</sup>&frasl;<sub>12</sub> |
| [Performance Efficiency](./pillars/performance-efficiency.md) | <li>Blueprint brings in performant architecture and leverages AWS managed services, thereby providing greater performance. App Team needs to decide capacity as per the workload<li>Amazon Relational Database Service (Amazon RDS) makes it easy to set up, operate, and scale a relational database in the cloud. It provides cost-efficient and resizable capacity while automating time-consuming administration tasks such as hardware provisioning, database setup, patching and backups. It frees you to focus on your applications, so you can give them the fast performance, high availability, security and compatibility they need | <sup>8</sup>&frasl;<sub>8</sub> | <sup>8</sup>&frasl;<sub>8</sub> |
| [Cost Optimization](./pillars/cost-optimization.md) | <li>All resources are tagged with TMNA standard tags and organization to facilitate better billing/cost transparency<li>The Blueprint provides option to choose ECS configurations such as CPU,Memory which are factors for pricing.App team can configure according their need and helps in cost optimization.<li>Auto-scaling and pay-per-value billing for AWS services reduce overall costs by scaling according to demand<li>A full cost analysis is not currently available.Although the ECS tasks are being logged to CloudWatch,but not supporting metrics and monitoring | <sup>5</sup>&frasl;<sub>10</sub> | <sup>4</sup>&frasl;<sub>5</sub> |
| [[TMNA] Security Accreditation](./pillars/security-accreditation.md) | <li>Security Accreditation is the responsibility of the app team<li>The blueprint is compliant to applicable security guidelines such as encryption of data in transit and at rest, however the architecture must be reevaluated within the context and usage of the app team | <sup>7</sup>&frasl;<sub>24</sub> | <sup>7</sup>&frasl;<sub>7</sub> |

### Not Applicable Sections

| WA Pillar | Highlights | Applicable Considerations[<sup><u>?</u></sup>](./references/score-explanation.md#applicable-considerations "What do the applicable considerations numbers mean?") | Score[<sup><u>?</u></sup>](./references/score-explanation.md "How is this score calculated?") |
| :--: | :-- | :--: | :--: |
| [Sustainability](./pillars/sustainability.md) | <li>Sustainability & environmental impact is not currently a targeted pillar for TMNA/CHOFER blueprints | <sup>0</sup>&frasl;<sub>0</sub> | <sup>0</sup>&frasl;<sub>0</sub> |

## References

* [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
* [[TMNA] Security Accreditation Confluence](https://confluence.sdlc.toyota.com/pages/viewpage.action?pageId=164062670)
