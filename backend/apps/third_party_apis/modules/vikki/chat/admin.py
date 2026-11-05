from django.contrib import admin
from .models import AgentRun, AgentStep, Conversation, MemoryItem, MemoryProfile, Message
@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display=("title","user","summary_message_count","updated_at")
    search_fields=("title","summary")
admin.site.register(Message)
@admin.register(MemoryProfile)
class MemoryProfileAdmin(admin.ModelAdmin):
    list_display=("user","enabled","updated_at")
@admin.register(MemoryItem)
class MemoryItemAdmin(admin.ModelAdmin):
    list_display=("content","kind","user","source","active","confirmed","updated_at")
    list_filter=("kind","source","active","confirmed")
@admin.register(AgentRun)
class AgentRunAdmin(admin.ModelAdmin):
    list_display=("objective","mode","user","status","created_at","completed_at")
    list_filter=("mode","status")
    search_fields=("objective","final_answer","user__username")
@admin.register(AgentStep)
class AgentStepAdmin(admin.ModelAdmin):
    list_display=("run","position","tool_name","status","completed_at")
    list_filter=("tool_name","status")
