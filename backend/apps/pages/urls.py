from django.urls import path
from . import views
app_name="pages_admin"
urlpatterns=[
 path("",views.dashboard,name="dashboard"),
 path("pages/",views.page_list,name="page-list"),
 path("pages/new/",views.page_create,name="page-create"),
 path("pages/<slug:slug>/",views.page_detail,name="page-detail"),
 path("page-types/",views.page_type_list,name="page-type-list"),
 path("page-types/new/",views.page_type_create,name="page-type-create"),
 path("page-types/<int:pk>/edit/",views.page_type_edit,name="page-type-edit"),
 path("pages/<slug:slug>/versions/<int:number>/blocks/",views.block_list,name="block-list"),
 path("pages/<slug:slug>/versions/<int:number>/blocks/new/",views.block_create,name="block-create"),
 path("pages/<slug:slug>/versions/<int:number>/blocks/reorder/",views.block_reorder,name="block-reorder"),
 path("pages/<slug:slug>/versions/<int:number>/blocks/<uuid:block_id>/edit/",views.block_edit,name="block-edit"),
 path("pages/<slug:slug>/versions/<int:number>/blocks/<uuid:block_id>/delete/",views.block_delete,name="block-delete"),
 path("pages/<slug:slug>/versions/<int:number>/submit/",views.submit_version,name="submit"),
 path("pages/<slug:slug>/versions/<int:number>/publish/",views.publish_version,name="publish"),
 path("workflow/",views.workflow_list,name="workflow"),
 path("tasks/<uuid:pk>/",views.task_detail,name="task-detail"),
 path("audit/",views.audit_list,name="audit"),
 path("notifications/",views.notification_list,name="notifications"),
 path("pages/<slug:slug>/lifecycle/",views.lifecycle_request,name="lifecycle-request")]
