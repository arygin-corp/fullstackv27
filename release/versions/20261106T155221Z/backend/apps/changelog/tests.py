from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from .models import AuditLog, Categorie

class ChangelogSmokeTests(TestCase):
    def setUp(self):
        self.user=get_user_model().objects.create_user(username="tester", password="password")
        self.user.user_permissions.add(*Permission.objects.filter(content_type__app_label="changelog"))
        self.client.force_login(self.user)
    def test_category_create_and_signal_audit(self):
        response=self.client.post(reverse("changelog:category-create"), {"name":"Feature","slug":"feature","published_date":timezone.now().strftime("%Y-%m-%dT%H:%M"),"desc":"Features","is_active":True})
        self.assertEqual(response.status_code,302)
        obj=Categorie.objects.get(slug="feature")
        self.assertTrue(AuditLog.objects.filter(action="CREATE",object_id=str(obj.pk),actor=self.user).exists())
    def test_unauthorized_user_is_forbidden(self):
        user=get_user_model().objects.create_user(username="plain",password="password")
        self.client.force_login(user)
        self.assertEqual(self.client.get(reverse("changelog:category-list")).status_code,403)

from datetime import timedelta
from django.core import mail
from django.core.exceptions import ValidationError
from django.test import override_settings
from .models import Notification, Post, ReleaseStatus, ReleaseSubscription
from .services import approve_release, publish_release, submit_for_review


class PhaseOneWorkflowTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="workflow-user", password="password", email="workflow@example.com"
        )
        self.category = Categorie.objects.create(
            name="Feature", slug="workflow-feature", published_date=timezone.now(),
            desc="Feature", is_active=True,
        )
        self.post = Post.objects.create(
            version="99.0.0", release_date=timezone.now(), title="New Feature",
            desc="Workflow release", subTitleA="Feature", typeA=self.category,
            postA="<ul><li>New experience</li></ul>", created_by=self.user,
            updated_by=self.user,
        )

    def test_workflow_requires_valid_transition_order(self):
        with self.assertRaises(ValidationError):
            approve_release(self.post, self.user)
        submit_for_review(self.post, self.user)
        approve_release(self.post, self.user)
        publish_release(self.post, self.user)
        self.post.refresh_from_db()
        self.assertEqual(self.post.status, ReleaseStatus.PUBLISHED)
        self.assertTrue(self.post.is_active)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_publish_creates_opted_in_notifications(self):
        ReleaseSubscription.objects.create(user=self.user)
        submit_for_review(self.post, self.user)
        approve_release(self.post, self.user)
        publish_release(self.post, self.user)
        self.assertTrue(Notification.objects.filter(user=self.user, post=self.post).exists())
        self.assertEqual(len(mail.outbox), 1)

    def test_future_scheduled_release_cannot_publish_early(self):
        submit_for_review(self.post, self.user)
        approve_release(self.post, self.user)
        self.post.publish_at = timezone.now() + timedelta(days=1)
        self.post.save()
        with self.assertRaises(ValidationError):
            publish_release(self.post, self.user)

from .analytics import dashboard_metrics
from .comparison import compare_posts


class PhaseTwoFeatureTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="phase-two", password="password"
        )
        self.category = Categorie.objects.create(
            name="Enhancements", slug="phase-two-enhancements",
            published_date=timezone.now(), desc="Enhancements", is_active=True,
        )
        shared = {
            "release_date": timezone.now(),
            "title": "New Enhancements",
            "desc": "Release summary",
            "subTitleA": "Enhance Core",
            "typeA": self.category,
            "created_by": self.user,
            "updated_by": self.user,
        }
        self.before = Post.objects.create(
            version="20.0.0", postA="<ul><li>Old page</li></ul>", **shared
        )
        self.after = Post.objects.create(
            version="21.0.0", postA="<ul><li>New page</li></ul>", **shared
        )

    def test_release_comparison_detects_section_content_change(self):
        result = compare_posts(self.before, self.after)
        self.assertGreater(result["change_count"], 0)
        self.assertEqual(result["section_changes"][0]["section"], "A")
        content_change = result["section_changes"][0]["changes"][-1]
        self.assertEqual(content_change["field"], "Content")
        self.assertEqual(content_change["before"], "Old page")
        self.assertEqual(content_change["after"], "New page")

    def test_dashboard_metrics_count_releases_and_sections(self):
        self.after.status = ReleaseStatus.PUBLISHED
        self.after.save()
        metrics = dashboard_metrics()
        self.assertEqual(metrics["total_releases"], 2)
        self.assertEqual(metrics["published_releases"], 1)
        self.assertEqual(metrics["section_count"], 2)
        self.assertEqual(metrics["category_usage"][0]["category"], "Enhancements")

from .html_sanitizer import sanitize_rich_html
from .timeline import serialize_sections, timeline_payload


class PhaseThreeTimelineTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="phase-three", password="password"
        )
        self.category = Categorie.objects.create(
            name="Enhancements", slug="phase-three-enhancements",
            published_date=timezone.now(), desc="Enhancements", is_active=True,
        )
        self.post = Post.objects.create(
            version="30.0.0", release_date=timezone.now(),
            title="New Enhancements", desc="Timeline release",
            subTitleA="Enhance Core", typeA=self.category,
            postA="<ul><li>New Product Release Page</li></ul>",
            status=ReleaseStatus.PUBLISHED,
            created_by=self.user, updated_by=self.user,
        )

    def test_a_to_j_content_becomes_ordered_timeline_sections(self):
        sections = serialize_sections(self.post)
        self.assertEqual(len(sections), 1)
        self.assertEqual(sections[0]["key"], "A")
        self.assertEqual(sections[0]["category"], "Enhancements")
        self.assertEqual(sections[0]["tag_class"], "enhancements")
        self.assertIn("<li>New Product Release Page</li>", sections[0]["html"])

    def test_timeline_payload_can_include_rendered_html(self):
        payload = timeline_payload(self.post, include_html=True)
        self.assertIn('class="item"', payload["html"])
        self.assertIn("Version 30.0.0", payload["html"])
        self.assertIn("New Product Release Page", payload["html"])

    def test_rich_html_removes_script_and_unsafe_protocol(self):
        cleaned = sanitize_rich_html(
            '<script>alert(1)</script><a href="javascript:alert(2)">Link</a>'
        )
        self.assertNotIn("<script", cleaned)
        self.assertNotIn("javascript:", cleaned)

import json


class PhaseFourPublicApiTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="phase-four", password="password"
        )
        self.category = Categorie.objects.create(
            name="Feature", slug="phase-four-feature",
            published_date=timezone.now(), desc="Feature", is_active=True,
        )
        common = {
            "release_date": timezone.now(), "title": "New Feature",
            "desc": "Public release", "subTitleA": "New Products",
            "typeA": self.category, "postA": "<ul><li>Public Product</li></ul>",
            "created_by": self.user, "updated_by": self.user,
        }
        self.published = Post.objects.create(
            version="40.0.0", status=ReleaseStatus.PUBLISHED, **common
        )
        self.draft = Post.objects.create(
            version="40.0.1", status=ReleaseStatus.DRAFT, **common
        )

    def test_public_collection_is_anonymous_and_excludes_drafts(self):
        response = self.client.get(reverse("changelog:public-api-releases"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["version"], "40.0.0")

    def test_public_latest_can_return_sanitized_html(self):
        response = self.client.get(
            reverse("changelog:public-api-latest"), {"include_html": "true"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('class="item"', response.json()["html"])
        self.assertIn("Public Product", response.json()["html"])

    def test_public_api_supports_etag_conditional_request(self):
        first = self.client.get(reverse("changelog:public-api-releases"))
        second = self.client.get(
            reverse("changelog:public-api-releases"),
            HTTP_IF_NONE_MATCH=first["ETag"],
        )
        self.assertEqual(second.status_code, 304)

    def test_public_detail_never_returns_draft(self):
        response = self.client.get(
            reverse("changelog:public-api-release-detail", kwargs={"version": "40.0.1"})
        )
        self.assertEqual(response.status_code, 404)

from django.contrib.auth.models import Permission
from .audit_views import csv_safe, filtered_audit_queryset


class PhaseFiveAuditHistoryTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="auditor", password="password", email="auditor@example.com"
        )
        self.permission = Permission.objects.get(
            content_type__app_label="changelog", codename="view_all_audit_logs"
        )
        self.user.user_permissions.add(self.permission)
        self.category = Categorie.objects.create(
            name="Updates", slug="audit-updates", published_date=timezone.now(),
            desc="Updates", is_active=True,
        )
        self.post = Post.objects.create(
            version="50.0.0", release_date=timezone.now(), title="Updates",
            desc="Audit release", subTitleA="Core", typeA=self.category,
            postA="<ul><li>Original</li></ul>", created_by=self.user,
            updated_by=self.user,
        )
        self.log = AuditLog.objects.create(
            actor=self.user, actor_username=self.user.username,
            actor_email=self.user.email, action=AuditLog.Action.UPDATE,
            model_name="changelog.post", object_id=str(self.post.pk),
            object_repr=str(self.post),
            changes={"postA": {"from": "Original", "to": "Updated"}},
            snapshot={"version": self.post.version},
        )

    def test_audit_history_requires_permission(self):
        other = get_user_model().objects.create_user(username="no-audit", password="password")
        self.client.force_login(other)
        self.assertEqual(self.client.get(reverse("changelog:audit-list")).status_code, 403)
        self.client.force_login(self.user)
        self.assertEqual(self.client.get(reverse("changelog:audit-list")).status_code, 200)

    def test_filters_by_release_version_user_and_date(self):
        params = {
            "version": "50.0", "user": "auditor",
            "start_date": timezone.localdate().isoformat(),
            "end_date": timezone.localdate().isoformat(),
        }
        self.assertEqual(filtered_audit_queryset(params).filter(pk=self.log.pk).count(), 1)

    def test_csv_export_contains_field_level_change(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("changelog:audit-export"), {"version": "50.0.0"})
        self.assertEqual(response.status_code, 200)
        content = b"".join(response.streaming_content).decode("utf-8")
        self.assertIn("postA", content)
        self.assertIn("Original", content)
        self.assertIn("Updated", content)

    def test_csv_formula_values_are_escaped(self):
        self.assertEqual(csv_safe("=CMD()"), "'=CMD()")
