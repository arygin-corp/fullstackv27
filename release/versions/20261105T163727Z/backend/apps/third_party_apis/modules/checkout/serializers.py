from rest_framework import serializers
from .models import Cart, CartItem, Checkout, CheckoutItem
from .services.product_requirements import ALLOWED_CART_ITEM_FORM_FIELDS

class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(read_only=True); form_values = serializers.JSONField(source="request_form_values", read_only=True)
    class Meta:
        model=CartItem; fields=("line_key","revision","product_id","quantity","is_complete","missing_sections","form_values","validation_errors")

class CartSerializer(serializers.ModelSerializer):
    items=CartItemSerializer(many=True, read_only=True); item_count=serializers.SerializerMethodField(); incomplete_count=serializers.SerializerMethodField(); is_checkout_ready=serializers.SerializerMethodField()
    class Meta: model=Cart; fields=("id","kind","status","item_count","incomplete_count","is_checkout_ready","items")
    def get_item_count(self,obj): return obj.items.count()
    def get_incomplete_count(self,obj): return obj.items.filter(is_complete=False).count()
    def get_is_checkout_ready(self,obj): return obj.items.exists() and not obj.items.filter(is_complete=False).exists()

class CartItemFormSaveSerializer(serializers.Serializer):
    revision=serializers.IntegerField(min_value=1); form_values=serializers.DictField()
    def validate_form_values(self,value):
        unexpected=sorted(set(value)-ALLOWED_CART_ITEM_FORM_FIELDS)
        if unexpected: raise serializers.ValidationError(f"Unexpected fields: {', '.join(unexpected)}")
        return value

class CheckoutRequestSerializer(serializers.Serializer):
    cart_id=serializers.UUIDField(); idempotency_key=serializers.UUIDField(); terms_accepted=serializers.BooleanField(); requested_for=serializers.DictField(required=False)
    def validate_terms_accepted(self,value):
        if value is not True: raise serializers.ValidationError("Terms of Use must be accepted.")
        return value

class CheckoutItemSerializer(serializers.ModelSerializer):
    product_id=serializers.IntegerField(read_only=True); product_name=serializers.SerializerMethodField(); field_errors=serializers.SerializerMethodField()
    class Meta: model=CheckoutItem; fields=("line_key","product_id","product_name","status","field_errors")
    def get_product_name(self,obj): return obj.product_snapshot.get("name","")
    def get_field_errors(self,obj): return obj.source_cart_item.validation_errors if obj.status=="failed" else {}

class CheckoutSerializer(serializers.ModelSerializer):
    checkout_id=serializers.UUIDField(source="id",read_only=True); ritm_id=serializers.CharField(source="primary_ritm_id",read_only=True); ritm_number=serializers.CharField(source="primary_ritm_number",read_only=True); items=CheckoutItemSerializer(many=True,read_only=True)
    class Meta: model=Checkout; fields=("checkout_id","status","request_number","ritm_id","ritm_number","items")
