"""Charts and widgets a person can place on a Command Center view."""

ELEMENTS = (
    ("Bar Charts", (
        ("vertical_bar", "Vertical Bar Chart"),
        ("horizontal_bar", "Horizontal Bar Chart"),
        ("grouped_bar", "Grouped Bar Chart"),
        ("stacked_bar", "Stacked Bar Chart"),
        ("stacked_bar_100", "100% Stacked Bar Chart"),
        ("range_bar", "Range Bar Chart"),
        ("floating_bar", "Floating Bar Chart"),
    )),
    ("Line Charts", (
        ("line", "Single Line Chart"),
        ("multi_line", "Multi-Line Chart"),
        ("step_line", "Step Line Chart"),
        ("spline", "Spline Chart"),
        ("area_spline", "Area Spline Chart"),
    )),
    ("Area Charts", (
        ("area", "Area Chart"),
        ("stacked_area", "Stacked Area Chart"),
        ("stacked_area_100", "100% Stacked Area Chart"),
        ("stream", "Stream Graph"),
    )),
    ("Pie & Donut Charts", (
        ("pie", "Pie Chart"),
        ("donut", "Donut Chart"),
        ("nested_donut", "Nested Donut Chart"),
        ("nightingale", "Nightingale Rose Chart"),
    )),
    ("Financial Charts", (
        ("candlestick", "Candlestick Chart"),
        ("ohlc", "OHLC Chart"),
        ("waterfall", "Waterfall Chart"),
        ("budget", "Budget vs Actual Chart"),
    )),
    ("Distribution Charts", (
        ("histogram", "Histogram"),
        ("box_plot", "Box Plot"),
        ("violin", "Violin Plot"),
        ("ridgeline", "Ridgeline Plot"),
    )),
    ("Correlation Charts", (
        ("scatter", "Scatter Plot"),
        ("bubble", "Bubble Chart"),
        ("hexbin", "Hexbin Chart"),
        ("correlation_matrix", "Correlation Matrix"),
    )),
    ("Heatmaps", (
        ("heatmap", "Heatmap"),
        ("calendar_heatmap", "Calendar Heatmap"),
        ("matrix_heatmap", "Matrix Heatmap"),
        ("density_heatmap", "Density Heatmap"),
    )),
    ("Progress & KPI Charts", (
        ("gauge", "Gauge Chart"),
        ("radial_gauge", "Radial Gauge"),
        ("progress_bar", "Progress Bar"),
        ("circular_progress", "Circular Progress"),
        ("kpi_scorecard", "KPI Scorecard"),
        ("bullet", "Bullet Chart"),
    )),
    ("Hierarchical Charts", (
        ("treemap", "Treemap"),
        ("sunburst", "Sunburst Chart"),
        ("icicle", "Icicle Chart"),
        ("circle_packing", "Circle Packing Chart"),
    )),
    ("Comparison Charts", (
        ("radar", "Radar Chart"),
        ("spider", "Spider Chart"),
        ("polar_area", "Polar Area Chart"),
        ("parallel_coordinates", "Parallel Coordinates Chart"),
    )),
    ("Geographic Charts", (
        ("choropleth", "Choropleth Map"),
        ("bubble_map", "Bubble Map"),
        ("marker_map", "Marker Map"),
        ("route_map", "Route Map"),
        ("geo_heat", "Heat Map"),
        ("geo_treemap", "Geographic Treemap"),
        ("google_map", "Google Map"),
    )),
    ("Timeline Charts", (
        ("timeline", "Timeline Chart"),
        ("gantt", "Gantt Chart"),
        ("milestone", "Milestone Chart"),
        ("roadmap", "Project Roadmap"),
    )),
    ("Network Charts", (
        ("network", "Network Graph"),
        ("force_directed", "Force-Directed Graph"),
        ("dependency", "Dependency Graph"),
        ("sankey", "Sankey Diagram"),
        ("chord", "Chord Diagram"),
    )),
    ("Flow Charts", (
        ("funnel", "Funnel Chart"),
        ("conversion_funnel", "Conversion Funnel"),
        ("sankey_flow", "Sankey Diagram"),
        ("flow_diagram", "Flow Diagram"),
    )),
    ("Statistical Charts", (
        ("control_chart", "Control Chart"),
        ("pareto", "Pareto Chart"),
        ("run_chart", "Run Chart"),
        ("qq_plot", "QQ Plot"),
    )),
    ("Specialized Analytics Charts", (
        ("cohort", "Cohort Analysis Chart"),
        ("retention", "Retention Curve"),
        ("journey", "Customer Journey Map"),
        ("forecast", "Forecast Chart"),
        ("trend", "Trend Projection Chart"),
        ("anomaly", "Anomaly Detection Chart"),
    )),
    ("Tables & Reporting Components", (
        ("data_grid", "Data Grid"),
        ("pivot", "Pivot Table"),
        ("cross_tab", "Cross Tabulation"),
        ("drilldown", "Drill-Down Table"),
        ("summary_table", "Summary Table"),
    )),
    ("Common Dashboard Elements", (
        ("kpi_cards", "KPI Cards"),
        ("metrics_cards", "Metrics Cards"),
        ("leaderboard", "Leaderboards"),
        ("activity_feed", "Activity Feeds"),
        ("alert_panel", "Alert Panels"),
        ("filters", "Filters"),
        ("date_range", "Date Range Pickers"),
        ("drilldown_widget", "Drill-Down Widgets"),
        ("export_widget", "Export Widgets"),
        ("search_panel", "Search Panels"),
    )),
)

ELEMENT_TYPES = {element_id: label for _, items in ELEMENTS for element_id, label in items}


def element_groups():
    return [
        {"label": label, "elements": [{"id": element_id, "label": name} for element_id, name in items]}
        for label, items in ELEMENTS
    ]


def clean_elements(selected):
    chosen = []
    seen = set()
    for raw in selected or []:
        element_id = str(raw or "").strip()
        if element_id in ELEMENT_TYPES and element_id not in seen:
            seen.add(element_id)
            chosen.append(element_id)
    return chosen


def describe_elements(selected):
    import uuid

    return [
        {"id": uuid.uuid4().hex[:8], "type": element_id, "label": ELEMENT_TYPES[element_id]}
        for element_id in clean_elements(selected)
    ]


def widget_dataset(snapshot, activity=None, alerts=None):
    bars = snapshot.get("bars") or []
    labels = [str(row.get("label") or "Item") for row in bars] or ["Total"]
    values = [_number(row.get("value")) for row in bars] or [0]
    days = [str(row.get("label") or "") for row in snapshot.get("series") or []]
    day_values = [_number(row.get("value")) for row in snapshot.get("series") or []]
    metrics = [
        {"label": str(row.get("label") or ""), "value": row.get("value")}
        for row in snapshot.get("metrics") or []
    ]
    return {
        "title": snapshot.get("title") or "Platform",
        "labels": labels,
        "values": values,
        "days": days,
        "dayValues": day_values,
        "metrics": metrics,
        "activity": list(activity or []),
        "alerts": list(alerts or []),
        "places": map_places(),
        "mapKey": map_key(),
    }


def map_key():
    try:
        from django.conf import settings

        return getattr(settings, "GOOGLE_MAPS_API_KEY", "") or ""
    except Exception:
        return ""


STATE_POINTS = {
    "AL": ("Alabama", 32.806671, -86.791130),
    "AK": ("Alaska", 61.370716, -152.404419),
    "AZ": ("Arizona", 33.729759, -111.431221),
    "AR": ("Arkansas", 34.969704, -92.373123),
    "CA": ("California", 36.116203, -119.681564),
    "CO": ("Colorado", 39.059811, -105.311104),
    "CT": ("Connecticut", 41.597782, -72.755371),
    "DE": ("Delaware", 39.318523, -75.507141),
    "DC": ("District of Columbia", 38.897438, -77.026817),
    "FL": ("Florida", 27.766279, -81.686783),
    "GA": ("Georgia", 33.040619, -83.643074),
    "HI": ("Hawaii", 21.094318, -157.498337),
    "ID": ("Idaho", 44.240459, -114.478828),
    "IL": ("Illinois", 40.349457, -88.986137),
    "IN": ("Indiana", 39.849426, -86.258278),
    "IA": ("Iowa", 42.011539, -93.210526),
    "KS": ("Kansas", 38.526600, -96.726486),
    "KY": ("Kentucky", 37.668140, -84.670067),
    "LA": ("Louisiana", 31.169546, -91.867805),
    "ME": ("Maine", 44.693947, -69.381927),
    "MD": ("Maryland", 39.063946, -76.802101),
    "MA": ("Massachusetts", 42.230171, -71.530106),
    "MI": ("Michigan", 43.326618, -84.536095),
    "MN": ("Minnesota", 45.694454, -93.900192),
    "MS": ("Mississippi", 32.741646, -89.678696),
    "MO": ("Missouri", 38.456085, -92.288368),
    "MT": ("Montana", 46.921925, -110.454353),
    "NE": ("Nebraska", 41.125370, -98.268082),
    "NV": ("Nevada", 38.313515, -117.055374),
    "NH": ("New Hampshire", 43.452492, -71.563896),
    "NJ": ("New Jersey", 40.298904, -74.521011),
    "NM": ("New Mexico", 34.840515, -106.248482),
    "NY": ("New York", 42.165726, -74.948051),
    "NC": ("North Carolina", 35.630066, -79.806419),
    "ND": ("North Dakota", 47.528912, -99.784012),
    "OH": ("Ohio", 40.388783, -82.764915),
    "OK": ("Oklahoma", 35.565342, -96.928917),
    "OR": ("Oregon", 44.572021, -122.070938),
    "PA": ("Pennsylvania", 40.590752, -77.209755),
    "RI": ("Rhode Island", 41.680893, -71.511780),
    "SC": ("South Carolina", 33.856892, -80.945007),
    "SD": ("South Dakota", 44.299782, -99.438828),
    "TN": ("Tennessee", 35.747845, -86.692345),
    "TX": ("Texas", 31.054487, -97.563461),
    "UT": ("Utah", 40.150032, -111.862434),
    "VT": ("Vermont", 44.045876, -72.710686),
    "VA": ("Virginia", 37.769337, -78.169968),
    "WA": ("Washington", 47.400902, -121.490494),
    "WV": ("West Virginia", 38.491226, -80.954453),
    "WI": ("Wisconsin", 44.268543, -89.616508),
    "WY": ("Wyoming", 42.755966, -107.302490),
}


def places_from_state_counts(rows):
    places = []
    for code, count in rows:
        point = STATE_POINTS.get(str(code or "").strip().upper())
        if point is None:
            continue
        name, latitude, longitude = point
        places.append({
            "label": name,
            "region": "United States",
            "latitude": latitude,
            "longitude": longitude,
            "value": int(count or 0),
            "unit": "visitors",
        })
    places.sort(key=lambda item: item["value"], reverse=True)
    return places


COUNTRY_POINTS = {
    "United States": ("United States", 39.8283, -98.5795),
    "Canada": ("Canada", 56.1304, -106.3468),
}


def places_from_country_counts(rows):
    places = []
    for name, count in rows:
        point = COUNTRY_POINTS.get(str(name or "").strip())
        if point is None:
            continue
        label, latitude, longitude = point
        places.append({
            "label": label,
            "region": label,
            "latitude": latitude,
            "longitude": longitude,
            "value": int(count or 0),
            "unit": "visitors",
        })
    places.sort(key=lambda item: item["value"], reverse=True)
    return places


def map_places():
    try:
        from django.db.models import Count
        from apps.profiles.models import Profile

        states = Profile.objects.exclude(state="").values("state").annotate(visitors=Count("id"))
        countries = Profile.objects.filter(state="").exclude(country="").values("country").annotate(visitors=Count("id"))
        state_rows = [(row["state"], row["visitors"]) for row in states]
        country_rows = [(row["country"], row["visitors"]) for row in countries]
    except Exception:
        state_rows = []
        country_rows = []
    return places_from_state_counts(state_rows) + places_from_country_counts(country_rows)


def _percent(value, base):
    if not base:
        return 0
    share = round(float(value) / float(base) * 100, 1)
    if share == int(share):
        return int(share)
    return share


def _ranked(pairs, base):
    rows = []
    for index, (label, value) in enumerate(pairs, start=1):
        rows.append({
            "rank": index,
            "label": label,
            "value": int(value or 0),
            "share": _percent(value, base),
        })
    return rows


def build_realtime(now, logins, people):
    """Realtime card totals. Device stays at zero until sign-in records a device."""
    from datetime import timedelta

    since = now - timedelta(minutes=30)
    buckets = [0] * 30
    active = 0
    for stamp in logins or []:
        if stamp is None or stamp < since or stamp > now:
            continue
        minute = int((stamp - since).total_seconds() // 60)
        if minute < 0 or minute >= 30:
            continue
        active += 1
        buckets[minute] += 1
    peak = max(buckets) if buckets else 0
    minutes = []
    for value in buckets:
        percent = int(round(value / peak * 100)) if peak else 0
        minutes.append({"value": value, "percent": percent})
    total = len(people or [])
    role_counts = {}
    verified = 0
    for person in people or []:
        role = person.get("access") or "User"
        role_counts[role] = role_counts.get(role, 0) + 1
        if person.get("verified"):
            verified += 1
    audiences = [("All users", total), ("Signed in during the last 30 minutes", active), ("Verified", verified)]
    for label, value in sorted(role_counts.items(), key=lambda item: (-item[1], item[0])):
        audiences.append((label, value))
    return {
        "active_users": active,
        "minutes": minutes,
        "devices": [
            {"label": "Desktop", "value": 0, "share": 0},
            {"label": "Mobile", "value": 0, "share": 0},
            {"label": "Tablet", "value": 0, "share": 0},
        ],
        "device_gradient": "#e6ebf2",
        "device_note": "Sign-in does not record a device category.",
        "sources": _ranked([("(direct)", total)], total),
        "source_note": "Accounts have no campaign or referrer, so every user is direct.",
        "audiences": _ranked(audiences, total),
    }


def _number(value):
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return value
    text = str(value or "").strip().lower()
    if text in {"yes", "ok", "enabled"}:
        return 1
    if text in {"no", "down", "disabled"}:
        return 0
    try:
        return float(text)
    except ValueError:
        return 1
