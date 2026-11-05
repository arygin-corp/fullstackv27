from django.contrib.auth import get_user_model
from django.test import TestCase
from workflow_engine.conditions import evaluate
from workflow_engine.models import WorkflowDefinition,WorkflowState,WorkflowTransition
from workflow_engine.services import DefinitionService,WorkflowEngine,WorkflowValidator
class EnterpriseTests(TestCase):
    def setUp(self):
        self.user=get_user_model().objects.create_user(username='owner')
        self.w=WorkflowDefinition.objects.create(name='Governance',key='governance')
        self.a=WorkflowState.objects.create(workflow=self.w,name='Draft',key='draft',is_initial=True)
        self.b=WorkflowState.objects.create(workflow=self.w,name='Done',key='done',is_terminal=True)
        WorkflowTransition.objects.create(workflow=self.w,name='Finish',key='finish',source=self.a,target=self.b,condition={'op':'gte','field':'context.score','value':10})
    def test_condition(self): self.assertTrue(evaluate({'op':'gte','field':'context.score','value':10},{'context':{'score':12}}))
    def test_validate_publish_and_run(self):
        self.assertEqual(WorkflowValidator.validate(self.w),[]); DefinitionService.publish(self.w); instance=WorkflowEngine.start(workflow=self.w,actor=self.user,context={'score':12}); result=WorkflowEngine.transition(instance=instance,transition_key='finish',actor=self.user); self.assertEqual(result.instance.status,'completed')
