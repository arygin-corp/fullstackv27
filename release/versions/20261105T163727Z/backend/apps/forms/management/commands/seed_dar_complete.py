from django.core.management.base import BaseCommand
from apps.forms.models import FormDefinition,FormSection,FormField,FieldOption,FieldType
class Command(BaseCommand):
    help="Seed a non-destructive starter DAR form."
    def handle(self,*a,**k):
        form,_=FormDefinition.objects.update_or_create(slug="data-access-request",defaults={"name":"Data Access Request","version":2,"is_active":True,"is_published":True});section,_=FormSection.objects.update_or_create(form=form,title="Request information",defaults={"order":10,"is_active":True})
        specs=[("requesting_id","Who are you requesting data access for?",FieldType.SELECT),("v_dar_platform","Platform",FieldType.SELECT),("v_dar_dataDomainSelect","Data Domain",FieldType.SELECT),("v_dar_environment","Environment",FieldType.SELECT),("v_dar_DataReqDescription","Data Request Description",FieldType.TEXTAREA),("v_dar_businessJustification","Intended Use",FieldType.TEXTAREA),("chk_dar_terms_message","I have read and accepted the Terms of Use",FieldType.CHECKBOX)]
        fields={}
        for n,(key,label,typ) in enumerate(specs,10):fields[key],_=FormField.objects.update_or_create(form=form,key=key,defaults={"section":section,"label":label,"field_type":typ,"order":n,"required":True,"is_active":True,"default_value":False if typ==FieldType.CHECKBOX else None})
        for value,label in [("Me","For me"),("User","For someone else")]:FieldOption.objects.update_or_create(field=fields["requesting_id"],value=value,defaults={"label":label,"is_active":True})
        self.stdout.write(self.style.SUCCESS(f"Seeded {form}"))
