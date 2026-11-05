import os
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from ...key_services import generate_api_key
from ...models import APIConfiguration, EndpointGrant, FrontendApplication, PublishedEndpoint
AXON_TEMPLATE={"mainFacet":"Glossary","searchGroups":[{"operator":"START","active":True,"searches":[{"operator":"START","active":True,"facetId":"Glossary","filterGroups":[{"operator":"START","filters":[{"operator":"START","type":"ID","properties":{"field":"ID","value":"{{value}}"}}]}]}]}],"searchScopes":{"mainFacet":{"facetId":"Glossary","orderList":[{"field":"name","type":"ASC"}],"properties":{"offset":"0","limit":"1000"},"filters":[]},"relationships":[{"facetId":"Glossary","fields":[],"orderList":[{"field":"name","type":"ASC"}],"properties":{"offset":"0","limit":"10"},"filters":[]}]}}
ENDPOINTS=(("tdsp-pods","tdsp-pods",["GET"],["pods.read"]),("graph-users","graph-users",["GET"],["users.read"]),("graph-users-next","graph-users-next",["GET"],["users.read"]),("denodo-metadata-views","denodo-metadata-views",["GET"],["metadata.read"]),("axon-facet-search","axon-facet-search",["GET"],["axon.read"]),("axon-glossary","axon-glossary",["GET"],["axon.read"]),("servicenow-request-lookup","servicenow-request-lookup",["GET"],["requests.read"]),("servicenow-add-to-cart","servicenow-add-to-cart",["POST"],["cart.write"]),("servicenow-submit-cart","servicenow-submit-cart",["POST"],["cart.write"]),("servicenow-attachment-upload","servicenow-attachment-upload",["POST"],["attachments.write"]))
class Command(BaseCommand):
    help="Provision development API-key-only gateway endpoints, grants, Axon template, and optionally a key."
    def add_arguments(self,p):
        p.add_argument("--application-name",required=True); p.add_argument("--azure-client-id",required=True); p.add_argument("--allowed-origin",action="append",default=[]); p.add_argument("--owner-team",default="Platform Engineering"); p.add_argument("--issue-key",action="store_true"); p.add_argument("--key-days",type=int,default=90)
    @transaction.atomic
    def handle(self,*args,**o):
        app,_=FrontendApplication.objects.update_or_create(azure_client_id=o["azure_client_id"],defaults={"name":o["application_name"],"allowed_origins":o["allowed_origin"],"active":True})
        axon=APIConfiguration.objects.filter(slug="axon-facet-search").order_by("-version").first()
        if axon:
            axon.request_template=AXON_TEMPLATE; ready=all(os.getenv(n) for n in ("AXON_END_POINT","AXON_CLIENT_ID","AXON_CLIENT_SECRET","FACETSEARCH_END_POINT")); axon.active=ready; axon.lifecycle=APIConfiguration.Lifecycle.ACTIVE if ready else APIConfiguration.Lifecycle.DRAFT; axon.save()
        scopes=set()
        for slug,handler,methods,required in ENDPOINTS:
            ep,_=PublishedEndpoint.objects.update_or_create(public_version="v1",public_slug=slug,defaults={"name":slug,"target_type":PublishedEndpoint.TargetType.PLATFORM_HANDLER,"configuration":None,"handler_name":handler,"allowed_methods":methods,"authentication_mode":PublishedEndpoint.AuthenticationMode.API_KEY,"required_scopes":required,"owner_team":o["owner_team"],"enabled":True,"published_at":timezone.now()}); ep.full_clean(); ep.save(); EndpointGrant.objects.update_or_create(application=app,endpoint=ep,defaults={"scopes":required,"active":True,"expires_at":None}); scopes.update(required)
        if o["issue_key"]:
            generated=generate_api_key(application=app,name="Initial development gateway key",created_by=None,scopes=sorted(scopes),lifetime_days=o["key_days"]); self.stdout.write("Plaintext API key (shown once):"); self.stdout.write(generated.plaintext)
        self.stdout.write(self.style.SUCCESS(f"Provisioned {len(ENDPOINTS)} API-key-only endpoints for {app.name}."))
