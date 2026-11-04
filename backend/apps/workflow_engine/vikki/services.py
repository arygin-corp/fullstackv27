import hashlib

from ..platform_models import AIInteraction


class VikkiProvider:
    """Provider contract for Toyota's Workflow Vikki AI integration."""

    def generate_json(self, instruction, schema, context):
        raise NotImplementedError


class WorkflowVikki:
    """AI-assisted workflow authoring with mandatory human review."""

    def __init__(self, provider, provider_name="vikki", model="configured"):
        self.provider = provider
        self.provider_name = provider_name
        self.model = model

    def create_blueprint(self, *, instruction, user=None, tenant=None, context=None):
        schema = {
            "workflow": {},
            "states": [],
            "transitions": [],
            "forms": [],
            "rules": [],
            "roles": [],
            "slas": [],
            "tests": [],
        }
        result = self.provider.generate_json(instruction, schema, context or {})
        AIInteraction.objects.create(
            tenant=tenant,
            user=user,
            purpose="vikki_end_to_end_workflow_blueprint",
            provider=self.provider_name,
            model=self.model,
            prompt_hash=hashlib.sha256(instruction.encode()).hexdigest(),
            response=result,
            safety_metadata={
                "human_review_required": True,
                "publish_blocked_until_review": True,
                "assistant_name": "Vikki",
            },
        )
        return result

    def explain(self, workflow):
        return {
            "key": workflow.key,
            "version": workflow.version,
            "states": [state.key for state in workflow.states.all()],
            "transitions": [transition.key for transition in workflow.transitions.all()],
        }
