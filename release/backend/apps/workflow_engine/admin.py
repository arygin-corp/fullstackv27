from django.contrib import admin
from .models import *
for model in [WorkflowDefinition,WorkflowState,WorkflowTransition,WorkflowInstance,WorkflowRole,WorkflowAssignment,Delegation,ApprovalTask,TransitionEvent,WorkflowComment,WorkflowAttachment,ElectronicSignature,SLARule,Notification,WebhookSubscription,OutboxEvent,EscalationEvent,WorkflowTemplate]:
    admin.site.register(model)

from .security_models import DedicatedStaffAssignment,WorkflowAccessPolicy,IdempotencyRecord,DurableJob,DeadLetter
for model in [DedicatedStaffAssignment,WorkflowAccessPolicy,IdempotencyRecord,DurableJob,DeadLetter]:
    try: admin.site.register(model)
    except admin.sites.AlreadyRegistered: pass

from .forms.models import DynamicForm,FormField,FormSubmission
from .marketplace.models import MarketplaceCategory,WorkflowPackage,MarketplaceListing,PackageInstallation
from .plugins.models import Plugin,PluginVersion,PluginInstallation,ConnectorAction
from .identity.models import IdentityProvider,ExternalIdentity,AttributeGrant
from .knowledge_graph.models import GraphNode,GraphEdge
from .agents.models import AgentDefinition,AgentRun,AgentReview
from .digital_twin.models import SimulationScenario,SimulationRun
from .costing.models import CostRate,CostEvent,InstanceCostSummary
from .recommendations.models import OptimizationRecommendation
from .builder.models import BuildProject,BuildRevision,BuildChecklist
for model in [DynamicForm,FormField,FormSubmission,MarketplaceCategory,WorkflowPackage,MarketplaceListing,PackageInstallation,Plugin,PluginVersion,PluginInstallation,ConnectorAction,IdentityProvider,ExternalIdentity,AttributeGrant,GraphNode,GraphEdge,AgentDefinition,AgentRun,AgentReview,SimulationScenario,SimulationRun,CostRate,CostEvent,InstanceCostSummary,OptimizationRecommendation,BuildProject,BuildRevision,BuildChecklist]:
    try: admin.site.register(model)
    except admin.sites.AlreadyRegistered: pass

from .migrations_engine.models import WorkflowMigrationPlan,InstanceMigration,MigrationBatch
from .resilience.models import ExecutionFreeze,RecoveryRun
from .records.models import RetentionPolicy,ArchivedInstance,LegalHold,DestructionCertificate
from .dependencies.models import DependencyNode,DependencyEdge,WorkflowDependency
from .portal.models import ServiceOffering,PortalCollection,SavedRequest
from .inbox.models import WorkItem,InboxPreference
from .controls.models import AutomatedControl,ControlRun
from .regulatory.models import RegulatoryPack,RegulatoryPackInstallation
from .replay.models import ReplaySession,ReplayAnnotation
from .genome.models import WorkflowGenome,WorkflowBenchmark
from .health.models import WorkflowHealthSnapshot
for model in [WorkflowMigrationPlan,InstanceMigration,MigrationBatch,ExecutionFreeze,RecoveryRun,RetentionPolicy,ArchivedInstance,LegalHold,DestructionCertificate,DependencyNode,DependencyEdge,WorkflowDependency,ServiceOffering,PortalCollection,SavedRequest,WorkItem,InboxPreference,AutomatedControl,ControlRun,RegulatoryPack,RegulatoryPackInstallation,ReplaySession,ReplayAnnotation,WorkflowGenome,WorkflowBenchmark,WorkflowHealthSnapshot]:
    try: admin.site.register(model)
    except admin.sites.AlreadyRegistered: pass

from .automation.models import AutomationFlow,AutomationNode,AutomationEdge,FlowExecution,NodeExecution,FlowSchedule,WebhookTrigger,ReusableSubflow,ExecutionQuota
from .connector_marketplace.models import Connector,ConnectorVersion,ConnectorInstallation,ConnectorReview,ConnectorCertification
from .observability_v2.models import TelemetryEvent,MetricSample,AlertRule,AlertIncident,ServiceLevelObjective
from .operations.models import OperationalCommand,Runbook,IncidentTimeline,FeatureFlag,MaintenanceWindow
from .performance.models import PerformanceScenario,PerformanceRun,CapacityBaseline
for model in [AutomationFlow,AutomationNode,AutomationEdge,FlowExecution,NodeExecution,FlowSchedule,WebhookTrigger,ReusableSubflow,ExecutionQuota,Connector,ConnectorVersion,ConnectorInstallation,ConnectorReview,ConnectorCertification,TelemetryEvent,MetricSample,AlertRule,AlertIncident,ServiceLevelObjective,OperationalCommand,Runbook,IncidentTimeline,FeatureFlag,MaintenanceWindow,PerformanceScenario,PerformanceRun,CapacityBaseline]:
    try: admin.site.register(model)
    except admin.sites.AlreadyRegistered: pass
