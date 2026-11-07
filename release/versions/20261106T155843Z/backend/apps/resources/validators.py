import mimetypes
import re
from pathlib import Path
from urllib.parse import urlsplit

from django.core.exceptions import ValidationError

MB = 1024 * 1024
BLOCKED_EXTENSIONS = {".exe", ".dll", ".bat", ".sh", ".zip", ".rar", ".7z"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg"}
DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv"}
VIDEO_EXTENSIONS = {".mp4", ".webm"}
IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/svg+xml"}
DOCUMENT_MIMES = {
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain", "text/csv",
}
VIDEO_MIMES = {"video/mp4", "video/webm"}
SVG_DANGEROUS = re.compile(rb"<(?:script|iframe|object|embed)|\bon\w+\s*=|(?:javascript|data):", re.I)


def _extension(upload):
    return Path(getattr(upload, "name", "")).suffix.lower()


def _mime(upload):
    supplied = (getattr(upload, "content_type", "") or "").lower().split(";", 1)[0]
    guessed = (mimetypes.guess_type(getattr(upload, "name", ""))[0] or "").lower()
    return supplied or guessed


def _validate_upload(upload, extensions, mimes, max_size):
    if not upload:
        return
    size = getattr(upload, "size", None)
    if size is None or size <= 0:
        raise ValidationError("Empty files are not allowed.")
    ext = _extension(upload)
    if ext in BLOCKED_EXTENSIONS:
        raise ValidationError("This file type is blocked.")
    if ext not in extensions:
        raise ValidationError("Unsupported file extension.")
    mime = _mime(upload)
    if mime not in mimes:
        raise ValidationError("File MIME type does not match an allowed type.")
    if size > max_size:
        raise ValidationError(f"File exceeds the {max_size // MB} MB limit.")
    if ext == ".svg":
        pos = upload.tell() if hasattr(upload, "tell") else None
        sample = upload.read(min(size, 2 * MB))
        if pos is not None:
            upload.seek(pos)
        if b"<svg" not in sample.lower() or SVG_DANGEROUS.search(sample):
            raise ValidationError("Unsafe SVG content.")


def validate_image_upload(upload):
    _validate_upload(upload, IMAGE_EXTENSIONS, IMAGE_MIMES, 20 * MB)


def validate_document_upload(upload):
    _validate_upload(upload, DOCUMENT_EXTENSIONS, DOCUMENT_MIMES, 100 * MB)


def validate_media_upload(upload):
    _validate_upload(upload, VIDEO_EXTENSIONS, VIDEO_MIMES, 250 * MB)


def validate_resource_attachment(upload):
    ext = _extension(upload)
    if ext in IMAGE_EXTENSIONS:
        return validate_image_upload(upload)
    if ext in DOCUMENT_EXTENSIONS:
        return validate_document_upload(upload)
    if ext in VIDEO_EXTENSIONS:
        return validate_media_upload(upload)
    raise ValidationError("Unsupported attachment type.")


def validate_resource_url(value):
    if value in (None, ""):
        return
    value = str(value).strip()
    if value.startswith("/") and not value.startswith("//"):
        return
    parsed = urlsplit(value)
    if parsed.scheme.lower() != "https" or not parsed.netloc:
        raise ValidationError("Use an HTTPS URL or an internal path beginning with '/'.")
