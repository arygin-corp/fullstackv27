import json
import os
import random
import re
from pathlib import Path

from django.conf import settings

from .scoring import compute_smart_score, expand_query
from .textutil import (
    calculate_domain_match_score,
    clamp01,
    clean_text,
    compare_strings,
    escape_html,
    grade_and_color,
    is_uuid_like,
    normalize_domain_name,
    normalize_metadata_list,
    normalize_metadata_value,
    to_percent_score,
    to_singular,
    to_slug,
    to_unit_score,
)

TYPE_CONFIG = {
    "DATASETS": {
        "requesterUse": "data analysis, reporting, and business insights",
        "organizationalValue": "enabling consistent reporting, governance, and informed decision-making",
    },
    "DASHBOARDS": {
        "requesterUse": "monitoring key business metrics and operational performance",
        "organizationalValue": "providing visibility into business performance and operational trends",
    },
    "APIS": {
        "requesterUse": "integrating enterprise data into business applications and services",
        "organizationalValue": "improving interoperability and reducing data integration effort",
    },
    "DATA SCIENCE": {
        "requesterUse": "predictive analytics and machine learning driven decision support",
        "organizationalValue": "improving forecasting accuracy and data driven decision making",
    },
}

INTENT_PATTERNS = {
    "EXACT_LOOKUP": (re.compile(r"^(sku:|id:|exact:)\b\d{5,}\b", re.I), re.compile(r"^find\s+\w+", re.I)),
    "DISCOVERY": (re.compile(r"show me|browse|explore|what|list|all", re.I), re.compile(r"available|options", re.I)),
    "TROUBLESHOOTING": (re.compile(r"error|fail|issue|problem|not working|broken|help|fix", re.I),),
    "COMPARISON": (re.compile(r"vs\b|versus|compare|difference|better|best|or", re.I), re.compile(r"which", re.I)),
    "ACCESS_REQUEST": (re.compile(r"request|access|need|get|want|require", re.I), re.compile(r"permission|authorize", re.I)),
}
INTENT_WEIGHTS = {"EXACT_LOOKUP": 1.0, "DISCOVERY": 0.8, "TROUBLESHOOTING": 0.9, "COMPARISON": 0.85, "ACCESS_REQUEST": 0.9}


def json_root():
    """Pipeline output: backend/assets/json/marketplace."""
    configured = os.getenv("MARKETPLACE_JSON_ROOT", "").strip() or os.getenv("SUGGESTED_AI_JSON_ROOT", "").strip()
    if not configured:
        configured = str(getattr(settings, "MARKETPLACE_JSON_ROOT", "") or "")
    if configured:
        return Path(configured)
    return Path(getattr(settings, "BASE_DIR", Path.home())) / "assets" / "json" / "marketplace"


def _read_json(path, default):
    try:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8")) or default
    except (OSError, json.JSONDecodeError):
        return default
    return default


class SuggestedAIEngine:
    def __init__(self):
        root = json_root()
        self.products = _read_json(root / "products" / "products_enriched.json", [])
        if not isinstance(self.products, list):
            self.products = []
        self.history = _read_json(root / "historical" / "enriched_orders.json", [])
        if not isinstance(self.history, list):
            self.history = []
        self.provisioned_ad_groups = set()
        for order in self.history:
            if not isinstance(order, dict):
                continue
            if str(order.get("status") or "").lower() not in {"provisioned", "completed", "approved"}:
                continue
            product_id = order.get("product_id")
            adgroup = order.get("adgroup")
            if product_id and adgroup:
                self.provisioned_ad_groups.add(f"{str(product_id).lower()}:{str(adgroup).lower()}")
        domains = _read_json(root / "domains" / "domains.json", [])
        self.domain_name_to_id = {}
        self.domain_id_to_name = {}
        for domain in domains if isinstance(domains, list) else []:
            identifier = str(domain.get("id") or "").strip()
            name = normalize_domain_name(str(domain.get("name") or "").strip())
            alt = normalize_domain_name(str(domain.get("alt_name") or "").strip())
            if identifier and name:
                self.domain_name_to_id[name] = identifier
                self.domain_id_to_name[identifier.lower()] = name
            if identifier and alt:
                self.domain_name_to_id[alt] = identifier

    def get_suggestions(self, query, user_context=None):
        user_context = dict(user_context or {})
        if not self.products:
            return {"suggestions": [], "input_grading": self._grades(user_context), "ranking_mode": "default"}
        cleaned = clean_text(query)
        ranking_mode = str(user_context.get("ranking_mode") or user_context.get("rankingMode") or "default").lower()
        selected_domain = user_context.get("selectedDomain") or user_context.get("v_dar_dataDomainSelect") or ""
        selected_domain_id = self._resolve_domain_id(selected_domain)
        db_raw = user_context.get("db_raw") or ""
        tbl_raw = user_context.get("tbl_raw") or ""
        history = user_context.get("history") or []
        intent = self._classify_intent(cleaned, user_context)
        api_search = user_context.get("suggestion_kind") == "api"
        pool = self.products if api_search else self._suggestion_pool(user_context)
        if db_raw and tbl_raw:
            candidates = self._priority_retrieval(db_raw, tbl_raw)
            if not candidates:
                candidates = self._vector_retrieval(cleaned, pool, 50)
        else:
            candidates = self._vector_retrieval(cleaned, pool, len(pool) if api_search else 50)
        form_values = {
            "v_dar_dataDomainSelect": user_context.get("v_dar_dataDomainSelect") or selected_domain,
            "v_dar_platform": user_context.get("v_dar_platform") or "",
            "v_dar_post_table_names": tbl_raw,
            "v_dar_DataReqDescription": user_context.get("desc_raw") or "",
            "v_dar_businessJustification": user_context.get("justification_raw") or "",
        }
        scored = []
        for candidate in candidates:
            trend = {"score": 0, "isTrending": False, "isNew": False, "isSeasonal": False, "velocity": 0, "recencyBoost": 0.9 ** 30}
            smart = compute_smart_score(candidate, cleaned, candidate.get("similarity") or 0, user_context, form_values)
            unit = (smart.get("score") or 0) / 100
            historical = self._historical_matches(candidate, history, user_context)
            verified = self._calculate_verification(historical, unit, user_context, candidate)
            score = unit * (1 + trend["score"] * 0.1)
            platform = str(user_context.get("v_dar_platform") or "").strip().lower()
            product_platform = str(candidate.get("platform") or "").strip().lower()
            penalties = []
            if platform and product_platform and platform != product_platform:
                score *= 0.95
                penalties.append("Platform Mismatch")
            domain_match = self._matches_domain(selected_domain_id or selected_domain, candidate)
            if domain_match.get("match") is False:
                score *= 0.95
                penalties.append(f"Domain Mismatch ({domain_match.get('mode') or 'unknown'})")
            if platform and re.search(r"TBDP|IRM|PASA|C360|Q360", user_context.get("v_dar_platform") or "", re.I) and not candidate.get("adgroup"):
                score *= 0.95
                penalties.append("Missing Adgroup in TBDP context")
            scored.append({
                **candidate,
                "smartScore": smart,
                "semanticScore": to_unit_score(candidate.get("similarity")),
                "finalScore": score,
                "historicalMatch": historical,
                "isVerified": verified,
                "is_steward_verified": historical.get("stewardVerified") is True,
                "verificationBoost": 1.1 if verified or historical.get("stewardVerified") else 1.0,
                "trendScore": trend["score"],
                "trendData": trend,
                "temporalBoost": 1,
                "applied_penalties": penalties,
                "rankingMode": ranking_mode,
            })
        if api_search:
            for candidate in scored:
                tier, platform_match, domain_match = self._api_priority(user_context, candidate)
                candidate["api_priority"] = tier
                candidate["api_platform_match"] = platform_match
                candidate["api_domain_match"] = domain_match
            ranked = sorted(
                scored,
                key=lambda item: (
                    item.get("api_priority", 2),
                    -(item.get("similarity") or 0),
                    -(item.get("finalScore") or 0),
                ),
            )
            suggestions = [self._flat_result(item, cleaned, user_context, index, intent) for index, item in enumerate(ranked[:5])]
            return {
                "suggestions": suggestions,
                "input_grading": self._grades(user_context),
                "ranking_mode": ranking_mode,
            }
        if ranking_mode == "hybrid":
            ranked = []
            for candidate in scored:
                human = self._human_first(candidate, cleaned, to_unit_score(candidate.get("semanticScore")))
                candidate = {**candidate, "humanFirstScore": human, "finalRankingScore": human}
                ranked.append(candidate)
            ranked.sort(key=lambda item: item.get("finalRankingScore") or 0, reverse=True)
            ranked = ranked[:12]
        else:
            ranked = sorted(scored, key=lambda item: item.get("finalScore") or 0, reverse=True)
            for candidate in ranked:
                base = candidate.get("finalScore") or 0
                candidate["finalRankingScore"] = base * (candidate.get("verificationBoost") or 1.0)
            ranked.sort(key=lambda item: item.get("finalRankingScore") or 0, reverse=True)
            ranked = self._diversify(ranked[:8])
        # Production applies the 75 cutoff only in hybrid mode. Default mode returns the ranked list.
        filtered = [item for item in ranked if self._passes_threshold(item)] if ranking_mode == "hybrid" else ranked
        suggestions = [self._flat_result(item, cleaned, user_context, index, intent) for index, item in enumerate(filtered[:5])]
        return {
            "suggestions": suggestions,
            "input_grading": self._grades(user_context),
            "ranking_mode": ranking_mode,
        }

    def _passes_threshold(self, candidate):
        if candidate.get("matchSource") == "product_master_exact":
            return True
        score = candidate.get("finalRankingScore")
        if score is None:
            score = candidate.get("finalScore")
        if score is None:
            score = (candidate.get("smartScore") or {}).get("score", 0) / 100
        percentage = round(score * 100) if score <= 1 else round(score)
        return percentage >= 75

    def _priority_retrieval(self, db_raw, tbl_raw):
        db_input = normalize_metadata_value(db_raw)
        requested = [
            normalize_metadata_value(item)
            for item in (tbl_raw if isinstance(tbl_raw, list) else str(tbl_raw or "").split(","))
            if normalize_metadata_value(item)
        ]
        matches = []
        for product in self.products:
            assets = self._assets(product)
            matched = []
            for asset in assets:
                db_match = normalize_metadata_value(asset.get("dbname")) == db_input
                table_match = normalize_metadata_value(asset.get("elementname")) in requested
                columns = [normalize_metadata_value(name) for name in (asset.get("column_names") or [])]
                column_match = any(name in requested for name in columns)
                if db_match and (table_match or column_match):
                    matched.append(asset)
            if not matched:
                continue
            tables = normalize_metadata_list([asset.get("elementname") for asset in matched])
            matches.append({
                **product,
                "similarity": 1.0,
                "matchSource": "product_master_exact",
                "matchedDenodoAssets": matched,
                "db_name": db_input,
                "tbl_name": ", ".join(tables),
                "match_percentage": 100,
                "manual_verified": True,
                "verified": True,
                "isVerified": True,
            })
        return matches

    def _suggestion_pool(self, user_context):
        platform = str(user_context.get("v_dar_platform") or "")
        if not re.search(r"\bapi\b", platform, re.I):
            return self.products
        api_products = [
            product for product in self.products
            if "api" in str(product.get("datatype") or product.get("type") or "").lower()
        ]
        return api_products or self.products

    def _name_similarity(self, needle, value):
        text = str(value or "").lower()
        if not needle or not text:
            return 0
        if needle in text:
            return 1.0
        return clamp01(compare_strings(needle, text))

    def _vector_retrieval(self, query, products, top_k):
        rows = []
        needle = str(query or "").lower()
        for product in products:
            similarity = max(
                self._name_similarity(needle, product.get("name")),
                self._name_similarity(needle, product.get("original_name")),
                self._name_similarity(needle, product.get("resourcename")),
            )
            if similarity > 0.15:
                rows.append({**product, "similarity": similarity})
        rows.sort(key=lambda item: item["similarity"], reverse=True)
        return rows[:top_k]

    def _assets(self, product):
        denodo = product.get("denodo") or {}
        assets = denodo.get("assets")
        if isinstance(assets, list) and assets:
            rows = []
            for asset in assets:
                dbname = str(asset.get("dbname") or "").strip()
                element = str(asset.get("elementname") or "").strip()
                if dbname and element:
                    rows.append({
                        **asset,
                        "dbname": dbname,
                        "elementname": element,
                        "column_names": normalize_metadata_list(asset.get("column_names") or asset.get("column_name")),
                    })
            return rows
        databases = normalize_metadata_list(denodo.get("dbname") or product.get("db_name"))
        elements = normalize_metadata_list(denodo.get("elementname") or product.get("tbl_name"))
        columns = normalize_metadata_list(denodo.get("column_names") or denodo.get("column_name"))
        if not databases or not elements:
            return []
        if len(databases) == 1:
            return [{"dbname": databases[0], "elementname": element, "column_names": columns} for element in elements]
        if len(databases) == len(elements):
            return [
                {"dbname": databases[index], "elementname": element, "column_names": columns}
                for index, element in enumerate(elements)
            ]
        return []

    def _historical_matches(self, product, history, context):
        brief = context.get("desc_raw") or context.get("description") or ""
        intended = context.get("justification_raw") or context.get("business_justification") or ""
        if not str(brief).strip() or not str(intended).strip():
            return {
                "count": 0,
                "orders": [],
                "departments": [],
                "topJustification": None,
                "stewardVerified": False,
                "verificationReason": "brief_description and intended_use are required",
                "similarityThreshold": 0.75,
            }
        product_id = str(product.get("id") or product.get("identifier") or "").strip()
        product_name = normalize_metadata_value(product.get("name"))
        matches = []
        for order in history or []:
            order_id = str(order.get("product_id") or order.get("product_identifier") or order.get("identifier") or "").strip()
            order_name = normalize_metadata_value(order.get("product_name") or order.get("name"))
            same_product = (product_id and order_id and product_id == order_id) or (product_name and order_name and product_name == order_name)
            if not same_product:
                continue
            prior_brief = order.get("brief_description") or order.get("description") or order.get("desc_raw") or ""
            prior_use = order.get("intended_use") or order.get("business_justification") or order.get("justification") or ""
            if compare_strings(brief, prior_brief) >= 0.75 and compare_strings(intended, prior_use) >= 0.75:
                matches.append(order)
        departments = list({order.get("department") or "Unknown" for order in matches})
        return {
            "count": len(matches),
            "orders": matches[:3],
            "departments": departments,
            "topJustification": (matches[0].get("intended_use") or matches[0].get("justification")) if matches else None,
            "stewardVerified": bool(matches),
        }

    def _calculate_verification(self, historical, ai_score, context, candidate):
        if candidate.get("matchSource") == "product_master_exact" and candidate.get("matchedDenodoAssets"):
            return True
        requested_db = normalize_metadata_value(context.get("db_raw"))
        requested = [
            normalize_metadata_value(item)
            for item in (context.get("tbl_raw") if isinstance(context.get("tbl_raw"), list) else str(context.get("tbl_raw") or "").split(","))
            if normalize_metadata_value(item)
        ]
        for asset in self._assets(candidate):
            columns = [normalize_metadata_value(name) for name in (asset.get("column_names") or [])]
            if normalize_metadata_value(asset.get("dbname")) == requested_db and (
                normalize_metadata_value(asset.get("elementname")) in requested or any(name in requested for name in columns)
            ):
                return True
        percentage = min(to_percent_score(ai_score), 100)
        has_narrative = len(str(context.get("desc_raw") or "").strip()) > 5 and len(str(context.get("justification_raw") or "").strip()) > 5
        return (historical.get("count", 0) > 0 and percentage >= 95) or (bool(requested_db and requested and has_narrative) and percentage >= 95)

    def _resolve_domain_id(self, selected):
        raw = str(selected or "").strip()
        if not raw:
            return ""
        if is_uuid_like(raw):
            return raw
        norm = normalize_domain_name(raw)
        singular = to_singular(norm)
        if norm in self.domain_name_to_id:
            return self.domain_name_to_id[norm]
        if singular in self.domain_name_to_id:
            return self.domain_name_to_id[singular]
        for key, identifier in self.domain_name_to_id.items():
            if key.startswith(norm) or key.startswith(singular):
                return identifier
        return ""

    def _product_domain_name(self, product):
        domain = product.get("domain")
        if isinstance(domain, str) and domain.strip():
            return domain.strip()
        if isinstance(product.get("domain_name"), str) and product["domain_name"].strip():
            return product["domain_name"].strip()
        if isinstance(domain, dict) and str(domain.get("name") or "").strip():
            return domain["name"].strip()
        if isinstance(product.get("categories"), str) and product["categories"].strip():
            return product["categories"].strip()
        if product.get("domain_id"):
            return self.domain_id_to_name.get(str(product["domain_id"]).lower(), "")
        return ""

    def _api_priority(self, context, product):
        selected_platform = str(context.get("v_dar_platform") or "").strip().lower()
        product_platform = str(product.get("platform") or "").strip().lower()
        platform_match = bool(selected_platform) and selected_platform == product_platform
        selected_domain = context.get("selectedDomain") or context.get("v_dar_dataDomainSelect") or ""
        domain_match = self._api_domain_match(selected_domain, product)
        if platform_match and domain_match:
            return 0, platform_match, domain_match
        if platform_match or domain_match:
            return 1, platform_match, domain_match
        return 2, platform_match, domain_match

    def _api_domain_match(self, selected, product):
        if not str(selected or "").strip():
            return False
        if self._matches_domain(selected, product).get("match") is True:
            return True
        onets = str(product.get("onetsdomain") or "").strip()
        if not onets:
            return False
        return calculate_domain_match_score(
            normalize_domain_name(onets),
            normalize_domain_name(str(selected)),
        ) >= 0.8

    def _api_match_reason(self, product, query, context, platform_match, domain_match):
        platform = escape_html(context.get("v_dar_platform") or "API")
        domain = str(context.get("selectedDomain") or context.get("v_dar_dataDomainSelect") or "").strip()
        domain_text = escape_html(domain) if domain else "not selected"
        api_name = escape_html(query or "the API name")
        datatype = str(product.get("datatype") or product.get("type") or "")
        subject = "This API" if "api" in datatype.lower() else "This product"
        if platform_match and domain_match:
            return (
                f"{subject} is listed first because it matches both the selected platform <strong>{platform}</strong> "
                f"and the selected domain <strong>{domain_text}</strong>. "
                f"The API name <strong>{api_name}</strong> matches this product."
            )
        if domain_match:
            return (
                f"{subject} matches the selected domain <strong>{domain_text}</strong>, "
                f"but it does not match the selected platform <strong>{platform}</strong>. "
                f"It was suggested from the API name <strong>{api_name}</strong>."
            )
        if platform_match:
            domain_clause = (
                f"It does not match the selected domain <strong>{domain_text}</strong>."
                if domain else
                "No domain was selected."
            )
            return (
                f"{subject} matches the selected platform <strong>{platform}</strong>. "
                f"{domain_clause} It was suggested from the API name <strong>{api_name}</strong>."
            )
        return (
            f"{subject} was suggested from the API name <strong>{api_name}</strong>. "
            f"It does not match the selected platform <strong>{platform}</strong> "
            f"or the selected domain <strong>{domain_text}</strong>."
        )

    def _matches_domain(self, selected, product):
        raw = str(selected or "").strip()
        if not raw:
            return {"match": None, "mode": "none"}
        selected_id = self._resolve_domain_id(raw)
        if selected_id and product.get("domain_id"):
            return {"match": selected_id.lower() == str(product["domain_id"]).lower(), "mode": "id"}
        name = normalize_domain_name(self._product_domain_name(product))
        if not name:
            return {"match": False, "mode": "name"}
        return {"match": calculate_domain_match_score(name, normalize_domain_name(raw)) >= 0.8, "mode": "name"}

    def _classify_intent(self, query, context):
        scores = {}
        for intent, patterns in INTENT_PATTERNS.items():
            score = 0
            for pattern in patterns:
                if pattern.search(query or ""):
                    score += INTENT_WEIGHTS[intent]
            scores[intent] = score
        if context.get("db_raw") or context.get("tbl_raw"):
            scores["ACCESS_REQUEST"] = scores.get("ACCESS_REQUEST", 0) + 0.3
        primary = max(scores, key=scores.get)
        return {"primary": primary, "confidence": min(scores[primary], 1.0), "allScores": scores}

    def _human_first(self, product, query, semantic):
        phrase = str(query or "").lower().strip()
        name = str(product.get("name") or "").lower()
        if phrase and name == phrase:
            name_match = 1.0
        elif phrase and phrase in name:
            name_match = 0.95
        else:
            tokens = [token for token in phrase.split() if len(token) > 2]
            hits = sum(1 for token in tokens if token in name)
            name_match = min(0.9, (hits / len(tokens)) * 0.9) if tokens else 0
        return clamp01(name_match * 0.35 + 0.6 * 0.30 + 0.55 * 0.20 + clamp01(semantic) * 0.15)

    def _diversify(self, candidates):
        counts = {}
        results = []
        for candidate in candidates:
            domain = candidate.get("domain_id") or "unknown"
            counts[domain] = counts.get(domain, 0) + 1
            if counts[domain] > 5:
                continue
            results.append(candidate)
        if not any(item.get("isVerified") for item in results):
            verified = next((item for item in candidates if item.get("isVerified")), None)
            if verified and verified not in results:
                results.append(verified)
        results.sort(key=lambda item: item.get("finalRankingScore") or 0, reverse=True)
        return results

    def _grades(self, context):
        return {
            "dbGrade": "D",
            "tableGrade": "D",
            "descriptionGrade": self._narrative_grade(context.get("desc_raw"), "v_dar_DataReqDescription"),
            "justificationGrade": self._narrative_grade(context.get("justification_raw"), "v_dar_businessJustification"),
        }

    def _narrative_grade(self, user_input, field_name):
        if not user_input or not self.history:
            return "D"
        values = []
        for order in self.history:
            form_data = order.get("formData")
            if not form_data:
                continue
            rows = form_data if isinstance(form_data, list) else [form_data]
            for field in rows:
                if isinstance(field, dict) and field.get("name") == field_name and field.get("value"):
                    values.append(field["value"])
        if not values:
            return "D"
        score = max(compare_strings(user_input, value) for value in values[:200])
        if score >= 0.95:
            return "A"
        if score >= 0.80:
            return "B"
        if score >= 0.60:
            return "C"
        return "D"

    def _flat_result(self, candidate, query, context, index, intent):
        requested_database = str(context.get("db_raw") or "").strip()
        requested_key = normalize_metadata_value(requested_database)
        requested_items = normalize_metadata_list(
            context.get("tbl_raw") if isinstance(context.get("tbl_raw"), list) else str(context.get("tbl_raw") or "").split(",")
        )
        assets = self._assets(candidate)
        database_assets = [asset for asset in assets if normalize_metadata_value(asset.get("dbname")) == requested_key]
        database_matched = bool(requested_key) and bool(database_assets)
        product_tables = normalize_metadata_list([asset.get("elementname") for asset in database_assets])
        matched_tables = [
            item for item in requested_items
            if any(normalize_metadata_value(table) == normalize_metadata_value(item) for table in product_tables)
        ]
        database_columns = normalize_metadata_list([
            column for asset in database_assets for column in (asset.get("column_names") or [])
        ])
        matched_columns = []
        for item in requested_items:
            if any(normalize_metadata_value(table) == normalize_metadata_value(item) for table in matched_tables):
                continue
            if any(normalize_metadata_value(column) == normalize_metadata_value(item) for column in database_columns):
                matched_columns.append(item)
        missing = [
            item for item in requested_items
            if item not in matched_tables and not any(normalize_metadata_value(column) == normalize_metadata_value(item) for column in matched_columns)
        ]
        direct = database_matched and (bool(matched_tables) or bool(matched_columns))
        raw_score = candidate.get("finalScore")
        if raw_score is None:
            raw_score = (candidate.get("smartScore") or {}).get("score", 0) / 100
        calculated = round(raw_score * 100) if raw_score <= 1 else round(raw_score)
        match_percentage = 100 if direct else max(0, min(100, calculated))
        containing_tables = normalize_metadata_list([
            asset.get("elementname") for asset in database_assets
            if any(
                normalize_metadata_value(column) == normalize_metadata_value(name)
                for column in (asset.get("column_names") or [])
                for name in matched_columns
            )
        ])
        selected_tables = matched_tables if matched_tables else containing_tables[:1]
        selected_assets = [
            asset for asset in database_assets
            if any(normalize_metadata_value(table) == normalize_metadata_value(asset.get("elementname")) for table in selected_tables)
        ]
        selected_columns = normalize_metadata_list([
            column for asset in selected_assets for column in (asset.get("column_names") or [])
        ])
        total_requested = len(matched_tables) + len(matched_columns) + len(missing)
        coverage = round(((len(matched_tables) + len(matched_columns)) / total_requested) * 100) if total_requested else 0
        grading = {"grade": "A", "modifier": "+", "class": "success", "fullGrade": "A+"} if direct else grade_and_color(match_percentage)
        is_denodo_verified = candidate.get("manual_verified") is True or direct
        verified = is_denodo_verified or candidate.get("is_steward_verified") is True or bool(candidate.get("isVerified"))
        if context.get("suggestion_kind") == "api":
            reason = self._api_match_reason(
                candidate,
                query,
                context,
                candidate.get("api_platform_match") is True,
                candidate.get("api_domain_match") is True,
            )
        else:
            reason = self._match_reason(
                requested_database, direct, database_matched, matched_tables, matched_columns,
                missing, selected_tables, selected_columns,
            )
        justification = self._business_justification(candidate, context, selected_tables, matched_columns)
        explanation = self._nlg_explanation(candidate, query, context, {
            "semantic": to_unit_score(candidate.get("semanticScore") if candidate.get("semanticScore") is not None else candidate.get("similarity") or 0),
            "historical": None,
            "technical": 0.8 if context.get("db_raw") and database_matched else 0.3,
            "verified": is_denodo_verified or candidate.get("is_steward_verified") is True,
            "trend": candidate.get("trendData") or {"score": 0, "isTrending": False, "isNew": False, "isSeasonal": False, "velocity": 0, "recencyBoost": 0.9 ** 30},
        })
        domain_name = self._product_domain_name(candidate) or "Unknown Domain"
        identifier = str(candidate.get("identifier") or candidate.get("id") or "")
        manual_verified = candidate.get("manual_verified") is True
        if manual_verified:
            verification_source = "manual"
        elif candidate.get("is_steward_verified") is True:
            verification_source = "historical_steward_approved_request"
        elif is_denodo_verified:
            verification_source = "relational_denodo_match"
        else:
            verification_source = "none"
        shown_score = 1.0 if direct else (raw_score or 0)
        display_percentage = round(shown_score * 100) if shown_score <= 1 else round(shown_score)
        return {
            "sku": candidate.get("sku") or f"PROD-{candidate.get('id') or index}",
            "name": candidate.get("name"),
            "original_name": candidate.get("original_name") or candidate.get("resourcename") or "",
            "identifier": identifier,
            "short_desc": candidate.get("short_desc") or candidate.get("description") or candidate.get("listdetail") or candidate.get("brief_desc") or "No description provided.",
            "domain_id": candidate.get("domain_id"),
            "domain": domain_name,
            "type": candidate.get("type") or candidate.get("datatype") or "Unknown",
            "path": candidate.get("path") or candidate.get("datatypepath") or "general",
            "steward_name": candidate.get("steward_name") or candidate.get("owner") or "Not Assigned",
            "steward_email": candidate.get("steward_email") or candidate.get("owneremail") or "Not Assigned",
            "is_steward_verified": candidate.get("is_steward_verified") is True,
            "manual_verified": manual_verified,
            "verified": verified,
            "verification_source": verification_source,
            "match_source": candidate.get("matchSource") or "semantic",
            "adgroup_provisioned": self._adgroup_provisioned(candidate),
            "contact_name": candidate.get("contact_name") or candidate.get("poc") or "Not Assigned",
            "contact_email": candidate.get("contact_email") or candidate.get("pocemail") or "Not Assigned",
            "classification": candidate.get("classification") or "Internal",
            "intended_use": candidate.get("intended_use") or "",
            "image": candidate.get("image") or "assets/images/products/default-icon.svg",
            "is_active": candidate.get("is_active") is not False,
            "adgroup": candidate.get("adgroup") or "",
            "spi_id": candidate.get("spi_id") or "",
            "onetsdomain_id": candidate.get("onetsdomain_id") or "",
            "product_affiliate": candidate.get("product_affiliate") or "",
            "match_percentage": match_percentage,
            "grade": grading["grade"],
            "modifier": grading["modifier"],
            "color_class": grading["class"],
            "full_grade": grading.get("fullGrade"),
            "reason": reason,
            "business_justification": justification,
            "ai_explanation": self._ai_explanation(candidate, context, matched_tables, matched_columns),
            "slug": to_slug(candidate.get("name") or ""),
            "detailed_explanation": self._detail_html(candidate, explanation),
            "match_factors": [component["type"] for component in explanation["components"]],
            "nlg_explanation": explanation,
            "peer_usage_count": candidate.get("peer_usage_count") or 0,
            "column_coverage_score": coverage,
            "trend_score": f"{float(candidate.get('trendScore') or 0):.2f}",
            "predicted_need": candidate.get("predicted_need") or "Medium",
            "access_velocity": candidate.get("access_velocity") or "0.0",
            "view": f"products/{candidate.get('path') or 'general'}/{identifier}",
            "checkout": f"checkout/{identifier}",
            "badges": ["VERIFIED MATCH", "AI SUGGESTION"] if is_denodo_verified else ["AI SUGGESTION"],
            "historicalMatch": candidate.get("historicalMatch") or {
                "count": 0, "orders": [], "departments": [], "topJustification": None,
                "stewardVerified": False, "verificationReason": "brief_description and intended_use are required",
                "similarityThreshold": 0.75,
            },
            "requested_db_name": requested_database,
            "db_name": requested_database if database_matched else candidate.get("db_name") or "N/A",
            "tbl_name": ", ".join(selected_tables) if selected_tables else (product_tables[0] if product_tables else "N/A"),
            "matched_tables": matched_tables,
            "matched_columns": matched_columns,
            "missing_requested_items": missing,
            "available_columns": selected_columns,
            "available_tables": selected_tables,
            "selected_tables": selected_tables,
            "intent_detected": intent.get("primary") or "UNKNOWN",
            "ranking_mode": candidate.get("rankingMode") or "default",
            "ranking_metadata": {
                "semantic_score": to_percent_score(candidate.get("semanticScore") if candidate.get("semanticScore") is not None else candidate.get("similarity") or 0),
                "semantic_score_unit": to_unit_score(candidate.get("semanticScore") if candidate.get("semanticScore") is not None else candidate.get("similarity") or 0),
                "temporal_boost": candidate.get("temporalBoost") or 1,
                "verification_boost": candidate.get("verificationBoost") or 1,
                "manual_verified": is_denodo_verified,
                "database_matched": database_matched,
                "matched_table_count": len(selected_tables or matched_tables),
                "matched_column_count": len(matched_columns),
                "available_column_count": len(selected_columns),
                "missing_item_count": len(missing),
                "display_percentage": 0 if display_percentage != display_percentage else display_percentage,
            },
        }

    def _overflow_link(self, remaining, noun):
        suffix = "" if remaining == 1 else "s"
        return f"+{remaining} more {noun}{suffix}"

    def _format_tables(self, tables):
        unique = list(dict.fromkeys(str(table).strip() for table in tables if str(table).strip()))
        if not unique:
            return "<strong>N/A</strong>"
        visible = unique[:3]
        markup = '<strong style="color:#000000;font-weight:700;">' + ", ".join(visible) + "</strong>"
        if len(unique) <= 3:
            return markup
        remaining = len(unique) - 3
        return markup + f' <a class="table-overflow" href="#">{self._overflow_link(remaining, "table")}</a>'

    def _format_columns(self, columns):
        unique = list(dict.fromkeys(str(column).strip() for column in columns if str(column).strip()))
        if not unique:
            return "<strong>N/A</strong>"
        markup = '<strong style="color:#000000;font-weight:700;">' + ", ".join(unique[:3]) + "</strong>"
        if len(unique) <= 3:
            return markup
        remaining = len(unique) - 3
        return markup + f' <a class="column-overflow" href="#">{self._overflow_link(remaining, "field")}.</a>'

    def _match_reason(self, database, direct, database_matched, matched_tables, matched_columns, missing, selected_tables, selected_columns):
        if not direct:
            return (
                f"No confirmed metadata match was found for the requested database: <strong>{escape_html(database or 'Not provided')}</strong>. "
                "This product was returned as a semantic suggestion."
            )
        table_text = self._format_tables([escape_html(table) for table in selected_tables]) if selected_tables else "<strong>N/A</strong>"
        column_text = self._format_columns([escape_html(column) for column in selected_columns]) if selected_columns else "<strong>N/A</strong>"
        table_label = "the selected table name is" if len(selected_tables) == 1 else "the selected table names are"
        column_label = "the available column field within the selected table is" if len(selected_columns) == 1 else "the available column fields within the selected table(s) are"
        closer = "" if 'class="column-overflow"' in column_text else "."
        return (
            f"This dataset was recommended because it contains the database <strong>{escape_html(database)}</strong>, "
            f"{table_label} {table_text}, and {column_label} {column_text}{closer}"
        )

    def _requester_use(self, product_type):
        config = TYPE_CONFIG.get(str(product_type or "").strip().upper())
        if not config:
            return "reporting, analytics, and business operations"
        return config["requesterUse"]

    def _business_justification(self, product, context, selected_tables, matched_columns):
        dataset_name = product.get("name") or "This dataset"
        problem = product.get("short_desc") or "the need for trusted enterprise data"
        use = self._requester_use(product.get("type"))
        if selected_tables:
            relation = f"it contains the {', '.join(selected_tables)} table"
            if matched_columns:
                relation += f" and the {', '.join(matched_columns)} attribute"
            if context.get("db_raw"):
                relation += f" within the {context.get('db_raw')} database"
            relation += " that support the requested reporting requirements"
        else:
            relation = "it aligns with the requested business and technical requirements"
        return (
            f"{dataset_name} helps solve {problem}. Requesters can use it for {use}. "
            "It provides value to the organization by enabling consistent reporting, governance, and informed decision-making. "
            f"It is relevant because {relation}."
        )

    def _ai_explanation(self, product, context, matched_tables, matched_columns):
        product_type = str(product.get("type") or "Resource")
        type_label = product_type[:-1].lower() if product_type.endswith("S") else product_type.lower()
        config = TYPE_CONFIG.get(product_type.upper(), {
            "requesterUse": "reporting, analytics, and business operations",
            "organizationalValue": "supporting informed business decisions",
        })
        terms = ", ".join(part for part in (context.get("db_raw"), context.get("tbl_raw")) if part)
        tables = ", ".join(matched_tables) or "relevant assets"
        columns = ", ".join(matched_columns) or "relevant business data"
        fields = ", ".join(matched_columns) or "relevant data fields"
        table_names = ", ".join(matched_tables) or "relevant data assets"
        database = context.get("db_raw") or "the requested database"
        if matched_tables or matched_columns:
            matched = f"""
      <p>
        <strong>What matched?</strong><br>
        Your search for "<strong>{terms}</strong>" was matched against the contents of this resource and found relevant connections.
        Specifically, we identified matches for
        <strong>{fields}</strong>
        within
        <strong>{table_names}</strong>
        in
        <strong>{database}</strong>.
        These matching elements indicate that this resource contains information directly related to the business concepts, data elements, or requirements you searched for.
      </p>
    """
        else:
            matched = f"""
      <p>
        <strong>What matched?</strong><br>
        Your search for "<strong>{terms}</strong>" showed a strong connection to the business concepts, keywords, and subject matter represented by this resource.
      </p>
    """
        name = product.get("name")
        return f"""
    <div class="ai-explanation">

      <p>
        <strong>Why should I care about this {type_label}?</strong><br>
        This resource was recommended because it appears to be highly relevant to what you are trying to accomplish.
        It contains information, capabilities, or business content that may help you find answers faster and reduce the time spent searching across multiple systems.
      </p>

      <p>
        <strong>Match Reason</strong><br>
        We recommended <strong>{name}</strong> because it contains information related to
        "<strong>{terms or 'your search'}</strong>"
        and closely aligns with what you searched for.
        Specifically, this resource includes
        <strong>{tables}</strong>
        and information associated with
        <strong>{columns}</strong>.
        These matches suggest that the resource may help answer your business question and support your reporting, analysis, integration, or operational needs.
      </p>

      {matched}

      <p>
        <strong>How can this help me?</strong><br>
        {name} can help you with {config['requesterUse']}.
        Instead of spending time searching across multiple systems or evaluating multiple resources, you can start with a resource that has already been identified as relevant to your needs.
        This can help you find answers faster, reduce duplicate effort, and accelerate reporting, analysis, operational activities, or business decision-making.
      </p>

      <p>
        <strong>What makes this a good fit?</strong><br>
        Based on the information you searched for, this resource appears to contain the business content, data elements, or functionality needed to support your objective.
        By starting with a resource that closely matches your search criteria, you can spend less time looking for information and more time using it to solve business problems, answer questions, or create value.
      </p>

      <p>
        <strong>Can I trust this resource?</strong><br>
        Yes. This is a trusted and verified enterprise resource that has gone through governance and quality reviews to help ensure the information is reliable, well-managed, and appropriate for business use.
        The resource is also supported by designated data owners and stewards who help maintain its quality, documentation, and availability.
      </p>

      <p>
        <strong>Why does it matter?</strong><br>
        Beyond helping you accomplish your immediate goal, this {type_label} contributes to the organization's broader objectives by {config['organizationalValue']}.
        By using approved and governed resources, teams can work more consistently, collaborate more effectively, and make decisions using a shared and trusted source of information.
      </p>

      <p>
        By starting with <strong>{name}</strong>, you can spend less time searching for information and more time turning data into action.
        Whether you're working on a report, dashboard, analysis, application, or business initiative, this resource provides a trusted foundation to help you move forward with confidence.
      </p>

    </div>
  """

    def _nlg_explanation(self, product, query, context, factors):
        templates = {
            "semantic": [
                'This product closely matches your search for "{query}" based on {concepts}.',
                'Strong semantic match found for "{query}" with emphasis on {concepts}.',
                "Aligned with your search intent regarding {concepts}.",
            ],
            "technical": [
                "The {product} schema aligns with your {schema} database context.",
                "Technical alignment detected: {schema} database structure matches.",
                "Database compatibility confirmed with {schema}.",
            ],
        }
        explanations = []
        components = []
        if (factors.get("semantic") or 0) > 0.6:
            words = str(query or "").lower().split()
            text = f"{product.get('name') or ''} {product.get('short_desc') or ''}".lower()
            concepts = [word for word in words if len(word) > 3 and word in text][:3]
            if len(concepts) == 0:
                concept_text = "semantic similarity"
            elif len(concepts) == 1:
                concept_text = concepts[0]
            elif len(concepts) == 2:
                concept_text = f"{concepts[0]} and {concepts[1]}"
            else:
                concept_text = f"{', '.join(concepts[:-1])}, and {concepts[-1]}"
            sentence = random.choice(templates["semantic"]).replace("{query}", str(query or "")).replace("{concepts}", concept_text)
            explanations.append(sentence)
            components.append({"type": "semantic", "score": factors.get("semantic"), "concepts": concepts})
        historical = factors.get("historical") or {}
        if historical.get("count", 0) > 0:
            components.append({"type": "historical", "count": historical["count"], "departments": historical.get("departments") or []})
        if context.get("db_raw") and (factors.get("technical") or 0) > 0.5:
            sentence = random.choice(templates["technical"]).replace("{product}", product.get("name") or "").replace("{schema}", context.get("db_raw"))
            explanations.append(sentence)
            components.append({"type": "technical", "schema": context.get("db_raw")})
        confidence_score = (factors.get("semantic") or 0) * 0.3
        confidence_score += 0.25 if (factors.get("historical") or {}).get("count", 0) > 0 else 0
        confidence_score += 0.2 if (factors.get("technical") or 0) > 0.5 else 0
        confidence_score += 0.25 if factors.get("verified") else 0
        confidence = min(round(confidence_score * 100), 100)
        if confidence >= 95:
            statement = "Highly recommended based on strong pattern matching and verification."
        elif confidence >= 85:
            statement = "Verified match with good confidence." if factors.get("verified") else "Recommended with solid semantic and contextual alignment."
        elif confidence >= 70:
            statement = "Suggested for your review based on partial pattern matching."
        else:
            statement = "Exploratory suggestion - please verify relevance to your needs."
        steps = []
        if not factors.get("verified"):
            steps.append("Review product details to confirm match")
        if context.get("db_raw") and not context.get("tbl_raw"):
            steps.append(f"Explore available tables in {context.get('db_raw')}")
        if product.get("steward_email"):
            steps.append(f"Contact steward {product.get('steward_name')} for access questions")
        steps.append("Click 'Request Access' to begin approval workflow")
        summary = " ".join(explanations)
        return {
            "summary": summary,
            "structured": {"primary": explanations[0] if explanations else "", "supporting": explanations[1:], "confidence": statement, "nextSteps": steps},
            "components": components,
            "confidence": confidence,
            "keyFactors": factors,
            "readability": self._readability(summary),
        }

    def _adgroup_provisioned(self, product):
        product_id = product.get("id") or product.get("identifier")
        adgroup = product.get("adgroup")
        if not product_id or not adgroup:
            return False
        key = f"{str(product_id).lower()}:{str(adgroup).lower()}"
        return key in self.provisioned_ad_groups

    def _readability(self, text):
        words = [word for word in str(text or "").split() if word] or [""]
        sentences = [part for part in re.split(r"[.!?]+", str(text or "")) if part.strip()] or [""]
        syllables = [part for part in re.split(r"[aeiou]+", str(text or ""), flags=re.I) if part] or [""]
        score = 206.835 - (1.015 * (len(words) / len(sentences))) - (84.6 * (len(syllables) / len(words)))
        rounded = round(score)
        level = "easy" if score > 60 else "medium" if score > 30 else "difficult"
        return {"score": rounded, "level": level}

    def _detail_html(self, product, explanation):
        classification = product.get("classification") or "Internal"
        badge = "Verified Match" if explanation["keyFactors"].get("verified") else "AI Suggested"
        confidence = explanation.get("confidence") or 0
        level = "High Confidence" if confidence >= 90 else "Strong Match" if confidence >= 75 else "Possible Match"
        steward = product.get("steward_name") or "Not Assigned"
        initials = "".join(part[:1] for part in steward.split())[:2].upper() or "NA"
        summary = (explanation.get("structured") or {}).get("primary") or product.get("short_desc") or "This product aligns with your business needs and reporting requirements."
        kind = "public" if classification.lower() == "public" else "confidential" if classification.lower() == "confidential" else "restricted" if classification.lower() == "restricted" else "protected"
        peer = product.get("peer_usage_count") or 0
        trust = (
            f'<span class="badge-success">🏢 Trusted by {peer} teams</span><span class="badge-info">🛡 Governed Enterprise Data</span>'
            if peer else '<span class="badge-info">🛡 Governed Enterprise Data</span>'
        )
        return f"""
<div class="recommendation-card">

    <div class="card-header">

        <div class="header-label">
            AI Recommendation
        </div>

        <div class="header-title">
            Strong Match for Your Business Need
        </div>

        <div class="header-badges">

            <span class="badge badge-primary">
                ✅ {badge}
            </span>

            <span class="badge badge-primary">
                ⭐ {level}
            </span>

        </div>

    </div>

    <div class="card-body">

        <div class="summary-panel">

            <div class="section-title">
                Why This Product?
            </div>

            <div class="summary-text">
                {summary}
            </div>

        </div>

        <div class="governance-card">

            <div class="governance-title">
                Trust & Governance
            </div>

            <div class="governance-row">

                <div class="classification-section">

                    <div class="metadata-label">
                        Data Classification
                    </div>

                    <span class="classification-badge {kind}">
                        {classification}
                    </span>

                </div>

                <div class="divider"></div>

                <div class="steward-section">

                    <div class="metadata-label">
                        Data Steward
                    </div>

                    <div class="steward">

                        <div class="avatar">
                            {initials}
                        </div>

                        <div class="steward-name">
                            {steward}
                        </div>

                    </div>

                </div>

            </div>

        </div>

        <div class="benefits-card">

            <div class="section-title-dark">
                Business Benefits
            </div>

            <div class="benefit-item">
                ✅ Trusted enterprise data source
            </div>

            <div class="benefit-item">
                ✅ Supports reporting and business analysis
            </div>

            <div class="benefit-item">
                ✅ Improves decision-making consistency
            </div>

        </div>

        <div class="trust-badges">

            {trust}

        </div>

        <details class="transparency-panel">

            <summary>
                Why am I seeing this recommendation?
            </summary>

            <div class="transparency-content">
                This recommendation was generated using business metadata,
                governance information, stewardship ownership, and relevance
                signals to identify a trusted enterprise data product.
            </div>

        </details>

    </div>

    <div class="card-footer">

        <div class="footer-title">
            Recommended Action
        </div>

        <div class="footer-text">
            Review the product details and request access if it supports
            your reporting, analysis, or decision-making objectives.
        </div>

    </div>

</div>
"""


_ENGINE = None


def get_engine():
    global _ENGINE
    if _ENGINE is None:
        _ENGINE = SuggestedAIEngine()
    return _ENGINE


def suggest_from_request(request):
    def first(*names):
        for name in names:
            value = request.GET.get(name)
            if value and str(value).strip():
                return str(value).strip()
        return ""

    platform = first("v_dar_platform", "platform")
    explicit_query = first("query")
    database = first("database-schema", "databaseSchema")
    tables = first("tablenames", "tableNames")
    if not explicit_query:
        database = database or "tdp_finance"
        tables = tables or "customer_master, vehicle_sales"
    description = first("v_dar_DataReqDescription", "description")
    justification = first("v_dar_businessJustification", "justification")
    domain = first("selectedDomain", "v_dar_dataDomainSelect", "domain")
    suggestion_kind = "api" if explicit_query and re.search(r"\bapi\b", platform or "", re.I) and not database and not tables else ""
    context = {
        "v_dar_platform": platform,
        "db_raw": database,
        "tbl_raw": tables,
        "desc_raw": description,
        "justification_raw": justification,
        "selectedDomain": domain,
        "v_dar_dataDomainSelect": domain,
        "suggestion_kind": suggestion_kind,
        "ranking_mode": first("ranking_mode", "rankingMode") or "default",
        "allowSensitive": first("allowSensitive").lower() == "true",
        "history": [],
    }
    query = explicit_query or expand_query(f"{database} {tables}")
    result = get_engine().get_suggestions(query, context)
    return {
        "product": result["suggestions"],
        "ranking_mode": result["ranking_mode"],
    }
