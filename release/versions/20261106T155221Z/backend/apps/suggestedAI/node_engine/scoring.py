import math
import re
from datetime import datetime, timezone

from .textutil import (
    calculate_domain_match_score,
    clean_text,
    compare_strings,
    is_uuid_like,
    normalize_domain_name,
    to_singular,
)

DOMAIN_PRIORITY_TERMS = [
    "customer", "distributor", "region", "dealership", "facilities", "finance",
    "accounting", "manufacturing", "marketing", "quality", "service", "parts",
    "social", "media", "survey", "telematics", "vehicle", "identity", "management",
    "warranty", "human", "resources", "research", "development", "vendors",
    "partners", "procurement", "integrated", "revenue", "internal", "audit",
    "purchasing", "reference", "legal", "affiliates", "sensitive", "master",
    "data", "details", "report", "info",
]

CONFIG = {
    "MAX_LEVENSHTEIN": 2,
    "WEIGHTS": {
        "semantic": 0.10,
        "coverage": 0.15,
        "fuzzy": 0.10,
        "platformBonus": 0.20,
        "domainBonus": 0.40,
        "confidence": 0.01,
        "intent": 0.01,
        "recency": 0.01,
        "behavior": 0.01,
        "quality": 0.01,
    },
    "HIGH_VALUE_TERMS": ["verified", "master", "sensitive", "data"],
    "COMMON_WORDS": {"the", "and", "for", "with", "from", "to", "of", "in", "on", "at", "by"},
    "BEHAVIOR_WEIGHTS": {"save": 0.3, "click": 0.2, "view": 0.1},
    "RECENCY_HALF_LIFE_DAYS": 30,
    "UNRELATED_WORD_PENALTY": 0.001,
    "MIN_WORD_LENGTH": 2,
    "EXACT_MATCH": {"FULL_MATCH_BONUS": 3, "PARTIAL_MATCH_BONUS": 3, "KEYWORD_MATCH_BONUS": 3},
    "BERTA_DOMAIN": {
        "MATCH_BONUS": 4,
        "MISMATCH_PENALTY": -10,
        "HIGH_VALUE_DOMAINS": [
            "Customer", "Distributor / Region / Dealership", "Facilities", "Finance Management & Accounting", "Manufacturing",
            "Marketing", "Quality", "Service History", "Service Parts & Accessories", "Parts", "Social Media", "Survey",
            "Telematics", "Vehicle", "Identity Management", "Warranty", "Human Resources", "Research & Development", "Vendors/Partners",
            "Procurement", "Integrated Revenue Management", "Internal Audit", "Purchasing", "Reference", "Vendors and Partners",
            "Legal", "Affiliates",
        ],
    },
    "CONFIDENCE": {
        "FORM_COMPLETENESS_WEIGHT": 0.4,
        "VERIFICATION_BONUS": 0.2,
        "USAGE_MAX_SCORE": 0.15,
        "USAGE_SCALE_FACTOR": 0.002,
        "DEMAND_MAX_SCORE": 0.15,
        "DEMAND_SCALE_FACTOR": 0.01,
    },
}

SYNONYMS = {"db": "database", "kpi": "metrics dashboard", "auth": "login identity permissions"}
_TOKEN_CACHE = {}


def expand_query(query):
    return " ".join(SYNONYMS.get(word, word) for word in str(query or "").split(" "))


def get_tokens(text):
    if not isinstance(text, str) or not text:
        return []
    key = text.lower()
    cached = _TOKEN_CACHE.get(key)
    if cached is None:
        cached = [
            word for word in re.split(r"\W+", clean_text(text).lower())
            if len(word) > CONFIG["MIN_WORD_LENGTH"]
        ]
        if len(_TOKEN_CACHE) > 10000:
            _TOKEN_CACHE.clear()
        _TOKEN_CACHE[key] = cached
    return cached


def levenshtein_distance(left, right, max_distance=None):
    max_distance = CONFIG["MAX_LEVENSHTEIN"] if max_distance is None else max_distance
    if not left or not right:
        return max(len(left or ""), len(right or ""))
    if abs(len(left) - len(right)) > max_distance:
        return max_distance + 1
    if left == right:
        return 0
    if len(left) > len(right):
        return levenshtein_distance(right, left, max_distance)
    previous = list(range(len(left) + 1))
    for column, right_char in enumerate(right, start=1):
        current = [column]
        minimum = current[0]
        for index, left_char in enumerate(left, start=1):
            cost = 0 if left_char == right_char else 1
            current.append(min(previous[index] + 1, current[index - 1] + 1, previous[index - 1] + cost))
            minimum = min(minimum, current[-1])
        if minimum > max_distance:
            return max_distance + 1
        previous = current
    return previous[len(left)]


def resolve_product_domain_name(product):
    domain = product.get("domain")
    if isinstance(domain, str) and domain.strip():
        return domain.strip()
    if isinstance(product.get("domain_name"), str) and product["domain_name"].strip():
        return product["domain_name"].strip()
    if isinstance(domain, dict) and isinstance(domain.get("name"), str) and domain["name"].strip():
        return domain["name"].strip()
    return ""


def resolve_product_domain_id(product):
    domain = product.get("domain")
    value = product.get("domain_id")
    if value in (None, "") and isinstance(domain, dict):
        value = domain.get("id")
    return str(value or "").strip()


def calculate_exact_match_bonus(query, product):
    if not query or not product.get("name"):
        return 0
    query_lower = str(query).lower().strip()
    name_lower = str(product["name"]).lower().strip()
    if query_lower == name_lower:
        return CONFIG["EXACT_MATCH"]["FULL_MATCH_BONUS"]
    if query_lower and query_lower in name_lower:
        return CONFIG["EXACT_MATCH"]["PARTIAL_MATCH_BONUS"]
    for keyword in product.get("keywords") or []:
        if query_lower == str(keyword).lower().strip():
            return CONFIG["EXACT_MATCH"]["KEYWORD_MATCH_BONUS"]
    query_words = get_tokens(query_lower)
    product_words = get_tokens(product["name"])
    if query_words and all(word in product_words for word in query_words):
        return CONFIG["EXACT_MATCH"]["KEYWORD_MATCH_BONUS"]
    return 0


def calculate_berta_domain_bonus(product, form_values=None):
    form_values = form_values or {}
    selected = form_values.get("v_dar_dataDomainSelect") or form_values.get("selected_domains") or form_values.get("selectedDomains") or ""
    if isinstance(selected, list):
        tokens = [str(item).strip() for item in selected if str(item).strip()]
    elif isinstance(selected, str) and selected.strip():
        tokens = [item.strip() for item in selected.split(",") if item.strip()]
    else:
        tokens = []
    if not tokens:
        return {"bonus": 0, "isMatch": None, "details": "No domains selected"}
    product_id = resolve_product_domain_id(product)
    product_name = normalize_domain_name(resolve_product_domain_name(product))
    selected_ids = [item.lower() for item in tokens if is_uuid_like(item)]
    selected_names = [normalize_domain_name(item) for item in tokens if not is_uuid_like(item)]
    selected_names = [item for item in selected_names if item]
    if selected_ids:
        if not product_id:
            return {"bonus": CONFIG["BERTA_DOMAIN"]["MISMATCH_PENALTY"], "isMatch": False, "details": "Product has no domain_id"}
        matched = product_id.lower() in selected_ids
        return {
            "bonus": CONFIG["BERTA_DOMAIN"]["MATCH_BONUS"] if matched else CONFIG["BERTA_DOMAIN"]["MISMATCH_PENALTY"],
            "isMatch": matched,
            "matchScore": 1 if matched else 0,
            "details": "domain id match" if matched else "domain id mismatch",
        }
    if not product_name:
        return {"bonus": CONFIG["BERTA_DOMAIN"]["MISMATCH_PENALTY"], "isMatch": False, "details": "Product has no domain name"}
    best_name = None
    best_score = 0
    for name in selected_names:
        score = calculate_domain_match_score(product_name, name)
        if score > best_score:
            best_score = score
            best_name = name
    matched = best_score >= 0.8
    return {
        "bonus": CONFIG["BERTA_DOMAIN"]["MATCH_BONUS"] if matched else CONFIG["BERTA_DOMAIN"]["MISMATCH_PENALTY"],
        "isMatch": matched,
        "matchScore": best_score,
        "details": f"{product_name} vs {best_name}",
    }


def calculate_domain_confidence_multiplier(product, query, form_values=None):
    form_values = form_values or {}
    selected_raw = str(form_values.get("v_dar_dataDomainSelect") or "").strip()
    selected_name = "" if is_uuid_like(selected_raw) else normalize_domain_name(selected_raw)
    product_name = normalize_domain_name(resolve_product_domain_name(product))
    if not product_name or not selected_name:
        return 0
    high_value = [normalize_domain_name(name) for name in CONFIG["BERTA_DOMAIN"]["HIGH_VALUE_DOMAINS"]]
    has_high_value = any(
        (domain in product_name or to_singular(domain) in to_singular(product_name))
        and (domain in selected_name or to_singular(domain) in to_singular(selected_name))
        for domain in high_value
    )
    if not has_high_value:
        return 0
    return 1.0 if calculate_domain_match_score(product_name, selected_name) >= 0.8 else 0


def _semantic(product, query, vector_similarity, user_context, form_values, query_words):
    similarity = vector_similarity if isinstance(vector_similarity, (int, float)) else 0
    unit = similarity if 0 <= similarity <= 1 else (similarity + 1) / 2
    return max(0, min(1, unit))


def _fuzzy(product, query, vector_similarity, user_context, form_values, query_words):
    return compare_strings(query, product.get("name") or "")


def _coverage(product, query, vector_similarity, user_context, form_values, query_words):
    if not query_words:
        return 0
    product_words = get_tokens(product.get("name") or "")
    matched = sum(
        1 for query_word in query_words
        if any(levenshtein_distance(query_word, product_word, 1) <= 1 for product_word in product_words)
    )
    return matched / len(query_words)


def _platform_bonus(product, query, vector_similarity, user_context, form_values, query_words):
    selected = str((form_values or {}).get("v_dar_platform") or "").lower().strip()
    product_platform = str(product.get("platform") or "").lower().strip()
    if not selected or not product_platform:
        return 0
    return 1 if selected == product_platform else 0


def _domain_bonus(product, query, vector_similarity, user_context, form_values, query_words):
    product_name = str(product.get("name") or "").lower()
    if not product_name:
        return 0
    query_lower = str(query or "").lower()
    requested = str((form_values or {}).get("v_dar_dataDomainSelect") or "").strip()
    matching = [
        term for term in CONFIG["HIGH_VALUE_TERMS"]
        if term in product_name and term in query_lower
    ]
    bonus = len(matching) / len(CONFIG["HIGH_VALUE_TERMS"])
    if requested:
        if is_uuid_like(requested) and resolve_product_domain_id(product):
            if resolve_product_domain_id(product).lower() == requested.lower():
                bonus += 0.5
        elif not is_uuid_like(requested) and resolve_product_domain_name(product):
            score = calculate_domain_match_score(
                normalize_domain_name(resolve_product_domain_name(product)),
                normalize_domain_name(requested),
            )
            if score >= 0.8:
                bonus += 0.5
    return min(bonus, 1.0)


def _confidence(product, query, vector_similarity, user_context, form_values, query_words):
    if not isinstance(form_values, dict):
        return 0
    fields = ["v_dar_platform", "v_dar_post_table_names", "v_dar_DataReqDescription", "v_dar_businessJustification"]
    filled = sum(1 for field in fields if str(form_values.get(field) or "").strip())
    completeness = filled / len(fields)
    verification = CONFIG["CONFIDENCE"]["VERIFICATION_BONUS"] if product.get("is_steward_verified") else 0
    peer_usage = product.get("peer_usage_count") or 0
    usage = min(peer_usage * CONFIG["CONFIDENCE"]["USAGE_SCALE_FACTOR"], CONFIG["CONFIDENCE"]["USAGE_MAX_SCORE"])
    requests = product.get("access_request_count") if product.get("access_request_count") is not None else peer_usage
    approved = product.get("access_approved_count") if product.get("access_approved_count") is not None else peer_usage
    approval_rate = min(approved / requests, 1) if requests else 0
    demand_volume = min(requests * CONFIG["CONFIDENCE"]["DEMAND_SCALE_FACTOR"], CONFIG["CONFIDENCE"]["DEMAND_MAX_SCORE"])
    demand = demand_volume * (0.3 + approval_rate * 0.7)
    return min(
        completeness * CONFIG["CONFIDENCE"]["FORM_COMPLETENESS_WEIGHT"] + verification + usage + demand,
        1.0,
    )


def _recency(product, query, vector_similarity, user_context, form_values, query_words):
    updated = product.get("updated_at")
    if not updated:
        return 0.5
    try:
        stamp = datetime.fromisoformat(str(updated).replace("Z", "+00:00"))
        if stamp.tzinfo is None:
            stamp = stamp.replace(tzinfo=timezone.utc)
    except ValueError:
        return 0.5
    days = (datetime.now(timezone.utc) - stamp).total_seconds() / 86400
    return max(0.1, math.exp(-days / CONFIG["RECENCY_HALF_LIFE_DAYS"]))


def _behavior(product, query, vector_similarity, user_context, form_values, query_words):
    history = (user_context or {}).get("history") or []
    interactions = [item for item in history if item.get("productId") == product.get("id")]
    if not interactions:
        return 0
    return sum(CONFIG["BEHAVIOR_WEIGHTS"].get(item.get("type"), 0) for item in interactions)


def _quality(product, query, vector_similarity, user_context, form_values, query_words):
    return (
        (0.2 if product.get("is_steward_verified") else 0)
        + (0.15 if product.get("has_documentation") else 0)
        + min((product.get("data_quality_score") or 0) * 0.2, 0.2)
        + (0.15 if product.get("security_certified") else 0)
    )


def _intent(product, query, vector_similarity, user_context, form_values, query_words):
    return 0.5


FACTORS = {
    "semantic": _semantic,
    "coverage": _coverage,
    "fuzzy": _fuzzy,
    "platformBonus": _platform_bonus,
    "domainBonus": _domain_bonus,
    "confidence": _confidence,
    "intent": _intent,
    "recency": _recency,
    "behavior": _behavior,
    "quality": _quality,
}


def unrelated_penalty(product_words, query_words):
    count = 0
    for word in product_words:
        if word in query_words or word in CONFIG["COMMON_WORDS"] or word in DOMAIN_PRIORITY_TERMS:
            continue
        if any(levenshtein_distance(word, query_word, 1) <= 1 for query_word in query_words):
            continue
        count += 1
    return count * CONFIG["UNRELATED_WORD_PENALTY"]


def compute_smart_score(product, search_query, vector_similarity, user_context=None, form_values=None):
    user_context = user_context or {}
    form_values = form_values or {}
    cleaned = clean_text(search_query or "")
    query_words = get_tokens(cleaned)
    product_words = get_tokens(product.get("name") or "")
    short_query = len([part for part in cleaned.strip().split() if part]) <= 3
    weights = dict(CONFIG["WEIGHTS"])
    if short_query:
        weights.update({"semantic": 0.35, "coverage": 0.30, "fuzzy": 0.20, "platformBonus": 0.10})
    total = 0
    breakdown = {}
    args = (product, cleaned, vector_similarity, user_context, form_values, query_words)
    for name, weight in weights.items():
        raw = FACTORS[name](*args)
        clamped = max(0, min(1, raw))
        total += clamped * weight
        breakdown[name] = round(clamped * 100)
    exact = calculate_exact_match_bonus(search_query, product)
    if exact:
        total += exact / 100
        breakdown["exactMatchBonus"] = exact
    berta = calculate_berta_domain_bonus(product, form_values)
    total += berta["bonus"] / 100
    breakdown["bertaDomainBonus"] = berta["bonus"]
    breakdown["bertaDomainMatch"] = berta["isMatch"]
    penalty = unrelated_penalty(product_words, query_words)
    total -= penalty
    breakdown["penalty"] = round(penalty * 100)
    final_score = round(total * 100)
    if berta["isMatch"] is False and berta["bonus"] == CONFIG["BERTA_DOMAIN"]["MISMATCH_PENALTY"]:
        final_score += CONFIG["BERTA_DOMAIN"]["MISMATCH_PENALTY"] - (-5)
    final_score = max(0, min(100, final_score))
    multiplier = calculate_domain_confidence_multiplier(product, search_query, form_values)
    if multiplier == 1.0 and final_score < 85:
        final_score = max(final_score, 85)
        breakdown["domainConfidenceFloor"] = 85
    return {"score": final_score, "breakdown": breakdown, "metadata": {"queryWords": len(query_words), "productWords": len(product_words)}}
