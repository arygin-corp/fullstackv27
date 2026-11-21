This blueprint is being actively developed. As of now, we have some requirements you need to comply with in order to use the blueprint:

- AWS account where you want to deploy the blueprint
- VPC and public/private subnets created, all the connectivity on the network layer set up
- DNS subdomain delegated to your AWS account with [dns/zone-delegation module](https://github.com/Toyota-Motor-North-America/ace-aws-infra-modules-platform/tree/master/networking/dns/zone-delegation)
- To request DNS subdomain delegation please refer [chofer FAQ](https://chofer.cloud.toyota.com/docs/default/component/ace-faq/domain%20delegation/#how-to-request-a-dns-subdomain-delegation-under-toyotacom)