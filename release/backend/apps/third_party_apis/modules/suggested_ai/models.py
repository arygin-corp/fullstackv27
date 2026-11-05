from django.db import models


class SearchQuery(models.Model):
    query = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

class ProductFeedback(models.Model):
    product_name = models.CharField(max_length=255)
    slug = models.SlugField()
    was_helpful = models.BooleanField()
    user_ip = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)


# --- NEW AI MODELS ---

class ProductEmbedding(models.Model):
    product_name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    vector = models.JSONField()
    metadata = models.TextField(blank=True)

    def __str__(self):
        return self.product_name

class HistoricalRequestEmbedding(models.Model):
    product = models.ForeignKey(ProductEmbedding, on_delete=models.CASCADE, related_name='historical_asks')
    request_text = models.TextField()
    vector = models.JSONField()

    def __str__(self):
        return f"History: {self.product.product_name}"
