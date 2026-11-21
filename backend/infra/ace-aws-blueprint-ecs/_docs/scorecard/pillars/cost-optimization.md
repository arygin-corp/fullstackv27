# Well-Architected Scorecard: Cost Optimization: ECS for Containerized Apps

Overall Score[<sup><u>?</u></sup>](../references/score-explanation.md "How is this score calculated?"): <sup>4</sup>&frasl;<sub>5</sub>

> "The Cost Optimization pillar includes the ability to run systems to deliver business value at the lowest price point."

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
| [COST 1](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-cfm.html) | How do you implement cloud financial management? | :x: | ![App Team](../references/app_avatar.png){width="30"} | <li>Not Applicable: Financial management is handled within the app team and account setup. Costs can be [viewed on Chofer](https://chofer.cloud.toyota.com/cost-center) |
| [COST 2](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-aware.html) | How do you govern usage? | :x: | ![App Team](../references/app_avatar.png){width="30"} | <li>Not Applicable: The blueprint sets up the architecture but does not include governing usage of the resources which should be handled by the app team |
| [COST 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-aware.html) | How do you monitor usage and cost? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Logs & Metrics: Logs & metrics from all services are collected within S3 and CloudWatch for insight into usage information <li>The Database logs is being logged to CloudWatch.<li>Container Insights is capturing ECS Cluster logs.<li>Tagging: Org info is tagged on all AWS resources to facilitate better analysis of billing information.<br/>**App Team to Fulfill:**<li>Billing & Cost Management: App teams should leverage [Chofer's](https://chofer.cloud.toyota.com/cost-center) & AWS's billing & cost management tools to regularly review usage and cost info as well as create additional metrics appropriate to their use case to better allocate costs based on thier needs <br/>**Future Enhancements:**<li>The blueprint wil be enchanced to configure Cloudtrail which would deliver logs to S3<li>Datadog integration is on the roadmap to provide users with enhanced observability and monitoring<li>Metrics could be created to monitor usage.|
| [COST 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-aware.html) | How do you decommission resources? | :x: | ![App Team](../references/app_avatar.png){width="30"} | **App Team to Filfill:**<li>Terraform: As the blueprint uses IaC through Terraform, the blueprint can be torn down with `terraform destroy`. TDP pipeline provides capability to destroy resources and this operation is owned by the App team.<li>Note: It is not recommended that individual components be decommisioned from this architecture |
| [COST 5](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-cereso.html) | How do you evaluate cost when you select services? | :heavy_check_mark: | ![App Team](../references/app_avatar.png){width="30"} |**App Team to Filfill:**<li>Not Satisfied: Cost analyses of chosen services are not included with this blueprint, instead relying on general best practice architecture. In the future, cost analyses of these services can be included to create visibility of the evaluation process<li>Managed Services: All included services are managed by AWS and utilize Pay-Per-Value pricing model which ensures teams are only paying for what they use. Such as ALB, Route53 and DNS<li>Resources ECS, RDS are configurable as per the App team use cases |
| [COST 6](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-cereso.html) | How do you meet cost targets when you select resource type, size and number? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Compute Resources: ECS pricing is based on no of tasks and configuration, The blueprint allows to configure the variables appropriately so as not to incur excessive costs<li>RDS: RDS pricing is based on instance configuration, The blueprint allows to configure the variables appropriately so as not to incur excessive costs <br/>**App Team To Fulfill:**<li>  The app team to identify their cost targets and configure the variables appropriately so as not to incur excessive costs |
| [COST 7](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-cereso.html) | How do you use pricing models to reduce cost? | :x: | | <li>Not Applicable: The blueprint does not presuppose usage patterns to generate pricing models |
| [COST 8](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-cereso.html) | How do you plan for data transfer charges? | :x: | ![App Team](../references/app_avatar.png){width="30"} | <li>Not Applicable: The blueprint does not presuppose usage patterns to understand data transfer charges<br/>**App Team To Fulfill:**<li>App Team Modeling: The app team is responsible for understanding its use case and the amount & cost of data that may be transferred |
| [COST 9](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-mandem.html) | How do you manage demand, and supply resources? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>Auto Scaling: ALB, RDS, and ECS auto scale and throttle to help manage demand and handle the amount of traffic to the Application <br/>**App Team To Fulfill:**<li>  The app team to control the appropriately usage of the resources configured to control cost and application requirement so as not to incur excessive costs |
| [COST 10](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-opti.html) | How do you evaluate new services? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>Enhancements: The blueprint will be enhanced and new versions released as new services come about and are evaluated by CHOFER |

## References

* [Documentation Home](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-optimization.html)
* [Design Principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-dp.html)
* [Definition](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-def.html)
