from django.conf import settings
from django.db import models

class Conversation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations")
    title = models.CharField(max_length=255, blank=True)
    summary = models.TextField(blank=True)
    summary_message_count = models.PositiveIntegerField(default=0)
    summary_updated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["-updated_at"]
    def __str__(self):
        return self.title or f"Conversation {self.pk}"

class Message(models.Model):
    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=20, choices=Role.choices)
    content = models.TextField()
    citations = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["created_at"]

class MemoryProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memory_profile")
    enabled = models.BooleanField(default=True)
    custom_instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Memory profile for {self.user}"

class MemoryItem(models.Model):
    class Kind(models.TextChoices):
        PREFERENCE = "preference", "Preference"
        FACT = "fact", "Fact"
        GOAL = "goal", "Goal"
        PROJECT = "project", "Project"
        INSTRUCTION = "instruction", "Instruction"
    class Source(models.TextChoices):
        USER = "user", "User-added"
        CONVERSATION = "conversation", "Conversation extraction"
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memory_items")
    kind = models.CharField(max_length=30, choices=Kind.choices)
    content = models.TextField()
    normalized_content = models.TextField()
    source = models.CharField(max_length=30, choices=Source.choices, default=Source.USER)
    source_conversation = models.ForeignKey(Conversation, null=True, blank=True, on_delete=models.SET_NULL, related_name="extracted_memories")
    source_message = models.ForeignKey(Message, null=True, blank=True, on_delete=models.SET_NULL, related_name="extracted_memories")
    active = models.BooleanField(default=True)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["kind", "-updated_at"]
        constraints = [models.UniqueConstraint(fields=["user", "kind", "normalized_content"], name="unique_user_memory")]
    def __str__(self):
        return f"{self.kind}: {self.content[:80]}"

class AgentRun(models.Model):
    class Mode(models.TextChoices):
        ASSISTANT = "assistant", "Assistant"
        RESEARCH = "research", "Research"
        WORKFLOW = "workflow", "Workflow"
    class Status(models.TextChoices):
        PLANNING = "planning", "Planning"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        BLOCKED = "blocked", "Blocked"
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agent_runs")
    conversation = models.ForeignKey(Conversation, null=True, blank=True, on_delete=models.SET_NULL, related_name="agent_runs")
    mode = models.CharField(max_length=20, choices=Mode.choices, default=Mode.ASSISTANT)
    objective = models.TextField()
    plan = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNING)
    final_answer = models.TextField(blank=True)
    citations = models.JSONField(default=list, blank=True)
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        ordering = ["-created_at"]

class AgentStep(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"
    run = models.ForeignKey(AgentRun, on_delete=models.CASCADE, related_name="steps")
    position = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    tool_name = models.CharField(max_length=80)
    tool_input = models.JSONField(default=dict, blank=True)
    tool_output = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    error = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        ordering = ["position"]
        constraints = [models.UniqueConstraint(fields=["run", "position"], name="unique_agent_run_step")]
