import csv
import json
from datetime import date, datetime
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views import View
from .analytics_context import build_request_source_context
from .pdf_report import build_analytics_pdf

class AnalyticsExportView(View):
    """Add this class to the existing `dar-admin:analytics-export` URL."""
    def get(self, request):
        start = request.GET.get("start") or None
        end = request.GET.get("end") or None
        output_format = (request.GET.get("format") or "pdf").lower()
        context = build_request_source_context(start=start, end=end, include_all_requests=True)
        report = {**context, "start_date": start, "end_date": end, "generated_at": timezone.localtime().strftime("%Y-%m-%d %H:%M %Z"), "requests": context.get("all_requests", context.get("recent_requests", []))}
        stamp = timezone.localdate().isoformat()
        if output_format == "pdf":
            response = HttpResponse(build_analytics_pdf(report), content_type="application/pdf")
            response["Content-Disposition"] = f'attachment; filename="dar-request-analytics-{stamp}.pdf"'
            return response
        rows = report["requests"]
        if output_format == "json":
            return JsonResponse(rows, safe=False, json_dumps_params={"default": str})
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="dar-request-analytics-{stamp}.csv"'
        writer = csv.DictWriter(response, fieldnames=["source","request_id","title","status","requester","created_at"])
        writer.writeheader()
        for row in rows: writer.writerow({key: row.get(key, "") for key in writer.fieldnames})
        return response
