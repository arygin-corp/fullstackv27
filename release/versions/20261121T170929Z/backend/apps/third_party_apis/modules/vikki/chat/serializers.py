from rest_framework import serializers

class ChatRequestSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=8000)
    product_id = serializers.IntegerField(required=False, allow_null=True)
    conversation_id = serializers.IntegerField(required=False, allow_null=True)
    session_id = serializers.CharField(required=False, allow_blank=True, max_length=200)
    page_context = serializers.JSONField(required=False)


class FeedbackSerializer(serializers.Serializer):
    sessionId = serializers.CharField(required=False, allow_blank=True)
    conversationId = serializers.IntegerField(required=False, allow_null=True)
    type = serializers.ChoiceField(choices=("positive", "negative"))
    lastQuery = serializers.CharField(required=False, allow_blank=True)
    lastAnswer = serializers.CharField(required=False, allow_blank=True)
    userCorrection = serializers.CharField(required=False, allow_blank=True)
    productId = serializers.IntegerField(required=False, allow_null=True)

