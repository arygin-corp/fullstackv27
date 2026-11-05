from django.contrib import admin
from .models import ProductFeedback

@admin.register(ProductFeedback)
class ProductFeedbackAdmin(admin.ModelAdmin):
    list_display = ("product_name", "was_helpful", "user_ip", "timestamp")
    list_filter = ("was_helpful", "timestamp")
    search_fields = ("product_name", "user_ip")
