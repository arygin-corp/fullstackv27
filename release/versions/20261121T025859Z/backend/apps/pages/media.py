import hashlib
from django.core.exceptions import ValidationError
from .models import MediaAsset
ALLOWED={"image/jpeg","image/png","image/webp","application/pdf"};MAX_SIZE=20*1024*1024
def save_asset(upload,user,alt_text=""):
    if upload.content_type not in ALLOWED: raise ValidationError("Unsupported file type.")
    if upload.size>MAX_SIZE: raise ValidationError("File exceeds 20 MB.")
    h=hashlib.sha256()
    for chunk in upload.chunks():h.update(chunk)
    upload.seek(0);return MediaAsset.objects.create(file=upload,original_name=upload.name,content_type=upload.content_type,size=upload.size,alt_text=alt_text,checksum=h.hexdigest(),uploaded_by=user)
