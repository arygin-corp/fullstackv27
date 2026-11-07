import tempfile
from pathlib import Path
from unittest.mock import patch

from django.test import SimpleTestCase

from apps.third_party_apis.modules.command_center import platform
from apps.third_party_apis.modules.command_center.elements import ELEMENT_TYPES
from apps.third_party_apis.modules.command_center.operations import (
    CHARTS,
    age_label,
    chosen,
    duration_label,
    google_column,
    series_chart,
    with_share,
)


class CommandCenterViewTests(SimpleTestCase):
    def test_create_and_delete_a_platform_report(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "command_center.json"
            with patch.object(platform, "store_path", return_value=path):
                item, message = platform.create_view("Morning report", "report", "platform", "Giovanni", ["vertical_bar", "kpi_cards"])
                self.assertEqual(message, "")
                self.assertEqual(item["scope_label"], "Platform")
                self.assertEqual([element["type"] for element in item["elements"]], ["vertical_bar", "kpi_cards"])
                self.assertEqual(platform.get_view(item["id"])["kind"], "report")
                added, error = platform.add_element(item["id"], "line")
                self.assertEqual(error, "")
                self.assertEqual(added["elements"][-1]["type"], "line")
                platform.remove_element(item["id"], added["elements"][-1]["id"])
                self.assertEqual(len(platform.get_view(item["id"])["elements"]), 2)
                platform.delete_view(item["id"])
                self.assertIsNone(platform.get_view(item["id"]))

    def test_my_lists_keep_each_owner(self):
        class Person:
            pk = 7

            def get_username(self):
                return "giovanni"

            def get_full_name(self):
                return "Giovanni"

        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "command_center.json"
            with patch.object(platform, "store_path", return_value=path):
                mine, _ = platform.create_view("Mine", "dashboard", "platform", "Giovanni", ["kpi_cards"], created_by_id=7)
                platform.create_view("Theirs", "dashboard", "platform", "Someone", ["line"], created_by_id=8)
                names = [item["name"] for item in platform.saved_views("dashboard", owner=Person())]
        self.assertEqual(names, [mine["name"]])

    def test_a_view_needs_a_chart(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "command_center.json"
            with patch.object(platform, "store_path", return_value=path):
                item, message = platform.create_view("Empty", "dashboard", "platform", "Giovanni", [])
        self.assertIsNone(item)
        self.assertIn("chart", message)

    def test_catalog_includes_the_chart_library(self):
        from apps.third_party_apis.modules.command_center.elements import ELEMENT_TYPES

        required = [
            "Vertical Bar Chart", "Horizontal Bar Chart", "Grouped Bar Chart", "Stacked Bar Chart",
            "100% Stacked Bar Chart", "Range Bar Chart", "Floating Bar Chart", "Single Line Chart",
            "Multi-Line Chart", "Step Line Chart", "Spline Chart", "Area Spline Chart", "Area Chart",
            "Stacked Area Chart", "100% Stacked Area Chart", "Stream Graph", "Pie Chart", "Donut Chart",
            "Nested Donut Chart", "Nightingale Rose Chart", "Candlestick Chart", "OHLC Chart",
            "Waterfall Chart", "Budget vs Actual Chart", "Histogram", "Box Plot", "Violin Plot",
            "Ridgeline Plot", "Scatter Plot", "Bubble Chart", "Hexbin Chart", "Correlation Matrix",
            "Heatmap", "Calendar Heatmap", "Matrix Heatmap", "Density Heatmap", "Gauge Chart",
            "Radial Gauge", "Progress Bar", "Circular Progress", "KPI Scorecard", "Bullet Chart",
            "Treemap", "Sunburst Chart", "Icicle Chart", "Circle Packing Chart", "Radar Chart",
            "Spider Chart", "Polar Area Chart", "Parallel Coordinates Chart",             "Choropleth Map",
            "Bubble Map", "Marker Map", "Route Map", "Heat Map", "Geographic Treemap", "Google Map", "Timeline Chart",
            "Gantt Chart", "Milestone Chart", "Project Roadmap", "Network Graph", "Force-Directed Graph",
            "Dependency Graph", "Sankey Diagram", "Chord Diagram", "Funnel Chart", "Conversion Funnel",
            "Flow Diagram", "Control Chart", "Pareto Chart", "Run Chart", "QQ Plot", "Cohort Analysis Chart",
            "Retention Curve", "Customer Journey Map", "Forecast Chart", "Trend Projection Chart",
            "Anomaly Detection Chart", "Data Grid", "Pivot Table", "Cross Tabulation", "Drill-Down Table",
            "Summary Table", "KPI Cards", "Metrics Cards", "Leaderboards", "Activity Feeds", "Alert Panels",
            "Filters", "Date Range Pickers", "Drill-Down Widgets", "Export Widgets", "Search Panels",
        ]
        labels = set(ELEMENT_TYPES.values())
        missing = [label for label in required if label not in labels]
        self.assertEqual(missing, [])
        script = Path(__file__).resolve().parents[2] / "static" / "gdx_admin" / "command_center" / "widgets.js"
        source = script.read_text()
        unrendered = [key for key in ELEMENT_TYPES if f"{key}:" not in source]
        self.assertEqual(unrendered, [])

    def test_visitor_map_uses_profile_states(self):
        from apps.third_party_apis.modules.command_center.elements import places_from_country_counts, places_from_state_counts

        places = places_from_state_counts([("TX", 4), ("CA", 2), ("", 1)])
        texas = next(place for place in places if place["label"] == "Texas")
        self.assertEqual(texas["value"], 4)
        self.assertEqual(texas["unit"], "visitors")
        self.assertAlmostEqual(texas["latitude"], 31.05, places=1)
        self.assertEqual(len(places), 2)
        canada = places_from_country_counts([("Canada", 3), ("Mexico", 1)])
        self.assertEqual(canada[0]["label"], "Canada")
        self.assertEqual(canada[0]["value"], 3)
        self.assertEqual(len(canada), 1)

    def test_realtime_report_matches_the_overview_cards(self):
        from datetime import datetime, timedelta, timezone

        from apps.third_party_apis.modules.command_center.elements import build_realtime

        now = datetime(2026, 11, 5, 18, 0, tzinfo=timezone.utc)
        report = build_realtime(
            now,
            [now - timedelta(minutes=1), now - timedelta(minutes=1, seconds=20), now - timedelta(hours=2)],
            [{"access": "User", "verified": True}, {"access": "Admin", "verified": False}],
        )
        self.assertEqual(report["active_users"], 2)
        self.assertEqual(sum(item["value"] for item in report["minutes"]), 2)
        self.assertEqual([item["label"] for item in report["devices"]], ["Desktop", "Mobile", "Tablet"])
        self.assertEqual(report["devices"][0]["value"], 0)
        self.assertEqual(report["sources"][0]["label"], "(direct)")
        self.assertEqual(report["sources"][0]["share"], 100)
        self.assertEqual(report["audiences"][0]["label"], "All users")
        self.assertEqual(report["audiences"][0]["value"], 2)
        self.assertEqual(report["audiences"][1]["label"], "Signed in during the last 30 minutes")
        self.assertEqual(report["audiences"][1]["value"], 2)

    def test_welcome_follows_the_time_of_day(self):
        from datetime import datetime

        from apps.third_party_apis.modules.command_center.views import welcome_message

        self.assertEqual(
            welcome_message(datetime(2026, 11, 5, 19, 0), "Giovanni"),
            "Working late, Giovanni!",
        )
        self.assertEqual(
            welcome_message(datetime(2026, 11, 5, 23, 59), "Giovanni"),
            "Working late, Giovanni!",
        )
        self.assertEqual(
            welcome_message(datetime(2026, 11, 5, 0, 0), "Giovanni"),
            "Burning the midnight oil, Giovanni!",
        )
        self.assertEqual(
            welcome_message(datetime(2026, 11, 5, 4, 59), "Giovanni"),
            "Burning the midnight oil, Giovanni!",
        )
        self.assertEqual(welcome_message(datetime(2026, 11, 5, 17, 0), "Giovanni")[:12], "Good evening")
        self.assertEqual(welcome_message(datetime(2026, 11, 5, 13, 36), "Giovanni")[:14], "Good afternoon")
        self.assertEqual(welcome_message(datetime(2026, 11, 5, 8, 0), "Giovanni")[:12], "Good morning")

    def test_unknown_scope_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "command_center.json"
            with patch.object(platform, "store_path", return_value=path):
                item, message = platform.create_view("Bad", "dashboard", "module:missing", "Giovanni")
        self.assertIsNone(item)
        self.assertIn("Choose", message)

    def test_operational_shares_and_google_note(self):
        from datetime import datetime

        shared = with_share([{"label": "Approved", "value": 3}, {"label": "Draft", "value": 1}])
        self.assertEqual(shared[0]["share"], 75)
        self.assertEqual(shared[1]["share"], 25)
        self.assertEqual(with_share([{"label": "Draft", "value": 0}])[0]["share"], 0)
        self.assertEqual(age_label(None, datetime(2026, 11, 5, 18, 0)), "None waiting")
        self.assertEqual(age_label(datetime(2026, 11, 1, 18, 0), datetime(2026, 11, 5, 18, 0)), "4 days")
        self.assertEqual(duration_label(900), "900 ms")
        self.assertEqual(duration_label(1500), "1.5 s")
        empty = google_column({"connected": False, "summary": {}})
        self.assertEqual(empty["empty"], "No property is connected.")
        waiting = google_column({"connected": True, "property_id": "123", "summary": {}})
        self.assertIn("123", waiting["empty"])
        saved = google_column({"connected": True, "property_id": "123", "summary": {"active_users": "4", "sessions": "6", "page_views": "9"}})
        self.assertEqual(saved["rows"][0]["value"], 4)
        self.assertEqual(saved["rows"][2]["label"], "Page views")

    def test_chart_ranges_are_explicit(self):
        self.assertEqual(chosen({}, "orders", "30d"), "30d")
        self.assertEqual(chosen({"orders": "nope"}, "orders", "30d"), "30d")
        self.assertEqual(chosen({"orders": "7d"}, "orders", "30d"), "7d")
        self.assertEqual(series_chart("7d"), "line")
        self.assertEqual(series_chart("12m"), "column")
        self.assertNotIn("donut", {kind for kind, _wide in CHARTS.values()})

    def test_landing_routes_superadmin_to_staff_and_others_to_marketplace(self):
        from gdx.views import home_for

        class Account:
            def __init__(self, superuser, staff, access_type):
                self.is_superuser = superuser
                self.is_staff = staff
                self.profile = type("Profile", (), {"access_type": access_type})()

        self.assertEqual(home_for(Account(True, True, "user")), "/sa/command-center/")
        self.assertEqual(home_for(Account(False, True, "admin")), "/marketplace/")
        self.assertEqual(home_for(Account(False, False, "user")), "/marketplace/")
        from pathlib import Path

        from django.template.loader import get_template
        from django.urls import reverse

        self.assertEqual(reverse("marketplace:home"), "/marketplace/")
        home = get_template("gdx_users/apps/pages/pages/home.html")
        shell = get_template("gdx_users/partials/base.html")
        self.assertTrue(home.origin.name.endswith("gdx_users/apps/pages/pages/home.html"))
        self.assertIn('extends "gdx_users/base.html"', Path(shell.origin.name).read_text())
