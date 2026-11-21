* For ACM certificates for private zones, it is necessary to use a public zone to host the challenge DNS records AWS uses to verify domain ownership.  The private zone must be a subdomain of the public zone. Set route53_private_zone to true, route53_zone_name to the name of the public zone, and route53_zone_name_private to the name of the private zone. For example, to create a private record in private zone myinternal.myapp.toyota.com, you must specify myapp.toyota.com as var.route53_zone_name, myinternal.myapp.toyota.com as var.route53_zone_name_private and var.route53_private_zone as true.
* To access applications from Toyota laptops outside the organization without using the internet, use **_zScaler Private Access (ZPA)_**, a cloud-based security service. To access application through Zscaler Remote Access, submit [1TS](https://tmna.service-now.com/1ts?id=1ts_cat_item&sys_id=ba5afe7adb9f2050df739d4b8a961951) request for **_ZPA (Zscaler Private Access) Remote Access (TMNA)_**. For more information on **_zScaler Onboarding_**, click [here](https://toyota.atlassian.net/wiki/spaces/HTT/pages/293766749/zScaler+Onboarding+Process).
* For WAF, when you enable advanced_managed_rules, you take complete control of the AWS Managed Rules.  You are responsible for implementing, at a minimum, the required Managed Rules as found in the [AWS Requirements](https://toyota.atlassian.net/wiki/spaces/CSTG/pages/297739017/AWS+Requirements#AWS-WAF-(Web-Application-Firewall)).  This is not needed for normal use cases.  If you decide to override the Managed Rules with advanced_managed_rules, you must: not enable Allow - either Block, or if required for application, Count -  and notify your SEE team to review your rules.
* example `advanced_managed_rules`:
```hcl
advanced_managed_rules = {
    AWSManagedRulesKnownBadInputsRuleSet = {
        priority             = 0
        override_action      = "none"
        rule_action_override = []
    },
    AWSManagedRulesCommonRuleSet = {
        priority             = 1
        override_action      = "none"
        rule_action_override = [{
            action_to_use = [{count = [{}]}]
            name = "SizeRestrictions_BODY"
        },
        {
            action_to_use = [{
                count = [{
                    custom_request_handling = [{
                        insert_header = {
                            name = "x-test-large-cookie"
                            value = "test"
                        }
                    }]
                }]
            }]
            name = "SizeRestrictions_Cookie_HEADER"
        }]
    },
    AWSManagedRulesAmazonIpReputationList = {
        priority             = 2
        override_action      = "none"
        rule_action_override = []
    }
}
```
### Inbound security group rule behavior

* If `inbound_cidr_blocks` is provided (non-empty), the module creates an ingress rule for those CIDRs.
* If `inbound_cidr_blocks` is empty and `enable_vpc_cidr_inbound = true`, the module will create an ingress rule that allows the VPC CIDR.
* If `inbound_cidr_blocks` is empty and `enable_vpc_cidr_inbound = false`, no CIDR-based ingress rule is created (the security group will have no inbound rules by default).
* If `existing_security_group_ids` is provided (non-empty), the module will create no CIDR-based ingress rules and uses the provided security groups as is.