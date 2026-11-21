import csv,json
from django.http import HttpResponse
from .models import Page
def export_pages(queryset):
 response=HttpResponse(content_type="text/csv"); response["Content-Disposition"]='attachment; filename="pages.csv"'; w=csv.writer(response); w.writerow(["title","slug","page_type","locale","owner","archived","deleted"])
 for p in queryset:w.writerow([p.title,p.slug,p.page_type,p.locale,p.product_owner_group_name,p.is_archived,p.is_deleted])
 return response
def parse_import(upload):
 text=upload.read().decode("utf-8"); rows=list(csv.DictReader(text.splitlines())); required={"title","slug","page_type","locale"}
 if rows and not required.issubset(rows[0]): raise ValueError("Missing required columns.")
 return rows
