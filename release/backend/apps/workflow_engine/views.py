from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class WorkflowViewMixin(LoginRequiredMixin):
    login_url = "login"
    redirect_field_name = "next"
    page_title = "Workflow Engine"
    page_description = ""
    section = "workflow"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.setdefault("page_title", self.page_title)
        context.setdefault("page_description", self.page_description)
        context.setdefault("active_section", self.section)
        context.setdefault("items", [])
        context.setdefault("metrics", [])
        context.setdefault("activities", [])
        context.setdefault("comments", [])
        context.setdefault("attachments", [])
        context.setdefault("status_choices", [])
        context.setdefault("breadcrumbs", [])
        return context


class WorkflowTemplateView(WorkflowViewMixin, TemplateView):
    pass

# Existing core view names retained for urls_v2.py compatibility.
class WorkflowDashboardView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/dashboard.html"
    page_title = "Workflow Command Center"

class WorkflowListView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/workflow_list.html"
    page_title = "Workflows"

class WorkflowDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/workflow_detail.html"
    page_title = "Workflow Detail"

class WorkflowBuilderView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/workflow_builder.html"
    page_title = "Workflow Builder"

class WorkflowRunListView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/run_list.html"
    page_title = "Workflow Runs"

class WorkflowRunDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/run_detail.html"
    page_title = "Run Detail"

class WorkflowAuditView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/audit_log.html"
    page_title = "Audit Log"

class WorkflowWalkthroughView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/index.html"
    page_title = "Interactive Walkthrough"

class WorkflowMarketplaceView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/index.html"
    page_title = "Marketplace"

class WorkflowConnectorView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/index.html"
    page_title = "Connectors"

class WorkflowAgentView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/index.html"
    page_title = "AI Agents"

class WorkflowGovernanceView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/dashboard.html"
    page_title = "Governance Command Center"

class WorkflowOperationsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/dashboard.html"
    page_title = "Operations Center"

class WorkflowObservabilityView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/dashboard.html"
    page_title = "Observability"

class WorkflowSimulationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/simulation/index.html"
    page_title = "Digital Twin"

class WorkflowVikkiView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/index.html"
    page_title = "Workflow Vikki"

class WorkflowSettingsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/index.html"
    page_title = "Platform Settings"

class LifecycleWorkflowCreateView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_create.html"
    page_title = "Workflow Create"
    page_description = "Manage and review workflow create in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowUpdateView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_update.html"
    page_title = "Workflow Update"
    page_description = "Manage and review workflow update in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowCloneView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_clone.html"
    page_title = "Workflow Clone"
    page_description = "Manage and review workflow clone in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowImportView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_import.html"
    page_title = "Workflow Import"
    page_description = "Manage and review workflow import in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowExportView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_export.html"
    page_title = "Workflow Export"
    page_description = "Manage and review workflow export in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowPublishView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_publish.html"
    page_title = "Workflow Publish"
    page_description = "Manage and review workflow publish in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowRetireView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_retire.html"
    page_title = "Workflow Retire"
    page_description = "Manage and review workflow retire in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowMigrationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_migration.html"
    page_title = "Workflow Migration"
    page_description = "Manage and review workflow migration in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowDeleteConfirmView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_delete_confirm.html"
    page_title = "Workflow Delete Confirm"
    page_description = "Manage and review workflow delete confirm in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowVersionCompareView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_version_compare.html"
    page_title = "Workflow Version Compare"
    page_description = "Manage and review workflow version compare in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowMigrationPreviewView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_migration_preview.html"
    page_title = "Workflow Migration Preview"
    page_description = "Manage and review workflow migration preview in Master Workflow Engine V7."
    section = "lifecycle"

class LifecycleWorkflowVersionListView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/lifecycle/workflow_version_list.html"
    page_title = "Workflow Version List"
    page_description = "Manage and review workflow version list in Master Workflow Engine V7."
    section = "lifecycle"

class FormsFormListView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/forms/form_list.html"
    page_title = "Form List"
    page_description = "Manage and review form list in Master Workflow Engine V7."
    section = "forms"

class FormsFormBuilderView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/forms/form_builder.html"
    page_title = "Form Builder"
    page_description = "Manage and review form builder in Master Workflow Engine V7."
    section = "forms"

class FormsFormSubmissionView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/forms/form_submission.html"
    page_title = "Form Submission"
    page_description = "Manage and review form submission in Master Workflow Engine V7."
    section = "forms"

class FormsFormPreviewView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/forms/form_preview.html"
    page_title = "Form Preview"
    page_description = "Manage and review form preview in Master Workflow Engine V7."
    section = "forms"

class FormsSubmissionDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/forms/submission_detail.html"
    page_title = "Submission Detail"
    page_description = "Manage and review submission detail in Master Workflow Engine V7."
    section = "forms"

class RulesRuleListView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/rules/rule_list.html"
    page_title = "Rule List"
    page_description = "Manage and review rule list in Master Workflow Engine V7."
    section = "rules"

class RulesRuleBuilderView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/rules/rule_builder.html"
    page_title = "Rule Builder"
    page_description = "Manage and review rule builder in Master Workflow Engine V7."
    section = "rules"

class RulesRuleTestView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/rules/rule_test.html"
    page_title = "Rule Test"
    page_description = "Manage and review rule test in Master Workflow Engine V7."
    section = "rules"

class RulesDecisionTableView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/rules/decision_table.html"
    page_title = "Decision Table"
    page_description = "Manage and review decision table in Master Workflow Engine V7."
    section = "rules"

class InboxIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/inbox/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "inbox"

class InboxTaskDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/inbox/task_detail.html"
    page_title = "Task Detail"
    page_description = "Manage and review task detail in Master Workflow Engine V7."
    section = "inbox"

class InboxDelegationsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/inbox/delegations.html"
    page_title = "Delegations"
    page_description = "Manage and review delegations in Master Workflow Engine V7."
    section = "inbox"

class InboxAssignmentsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/inbox/assignments.html"
    page_title = "Assignments"
    page_description = "Manage and review assignments in Master Workflow Engine V7."
    section = "inbox"

class ApprovalsApprovalDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/approvals/approval_detail.html"
    page_title = "Approval Detail"
    page_description = "Manage and review approval detail in Master Workflow Engine V7."
    section = "approvals"

class ApprovalsApprovalHistoryView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/approvals/approval_history.html"
    page_title = "Approval History"
    page_description = "Manage and review approval history in Master Workflow Engine V7."
    section = "approvals"

class ApprovalsBulkApprovalView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/approvals/bulk_approval.html"
    page_title = "Bulk Approval"
    page_description = "Manage and review bulk approval in Master Workflow Engine V7."
    section = "approvals"

class ApprovalsEscalationsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/approvals/escalations.html"
    page_title = "Escalations"
    page_description = "Manage and review escalations in Master Workflow Engine V7."
    section = "approvals"

class MarketplaceIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceReviewsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/reviews.html"
    page_title = "Reviews"
    page_description = "Manage and review reviews in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceInstalledView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/installed.html"
    page_title = "Installed"
    page_description = "Manage and review installed in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceWorkflowsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/workflows.html"
    page_title = "Workflows"
    page_description = "Manage and review workflows in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceConnectorsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/connectors.html"
    page_title = "Connectors"
    page_description = "Manage and review connectors in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceAgentsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/agents.html"
    page_title = "Agents"
    page_description = "Manage and review agents in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceTemplatesView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/templates.html"
    page_title = "Templates"
    page_description = "Manage and review templates in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceRegulatoryPacksView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/regulatory_packs.html"
    page_title = "Regulatory Packs"
    page_description = "Manage and review regulatory packs in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/detail.html"
    page_title = "Detail"
    page_description = "Manage and review detail in Master Workflow Engine V7."
    section = "marketplace"

class MarketplacePublisherView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/publisher.html"
    page_title = "Publisher"
    page_description = "Manage and review publisher in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceCertificationDashboardView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/certification.html"
    page_title = "Certification Dashboard"
    page_description = ("Monitor connector availability, failures, latency, and status.")
    section = "marketplace"

class MarketplaceCertificationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/certification.html"
    page_title = "Certification"
    page_description = "Manage and review certification in Master Workflow Engine V7."
    section = "marketplace"

class MarketplaceInstallView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/install.html"
    page_title = "Install"
    page_description = "Manage and review install in Master Workflow Engine V7."
    section = "marketplace"

class MarketplacePublishView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/marketplace/publish.html"
    page_title = "Publish"
    page_description = "Manage and review publish in Master Workflow Engine V7."
    section = "marketplace"

class ConnectorsIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "connectors"

class ConnectorsExecutionHistoryView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/execution_history.html"
    page_title = "Execution History"
    page_description = "Manage and review execution history in Master Workflow Engine V7."
    section = "connectors"

class ConnectorsDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/detail.html"
    page_title = "Detail"
    page_description = "Manage and review detail in Master Workflow Engine V7."
    section = "connectors"

class ConnectorsHealthDashboardView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/health.html"
    page_title = "Connector Health Dashboard"
    page_description = ("Monitor connector availability, failures, latency, and status.")
    section = "connectors"

class ConnectorsHealthView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/health.html"
    page_title = "Health"
    page_description = "Manage and review health in Master Workflow Engine V7."
    section = "connectors"

class ConnectorsInstallView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/install.html"
    page_title = "Install"
    page_description = "Manage and review install in Master Workflow Engine V7."
    section = "connectors"

class ConnectorsConfigureView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/configure.html"
    page_title = "Configure"
    page_description = "Manage and review configure in Master Workflow Engine V7."
    section = "connectors"

class ConnectorsTestConnectionView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/test_connection.html"
    page_title = "Test Connection"
    page_description = "Manage and review test connection in Master Workflow Engine V7."
    section = "connectors"

class ConnectorsCredentialsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/credentials.html"
    page_title = "Credentials"
    page_description = "Manage and review credentials in Master Workflow Engine V7."
    section = "connectors"

class ConnectorsWebhooksView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/webhooks.html"
    page_title = "Webhooks"
    page_description = "Manage and review webhooks in Master Workflow Engine V7."
    section = "connectors"

class ConnectorsEventStreamsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/connectors/event_streams.html"
    page_title = "Event Streams"
    page_description = "Manage and review event streams in Master Workflow Engine V7."
    section = "connectors"

class VikkiIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "vikki"

class VikkiConversationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/conversation.html"
    page_title = "Conversation"
    page_description = "Manage and review conversation in Master Workflow Engine V7."
    section = "vikki"

class VikkiProcessDiscoveryView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/process_discovery.html"
    page_title = "Process Discovery"
    page_description = "Manage and review process discovery in Master Workflow Engine V7."
    section = "vikki"

class VikkiGenerateWorkflowView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/generate_workflow.html"
    page_title = "Generate Workflow"
    page_description = "Manage and review generate workflow in Master Workflow Engine V7."
    section = "vikki"

class VikkiDiagnosisView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/diagnosis.html"
    page_title = "Diagnosis"
    page_description = "Manage and review diagnosis in Master Workflow Engine V7."
    section = "vikki"

class VikkiTestGenerationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/test_generation.html"
    page_title = "Test Generation"
    page_description = "Manage and review test generation in Master Workflow Engine V7."
    section = "vikki"

class VikkiDocumentationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/documentation.html"
    page_title = "Documentation"
    page_description = "Manage and review documentation in Master Workflow Engine V7."
    section = "vikki"

class VikkiImpactAnalysisView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/impact_analysis.html"
    page_title = "Impact Analysis"
    page_description = "Manage and review impact analysis in Master Workflow Engine V7."
    section = "vikki"

class VikkiPolicySimulationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/policy_simulation.html"
    page_title = "Policy Simulation"
    page_description = "Manage and review policy simulation in Master Workflow Engine V7."
    section = "vikki"

class VikkiMemoryView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/memory.html"
    page_title = "Memory"
    page_description = "Manage and review memory in Master Workflow Engine V7."
    section = "vikki"

class VikkiSafetyReviewView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/safety_review.html"
    page_title = "Safety Review"
    page_description = "Manage and review safety review in Master Workflow Engine V7."
    section = "vikki"

class VikkiExplanationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/vikki/explanation.html"
    page_title = "Explanation"
    page_description = "Manage and review explanation in Master Workflow Engine V7."
    section = "vikki"

class AgentsIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "agents"

class AgentsDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/detail.html"
    page_title = "Detail"
    page_description = "Manage and review detail in Master Workflow Engine V7."
    section = "agents"

class AgentsRunDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/run_detail.html"
    page_title = "Run Detail"
    page_description = "Manage and review run detail in Master Workflow Engine V7."
    section = "agents"

class AgentsHumanReviewView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/human_review.html"
    page_title = "Human Review"
    page_description = "Manage and review human review in Master Workflow Engine V7."
    section = "agents"

class AgentsBuilderView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/builder.html"
    page_title = "Builder"
    page_description = "Manage and review builder in Master Workflow Engine V7."
    section = "agents"

class AgentsTeamBuilderView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/team_builder.html"
    page_title = "Team Builder"
    page_description = "Manage and review team builder in Master Workflow Engine V7."
    section = "agents"

class AgentsToolPermissionsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/tool_permissions.html"
    page_title = "Tool Permissions"
    page_description = "Manage and review tool permissions in Master Workflow Engine V7."
    section = "agents"

class AgentsSafetyView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/safety.html"
    page_title = "Safety"
    page_description = "Manage and review safety in Master Workflow Engine V7."
    section = "agents"

class AgentsMemoryView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/agents/memory.html"
    page_title = "Memory"
    page_description = "Manage and review memory in Master Workflow Engine V7."
    section = "agents"

class GovernanceDashboardView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/dashboard.html"
    page_title = "Dashboard"
    page_description = "Manage and review dashboard in Master Workflow Engine V7."
    section = "governance"

class GovernancePoliciesView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/policies.html"
    page_title = "Policies"
    page_description = "Manage and review policies in Master Workflow Engine V7."
    section = "governance"

class GovernanceControlsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/controls.html"
    page_title = "Controls"
    page_description = "Manage and review controls in Master Workflow Engine V7."
    section = "governance"

class GovernanceExceptionsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/exceptions.html"
    page_title = "Exceptions"
    page_description = "Manage and review exceptions in Master Workflow Engine V7."
    section = "governance"

class GovernanceRisksView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/risks.html"
    page_title = "Risks"
    page_description = "Manage and review risks in Master Workflow Engine V7."
    section = "governance"

class GovernanceClassificationsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/classifications.html"
    page_title = "Classifications"
    page_description = "Manage and review classifications in Master Workflow Engine V7."
    section = "governance"

class GovernanceEvidenceView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/evidence.html"
    page_title = "Evidence"
    page_description = "Manage and review evidence in Master Workflow Engine V7."
    section = "governance"

class GovernanceRegulatoryPacksView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/regulatory_packs.html"
    page_title = "Regulatory Packs"
    page_description = "Manage and review regulatory packs in Master Workflow Engine V7."
    section = "governance"

class GovernanceLegalHoldsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/legal_holds.html"
    page_title = "Legal Holds"
    page_description = "Manage and review legal holds in Master Workflow Engine V7."
    section = "governance"

class GovernanceRetentionView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/retention.html"
    page_title = "Retention"
    page_description = "Manage and review retention in Master Workflow Engine V7."
    section = "governance"

class GovernancePolicyDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/policy_detail.html"
    page_title = "Policy Detail"
    page_description = "Manage and review policy detail in Master Workflow Engine V7."
    section = "governance"

class GovernanceControlDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/governance/control_detail.html"
    page_title = "Control Detail"
    page_description = "Manage and review control detail in Master Workflow Engine V7."
    section = "governance"

class OperationsDashboardView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/dashboard.html"
    page_title = "Dashboard"
    page_description = "Manage and review dashboard in Master Workflow Engine V7."
    section = "operations"

class OperationsCommandsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/commands.html"
    page_title = "Commands"
    page_description = "Manage and review commands in Master Workflow Engine V7."
    section = "operations"

class OperationsRunbooksView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/runbooks.html"
    page_title = "Runbooks"
    page_description = "Manage and review runbooks in Master Workflow Engine V7."
    section = "operations"

class OperationsIncidentsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/incidents.html"
    page_title = "Incidents"
    page_description = "Manage and review incidents in Master Workflow Engine V7."
    section = "operations"

class OperationsDeadLettersView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/dead_letters.html"
    page_title = "Dead Letters"
    page_description = "Manage and review dead letters in Master Workflow Engine V7."
    section = "operations"

class OperationsRetriesView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/retries.html"
    page_title = "Retries"
    page_description = "Manage and review retries in Master Workflow Engine V7."
    section = "operations"

class OperationsWorkersView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/workers.html"
    page_title = "Workers"
    page_description = "Manage and review workers in Master Workflow Engine V7."
    section = "operations"

class OperationsFeatureFlagsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/feature_flags.html"
    page_title = "Feature Flags"
    page_description = "Manage and review feature flags in Master Workflow Engine V7."
    section = "operations"

class OperationsMaintenanceWindowsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/maintenance_windows.html"
    page_title = "Maintenance Windows"
    page_description = "Manage and review maintenance windows in Master Workflow Engine V7."
    section = "operations"

class OperationsFreezesView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/freezes.html"
    page_title = "Freezes"
    page_description = "Manage and review freezes in Master Workflow Engine V7."
    section = "operations"

class OperationsRecoveryView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/recovery.html"
    page_title = "Recovery"
    page_description = "Manage and review recovery in Master Workflow Engine V7."
    section = "operations"

class OperationsRegionsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/regions.html"
    page_title = "Regions"
    page_description = "Manage and review regions in Master Workflow Engine V7."
    section = "operations"

class OperationsFailoverView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/operations/failover.html"
    page_title = "Failover"
    page_description = "Manage and review failover in Master Workflow Engine V7."
    section = "operations"

class ObservabilityDashboardView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/dashboard.html"
    page_title = "Dashboard"
    page_description = "Manage and review dashboard in Master Workflow Engine V7."
    section = "observability"

class ObservabilityServiceMapView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/service_map.html"
    page_title = "Service Map"
    page_description = "Manage and review service map in Master Workflow Engine V7."
    section = "observability"

class ObservabilityTracesView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/traces.html"
    page_title = "Traces"
    page_description = "Manage and review traces in Master Workflow Engine V7."
    section = "observability"

class ObservabilityLogsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/logs.html"
    page_title = "Logs"
    page_description = "Manage and review logs in Master Workflow Engine V7."
    section = "observability"

class ObservabilityMetricsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/metrics.html"
    page_title = "Metrics"
    page_description = "Manage and review metrics in Master Workflow Engine V7."
    section = "observability"

class ObservabilityAlertsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/alerts.html"
    page_title = "Alerts"
    page_description = "Manage and review alerts in Master Workflow Engine V7."
    section = "observability"

class ObservabilityIncidentsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/incidents.html"
    page_title = "Incidents"
    page_description = "Manage and review incidents in Master Workflow Engine V7."
    section = "observability"

class ObservabilitySlosView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/slos.html"
    page_title = "Slos"
    page_description = "Manage and review slos in Master Workflow Engine V7."
    section = "observability"

class ObservabilityErrorBudgetsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/error_budgets.html"
    page_title = "Error Budgets"
    page_description = "Manage and review error budgets in Master Workflow Engine V7."
    section = "observability"

class ObservabilityAnomaliesView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/anomalies.html"
    page_title = "Anomalies"
    page_description = "Manage and review anomalies in Master Workflow Engine V7."
    section = "observability"

class ObservabilityTraceDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/observability/trace_detail.html"
    page_title = "Trace Detail"
    page_description = "Manage and review trace detail in Master Workflow Engine V7."
    section = "observability"

class SimulationIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/simulation/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "simulation"

class SimulationScenarioBuilderView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/simulation/scenario_builder.html"
    page_title = "Scenario Builder"
    page_description = "Manage and review scenario builder in Master Workflow Engine V7."
    section = "simulation"

class SimulationRunDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/simulation/run_detail.html"
    page_title = "Run Detail"
    page_description = "Manage and review run detail in Master Workflow Engine V7."
    section = "simulation"

class SimulationComparisonView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/simulation/comparison.html"
    page_title = "Comparison"
    page_description = "Manage and review comparison in Master Workflow Engine V7."
    section = "simulation"

class AnalyticsProcessMiningView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/analytics/process_mining.html"
    page_title = "Process Mining"
    page_description = "Manage and review process mining in Master Workflow Engine V7."
    section = "analytics"

class AnalyticsProcessVariantsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/analytics/process_variants.html"
    page_title = "Process Variants"
    page_description = "Manage and review process variants in Master Workflow Engine V7."
    section = "analytics"

class AnalyticsBottlenecksView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/analytics/bottlenecks.html"
    page_title = "Bottlenecks"
    page_description = "Manage and review bottlenecks in Master Workflow Engine V7."
    section = "analytics"

class AnalyticsCostsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/analytics/costs.html"
    page_title = "Costs"
    page_description = "Manage and review costs in Master Workflow Engine V7."
    section = "analytics"

class AnalyticsBenchmarksView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/analytics/benchmarks.html"
    page_title = "Benchmarks"
    page_description = "Manage and review benchmarks in Master Workflow Engine V7."
    section = "analytics"

class AnalyticsWorkflowGenomeView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/analytics/workflow_genome.html"
    page_title = "Workflow Genome"
    page_description = "Manage and review workflow genome in Master Workflow Engine V7."
    section = "analytics"

class AnalyticsHealthView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/analytics/health.html"
    page_title = "Health"
    page_description = "Manage and review health in Master Workflow Engine V7."
    section = "analytics"

class AnalyticsRecommendationsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/analytics/recommendations.html"
    page_title = "Recommendations"
    page_description = "Manage and review recommendations in Master Workflow Engine V7."
    section = "analytics"

class AnalyticsWorkflowGpsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/analytics/workflow_gps.html"
    page_title = "Workflow Gps"
    page_description = "Manage and review workflow gps in Master Workflow Engine V7."
    section = "analytics"

class SettingsIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "settings"

class SettingsTenantsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/tenants.html"
    page_title = "Tenants"
    page_description = "Manage and review tenants in Master Workflow Engine V7."
    section = "settings"

class SettingsUsersView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/users.html"
    page_title = "Users"
    page_description = "Manage and review users in Master Workflow Engine V7."
    section = "settings"

class SettingsGroupsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/groups.html"
    page_title = "Groups"
    page_description = "Manage and review groups in Master Workflow Engine V7."
    section = "settings"

class SettingsStaffingView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/staffing.html"
    page_title = "Staffing"
    page_description = "Manage and review staffing in Master Workflow Engine V7."
    section = "settings"

class SettingsRolesView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/roles.html"
    page_title = "Roles"
    page_description = "Manage and review roles in Master Workflow Engine V7."
    section = "settings"

class SettingsAccessPoliciesView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/access_policies.html"
    page_title = "Access Policies"
    page_description = "Manage and review access policies in Master Workflow Engine V7."
    section = "settings"

class SettingsDelegationsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/delegations.html"
    page_title = "Delegations"
    page_description = "Manage and review delegations in Master Workflow Engine V7."
    section = "settings"

class SettingsIdentityProvidersView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/identity_providers.html"
    page_title = "Identity Providers"
    page_description = "Manage and review identity providers in Master Workflow Engine V7."
    section = "settings"

class SettingsApiClientsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/api_clients.html"
    page_title = "Api Clients"
    page_description = "Manage and review api clients in Master Workflow Engine V7."
    section = "settings"

class SettingsSecretsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/secrets.html"
    page_title = "Secrets"
    page_description = "Manage and review secrets in Master Workflow Engine V7."
    section = "settings"

class SettingsRegionsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/regions.html"
    page_title = "Regions"
    page_description = "Manage and review regions in Master Workflow Engine V7."
    section = "settings"

class SettingsBusinessCalendarsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/business_calendars.html"
    page_title = "Business Calendars"
    page_description = "Manage and review business calendars in Master Workflow Engine V7."
    section = "settings"

class SettingsAuditRetentionView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/audit_retention.html"
    page_title = "Audit Retention"
    page_description = "Manage and review audit retention in Master Workflow Engine V7."
    section = "settings"

class SettingsTenantDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/settings/tenant_detail.html"
    page_title = "Tenant Detail"
    page_description = "Manage and review tenant detail in Master Workflow Engine V7."
    section = "settings"

class DeveloperIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "developer"

class DeveloperApiExplorerView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/api_explorer.html"
    page_title = "Api Explorer"
    page_description = "Manage and review api explorer in Master Workflow Engine V7."
    section = "developer"

class DeveloperCliView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/cli.html"
    page_title = "Cli"
    page_description = "Manage and review cli in Master Workflow Engine V7."
    section = "developer"

class DeveloperWebhooksView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/webhooks.html"
    page_title = "Webhooks"
    page_description = "Manage and review webhooks in Master Workflow Engine V7."
    section = "developer"

class DeveloperSdkDownloadsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/sdk_downloads.html"
    page_title = "Sdk Downloads"
    page_description = "Manage and review sdk downloads in Master Workflow Engine V7."
    section = "developer"

class DeveloperGitopsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/gitops.html"
    page_title = "Gitops"
    page_description = "Manage and review gitops in Master Workflow Engine V7."
    section = "developer"

class DeveloperDeploymentsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/deployments.html"
    page_title = "Deployments"
    page_description = "Manage and review deployments in Master Workflow Engine V7."
    section = "developer"

class DeveloperEnvironmentsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/environments.html"
    page_title = "Environments"
    page_description = "Manage and review environments in Master Workflow Engine V7."
    section = "developer"

class DeveloperDependencyMapView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/dependency_map.html"
    page_title = "Dependency Map"
    page_description = "Manage and review dependency map in Master Workflow Engine V7."
    section = "developer"

class DeveloperPerformanceTestsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/performance_tests.html"
    page_title = "Performance Tests"
    page_description = "Manage and review performance tests in Master Workflow Engine V7."
    section = "developer"

class DeveloperChaosTestsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/developer/chaos_tests.html"
    page_title = "Chaos Tests"
    page_description = "Manage and review chaos tests in Master Workflow Engine V7."
    section = "developer"

class PortalIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/portal/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "portal"

class PortalRequestReviewView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/portal/request_review.html"
    page_title = "Request Review"
    page_description = "Manage and review request review in Master Workflow Engine V7."
    section = "portal"

class PortalRequestConfirmationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/portal/request_confirmation.html"
    page_title = "Request Confirmation"
    page_description = "Manage and review request confirmation in Master Workflow Engine V7."
    section = "portal"

class PortalCatalogView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/portal/catalog.html"
    page_title = "Catalog"
    page_description = "Manage and review catalog in Master Workflow Engine V7."
    section = "portal"

class PortalMyRequestsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/portal/my_requests.html"
    page_title = "My Requests"
    page_description = "Manage and review my requests in Master Workflow Engine V7."
    section = "portal"

class PortalOfferingDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/portal/offering_detail.html"
    page_title = "Offering Detail"
    page_description = "Manage and review offering detail in Master Workflow Engine V7."
    section = "portal"

class PortalRequestDetailView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/portal/request_detail.html"
    page_title = "Request Detail"
    page_description = "Manage and review request detail in Master Workflow Engine V7."
    section = "portal"

class PortalRequestFormView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/portal/request_form.html"
    page_title = "Request Form"
    page_description = "Manage and review request form in Master Workflow Engine V7."
    section = "portal"

class WalkthroughIndexView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/index.html"
    page_title = "Index"
    page_description = "Manage and review index in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughGettingStartedView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/getting_started.html"
    page_title = "Getting Started"
    page_description = "Manage and review getting started in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughCreateWorkflowView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/create_workflow.html"
    page_title = "Create Workflow"
    page_description = "Manage and review create workflow in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughFormBuilderView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/form_builder.html"
    page_title = "Form Builder"
    page_description = "Manage and review form builder in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughRuleBuilderView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/rule_builder.html"
    page_title = "Rule Builder"
    page_description = "Manage and review rule builder in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughPublishWorkflowView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/publish_workflow.html"
    page_title = "Publish Workflow"
    page_description = "Manage and review publish workflow in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughRunMonitoringView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/run_monitoring.html"
    page_title = "Run Monitoring"
    page_description = "Manage and review run monitoring in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughApprovalsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/approvals.html"
    page_title = "Approvals"
    page_description = "Manage and review approvals in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughMarketplaceView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/marketplace.html"
    page_title = "Marketplace"
    page_description = "Manage and review marketplace in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughConnectorsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/connectors.html"
    page_title = "Connectors"
    page_description = "Manage and review connectors in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughGovernanceView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/governance.html"
    page_title = "Governance"
    page_description = "Manage and review governance in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughObservabilityView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/observability.html"
    page_title = "Observability"
    page_description = "Manage and review observability in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughOperationsView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/operations.html"
    page_title = "Operations"
    page_description = "Manage and review operations in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughWorkflowVikkiView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/workflow_vikki.html"
    page_title = "Workflow Vikki"
    page_description = "Manage and review workflow vikki in Master Workflow Engine V7."
    section = "walkthrough"

class WalkthroughAdministrationView(WorkflowTemplateView):
    template_name = "gdx_admin/apps/workflow/walkthrough/administration.html"
    page_title = "Administration"
    page_description = "Manage and review administration in Master Workflow Engine V7."
    section = "walkthrough"

