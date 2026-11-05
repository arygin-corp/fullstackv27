from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.text import slugify
from django.views.decorators.http import require_POST

from apps.knowledge.forms import DocumentUploadForm, KnowledgeTextForm
from apps.knowledge.models import Document
from apps.knowledge.services import ingest_document


def _page(request, upload_form, text_form):
    documents = request.user.knowledge_documents.all()
    return render(request, "gdx_admin/apps/third_party_apis/vikki_learning.html", {
        "upload_form": upload_form,
        "text_form": text_form,
        "documents": documents,
        "staff_page_kicker": "VIKKI",
        "staff_page_title": "Vikki learning",
        "staff_page_description": "Upload a file or write text for Vikki to use as knowledge.",
        "staff_page_heading": "Teach Vikki",
        "staff_page_heading_text": "Files and written notes are indexed for this account.",
        "staff_page_metric_label": "Sources",
        "staff_page_metric_value": str(documents.count()),
        "staff_page_metric_caption": "saved for Vikki",
    })


def _save_and_index(request, document):
    document.owner = request.user
    document.save()
    try:
        ingest_document(document)
    except Exception as exc:
        document.source_file.delete(save=False)
        document.delete()
        messages.error(request, str(exc))
        return False
    messages.success(request, f"Vikki can now use “{document.title}”.")
    return True


@login_required
def vikki_learning(request):
    upload_form = DocumentUploadForm()
    text_form = KnowledgeTextForm()
    if request.method == "POST" and "source_file" in request.FILES:
        upload_form = DocumentUploadForm(request.POST, request.FILES)
        if upload_form.is_valid():
            document = upload_form.save(commit=False)
            if not document.title:
                document.title = upload_form.cleaned_data["source_file"].name
            if _save_and_index(request, document):
                return redirect("third_party_api_pages:vikki_learning")
    elif request.method == "POST":
        text_form = KnowledgeTextForm(request.POST)
        if text_form.is_valid():
            document = Document(title=text_form.cleaned_data["title"])
            filename = f"{slugify(document.title) or 'vikki-note'}.txt"
            document.source_file.save(filename, ContentFile(text_form.cleaned_data["body"].encode("utf-8")), save=False)
            if _save_and_index(request, document):
                return redirect("third_party_api_pages:vikki_learning")
    return _page(request, upload_form, text_form)


@login_required
@require_POST
def delete_vikki_learning(request, document_id):
    document = get_object_or_404(request.user.knowledge_documents, pk=document_id)
    document.source_file.delete(save=False)
    document.delete()
    messages.success(request, "That knowledge source was removed.")
    return redirect("third_party_api_pages:vikki_learning")
