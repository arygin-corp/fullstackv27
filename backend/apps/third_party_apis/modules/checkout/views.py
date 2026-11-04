from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem, Checkout
from .serializers import CartItemFormSaveSerializer, CartItemSerializer, CartSerializer, CheckoutRequestSerializer, CheckoutSerializer
from .services.cart_validation import apply_validation, validate_cart_item
from .services.checkout_service import execute_checkout, prepare_checkout
from .services.exceptions import CartItemStaleError, CheckoutDomainError

class CurrentCartView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def get(self,request):
        cart=Cart.objects.prefetch_related("items__product").filter(owner=request.user,status="open").first()
        return Response(CartSerializer(cart).data if cart else {"id":None,"item_count":0,"incomplete_count":0,"is_checkout_ready":False,"items":[]})

class CartItemRequestFormView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def put(self,request,line_key):
        serializer=CartItemFormSaveSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            item=CartItem.objects.select_for_update().select_related("cart","product").get(line_key=line_key,cart__owner=request.user,cart__status="open")
            if item.revision != serializer.validated_data["revision"]:
                return Response({"error_code":"CART_ITEM_STALE","message":"This cart item changed in another session.","line_key":str(item.line_key),"current_revision":item.revision},status=status.HTTP_409_CONFLICT)
            result=validate_cart_item(item.product,serializer.validated_data["form_values"]); apply_validation(item,result); item.revision += 1
            item.save(update_fields=["request_form_values","request_details_complete","business_justification_complete","data_usage_complete","is_complete","missing_sections","validation_errors","revision","updated_at"])
        return Response({"item":CartItemSerializer(item).data,"cart":CartSerializer(item.cart).data})

class CheckoutSubmitView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def post(self,request):
        serializer=CheckoutRequestSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        try:
            checkout,_=prepare_checkout(request=request,**serializer.validated_data)
            checkout=execute_checkout(checkout)
        except CheckoutDomainError as exc:
            return Response({"status":"failed","error_code":exc.code,"message":exc.message,"items":exc.items},status=400)
        return Response(CheckoutSerializer(checkout).data,status=200 if checkout.status=="submitted" else 502)

class CheckoutDetailView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def get(self,request,checkout_id):
        checkout=Checkout.objects.prefetch_related("items__product").get(id=checkout_id,creator=request.user)
        return Response(CheckoutSerializer(checkout).data)
