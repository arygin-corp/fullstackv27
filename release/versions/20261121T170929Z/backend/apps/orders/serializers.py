from rest_framework import serializers

from .models import MarketplaceOrder, Request, Task


class OrderHistoryTaskSerializer(serializers.ModelSerializer):
    task_number = serializers.CharField(source="number")

    class Meta:
        model = Task
        fields = (
            "task_number",
            "state",
            "assignment_group",
            "assignment_group_manager",
            "assigned_to",
            "created",
            "due",
        )


class OrderHistoryRequestSerializer(serializers.ModelSerializer):
    request_number = serializers.CharField(source="number")
    tasks = OrderHistoryTaskSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = (
            "request_number",
            "ritm_id",
            "ritm_number",
            "product_id",
            "approval_stage",
            "ritm_state",
            "stage",
            "opened_at",
            "closed_at",
            "tasks",
        )


class NestedOrderHistorySerializer(serializers.ModelSerializer):
    requests = OrderHistoryRequestSerializer(many=True, read_only=True)

    class Meta:
        model = MarketplaceOrder
        fields = (
            "marketplace_order_id",
            "sync_status",
            "created_at",
            "updated_at",
            "requests",
        )
