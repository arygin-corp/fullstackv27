# Well-Architected Scorecard: Performance Efficiency: ECS for Containerized Apps

Overall Score[<sup><u>?</u></sup>](../references/score-explanation.md "How is this score calculated?"): <sup>8</sup>&frasl;<sub>8</sub>

> "The Performance Efficiency pillar includes the ability to use computing resources efficiently to meet system requirements, and to maintain that efficiency as demand changes and technologies evolve."

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
| [PERF 1](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-sel.html) | How do you select the best performing architecture? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>Performant Architecture: The CHOFER team has evaluated the architecture and selected the most performant components for network, compute and database capabilities given the use case<br/>**Future Enhancements:**<li>Performance Testing: The performance of the architecture can be further proven via baseline performance testing |
| [PERF 2](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-compute.html) | How do you select your compute solution? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>AWS Fargate: Fargate is used with Amazon ECS to run containers without having to manage servers or clusters of Amazon EC2 instances. With AWS Fargate, there is no need to provision, configure, or scale clusters of virtual machines to run containers. This removes the need to choose server types, decide when to scale your clusters, or optimize cluster packing. <br/> **App Team to Fulfill:**<li> Application Team to appropropriately select the RDS/ECS Fargate resources for optimal performance and cost.|
| [PERF 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-storage.html) | How do you select your storage solution? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>S3 offers highly durable storage and the ALB S3 logs which can be easily archived via lifecycle policies |
| [PERF 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-db.html) | How do you select your database solution? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} | **Blueprint Provides:**<li>Amazon RDS: Amazon Relational Database Service (Amazon RDS) makes it easy to set up, operate, and scale a relational database in the cloud. It provides cost-efficient and resizable capacity while automating time-consuming administration tasks such as hardware provisioning, database setup, patching and backups. It frees you to focus on your applications, so you can give them the fast performance, high availability, security and compatibility they need |
| [PERF 5](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-network.html) | How do you configure your networking solution? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Networking: This blueprint provides option to deploy Application Load banlancer and ECS in public/private subnets, Amazon RDS in persistence subnets<br/>**App Team to Fulfill:**<li>The app team is responsible for understanding and providing valid and required subnets based on use case |
| [PERF 6](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-review.html) | How do you evolve your workload to take advantage of new releases? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Updates & Versioning: This blueprint and the underlying blueprints will be enhanced accordingly as new product offerings arise<br/>**App Team to Fulfill:**<li>App Team owns updating the IaC to leverage the latest version of available blueprints |
| [PERF 7](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-monitoring.html) | How do you monitor your resources to ensure they are performing? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Metrics: All of the included services capture metrics in CloudWatch or S3 bucket<br/>**App Team to Fulfill:**<li>KPIs and Alarms: The app team is responsible for creating KPIs and analyzing the collected metrics to setup appropriate alarms<br/>**Future Enhancements:**<li>Datadog integration is on the roadmap to provide users with enhanced observability and monitoring |
| [PERF 8](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-tradeoffs.html) | How do you use tradeoffs to improve performance? | :heavy_check_mark: | ![ACE](../references/ace_avatar.png){width="30"} ![App Team](../references/app_avatar.png){width="30"} | **Blueprint Provides:**<li>Provided Options: The blueprint provides a few tradeoffs for the app team to select based of use cases, specify ECS fargate configuration and auto scaling, to configure instance type, RAM, CPU and maximum, minimum storage of Amazon RDS<br/>**App Team to Fulfill:**<li>App Team Selections: The app team is responsible for understanding and selecting from the above options based on use case |

## References

* [Documentation Home](https://docs.aws.amazon.com/wellarchitected/latest/framework/performance-efficiency.html)
* [Design Principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-dp.html)
* [Definition](https://docs.aws.amazon.com/wellarchitected/latest/framework/perf-def.html)
