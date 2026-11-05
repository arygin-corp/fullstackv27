import re
import unicodedata
from collections import Counter
from difflib import SequenceMatcher

from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import (
    Q,
    F,
    Case,
    When,
    Value,
    IntegerField,
    FloatField,
    ExpressionWrapper,
)
from django.db.models.functions import Coalesce, Greatest
from pgvector.django import CosineDistance

from .models import Product, SearchProductEmbedding
from .search_services import encode_search_text


# ============================================================
# CONFIGURATION
# ============================================================

PAGE_SIZE = 8
MAX_CANDIDATES = 500
MAX_SEMANTIC_CANDIDATES = 300

LEXICAL_WEIGHT = 0.65
SEMANTIC_WEIGHT = 0.35

FUZZY_THRESHOLD = 0.16
SEMANTIC_THRESHOLD = 0.20
SPELLING_THRESHOLD = 0.68

FIELD_WEIGHTS = {
    "name": 1.00,
    "domain": 0.95,
    "subdomain_2": 0.90,
    "subdomain_3": 0.85,
    "sku": 0.82,
    "keyword": 0.80,
    "datatype": 0.75,
    "classification": 0.72,
    "intended_use": 0.70,
    "short_desc": 0.60,
    "brief_desc": 0.50,
    "data_steward": 0.45,
    "poc_name": 0.40,
    "business_contact": 0.40,
    "business_sme": 0.40,
}

# Lower tier means higher priority.
TIER_SCORES = {
    0: 1.00,
    1: 0.98,
    2: 0.96,
    3: 0.94,
    4: 0.92,
    5: 0.90,
    6: 0.88,
    7: 0.86,
    8: 0.84,
    9: 0.82,
    10: 0.80,
    11: 0.78,
    12: 0.76,
    13: 0.74,
    14: 0.72,
    15: 0.70,
    16: 0.68,
    17: 0.66,
    18: 0.64,
    19: 0.62,
    20: 0.60,
    21: 0.58,
    22: 0.56,
    23: 0.54,
    24: 0.52,
    25: 0.50,
    26: 0.48,
    27: 0.46,
    28: 0.44,
    29: 0.42,
    30: 0.40,
    31: 0.38,
    32: 0.36,
    33: 0.34,
    34: 0.32,
    35: 0.30,
    36: 0.28,
    100: 0.00,
}


# ============================================================
# GENERAL HELPERS
# ============================================================

def normalize_query(value):
    value = unicodedata.normalize("NFKC", value or "")
    value = value.casefold().strip()
    return re.sub(r"\s+", " ", value)


def parse_page(value):
    try:
        page = int(value)
    except (TypeError, ValueError):
        page = 1
    return max(page, 1)


def related_name(obj):
    return getattr(obj, "name", None) if obj else None


def visible_products():
    """Single visibility rule used throughout search."""
    return Product.objects.published().filter(is_active=True)


def should_use_fuzzy(query):
    return len(query.replace(" ", "")) >= 3


def should_use_semantic(query):
    return len(query) >= 4 and (len(query.split()) >= 2 or len(query) >= 8)


# ============================================================
# FILTERS AND INTENT
# ============================================================

def get_filter_vocabulary(queryset):
    def values(field):
        return list(
            queryset.exclude(**{f"{field}__isnull": True})
            .exclude(**{f"{field}__name": ""})
            .values_list(f"{field}__name", flat=True)
            .distinct()
        )

    return {
        "domain": values("domain"),
        "subdomain_2": values("subdomain_2"),
        "subdomain_3": values("subdomain_3"),
        "datatype": values("datatype"),
        "classification": values("classification"),
    }


def get_explicit_filters(request):
    supported = (
        "domain",
        "subdomain_2",
        "subdomain_3",
        "datatype",
        "classification",
    )
    return {
        field: request.query_params.get(field, "").strip()
        for field in supported
        if request.query_params.get(field, "").strip()
    }


def infer_filters_from_query(query, vocabulary):
    normalized = normalize_query(query)
    inferred = {}

    for field, names in vocabulary.items():
        for name in sorted(names, key=lambda item: len(str(item)), reverse=True):
            normalized_name = normalize_query(str(name))
            if not normalized_name:
                continue
            pattern = rf"(?<!\w){re.escape(normalized_name)}(?!\w)"
            if re.search(pattern, normalized):
                inferred[field] = name
                break

    return inferred


def apply_filters(queryset, filters):
    filter_map = {
        "domain": "domain__name__iexact",
        "subdomain_2": "subdomain_2__name__iexact",
        "subdomain_3": "subdomain_3__name__iexact",
        "datatype": "datatype__name__iexact",
        "classification": "classification__name__iexact",
    }
    kwargs = {
        filter_map[field]: value
        for field, value in filters.items()
        if field in filter_map and value
    }
    return queryset.filter(**kwargs)


def determine_query_intent(query, filters):
    words = set(normalize_query(query).split())

    if filters and not query:
        return "filtered_browse"
    if words.intersection({"who", "owner", "steward", "contact", "sme", "poc"}):
        return "ownership_lookup"
    if words.intersection({"api", "dataset", "dashboard", "report", "table", "file"}):
        return "product_type_discovery"
    if len(words) >= 4:
        return "natural_language_discovery"
    if query:
        return "product_lookup"
    return "browse"


# ============================================================
# DID YOU MEAN
# ============================================================

def build_spelling_vocabulary(queryset):
    vocabulary = set()
    fields = (
        "name",
        "sku",
        "domain__name",
        "subdomain_2__name",
        "subdomain_3__name",
        "datatype__name",
        "classification__name",
        "keyword__name",
    )

    for field in fields:
        values = (
            queryset.exclude(**{f"{field}__isnull": True})
            .values_list(field, flat=True)
            .distinct()
        )
        for value in values:
            if not value:
                continue
            for token in normalize_query(str(value)).split():
                if len(token) >= 3:
                    vocabulary.add(token)

    return sorted(vocabulary)


def find_spelling_correction(token, vocabulary):
    if len(token) < 3:
        return None, 0.0

    best_word = None
    best_score = 0.0

    for candidate in vocabulary:
        if abs(len(candidate) - len(token)) > 3:
            continue

        score = SequenceMatcher(None, token, candidate).ratio()
        if token[:2] == candidate[:2]:
            score = min(1.0, score + 0.05)

        if score > best_score:
            best_word = candidate
            best_score = score

    return best_word, best_score


def build_did_you_mean(query, vocabulary):
    normalized = normalize_query(query)
    if len(normalized) < 3:
        return None

    vocabulary_set = set(vocabulary)
    corrected = []
    changed_scores = []

    for token in normalized.split():
        if token in vocabulary_set:
            corrected.append(token)
            continue

        candidate, score = find_spelling_correction(token, vocabulary)
        if candidate and score >= SPELLING_THRESHOLD:
            corrected.append(candidate)
            changed_scores.append(score)
        else:
            corrected.append(token)

    if not changed_scores:
        return None

    corrected_query = " ".join(corrected)
    if corrected_query == normalized:
        return None

    return {
        "query": corrected_query,
        "confidence": round(sum(changed_scores) / len(changed_scores), 4),
    }


# ============================================================
# LEXICAL AND FUZZY SEARCH
# ============================================================

def basic_search_queryset(queryset, query):
    """Reliable contains search that does not depend on pg_trgm or vectors."""
    return (
        queryset.filter(
            Q(name__icontains=query)
            | Q(sku__icontains=query)
            | Q(intended_use__icontains=query)
            | Q(short_desc__icontains=query)
            | Q(brief_desc__icontains=query)
            | Q(domain__name__icontains=query)
            | Q(subdomain_2__name__icontains=query)
            | Q(subdomain_3__name__icontains=query)
            | Q(datatype__name__icontains=query)
            | Q(classification__name__icontains=query)
            | Q(data_steward__name__icontains=query)
            | Q(poc_name__name__icontains=query)
            | Q(business_contact_name__name__icontains=query)
            | Q(business_sme__name__icontains=query)
            | Q(keyword__name__icontains=query)
        )
        .select_related(
            "domain",
            "subdomain_2",
            "subdomain_3",
            "datatype",
            "classification",
            "data_steward",
            "poc_name",
            "business_contact_name",
            "business_sme",
        )
        .prefetch_related("keyword", "images")
        .distinct()
    )


def build_lexical_queryset(queryset, query):
    queryset = queryset.annotate(
        name_similarity=Coalesce(TrigramSimilarity("name", query), Value(0.0), output_field=FloatField()),
        domain_similarity=Coalesce(TrigramSimilarity("domain__name", query), Value(0.0), output_field=FloatField()),
        subdomain_2_similarity=Coalesce(TrigramSimilarity("subdomain_2__name", query), Value(0.0), output_field=FloatField()),
        subdomain_3_similarity=Coalesce(TrigramSimilarity("subdomain_3__name", query), Value(0.0), output_field=FloatField()),
        sku_similarity=Coalesce(TrigramSimilarity("sku", query), Value(0.0), output_field=FloatField()),
        datatype_similarity=Coalesce(TrigramSimilarity("datatype__name", query), Value(0.0), output_field=FloatField()),
        classification_similarity=Coalesce(TrigramSimilarity("classification__name", query), Value(0.0), output_field=FloatField()),
        intended_use_similarity=Coalesce(TrigramSimilarity("intended_use", query), Value(0.0), output_field=FloatField()),
        short_desc_similarity=Coalesce(TrigramSimilarity("short_desc", query), Value(0.0), output_field=FloatField()),
        brief_desc_similarity=Coalesce(TrigramSimilarity("brief_desc", query), Value(0.0), output_field=FloatField()),
        data_steward_similarity=Coalesce(TrigramSimilarity("data_steward__name", query), Value(0.0), output_field=FloatField()),
        poc_similarity=Coalesce(TrigramSimilarity("poc_name__name", query), Value(0.0), output_field=FloatField()),
        business_contact_similarity=Coalesce(TrigramSimilarity("business_contact_name__name", query), Value(0.0), output_field=FloatField()),
        business_sme_similarity=Coalesce(TrigramSimilarity("business_sme__name", query), Value(0.0), output_field=FloatField()),
    ).annotate(
        weighted_name=ExpressionWrapper(F("name_similarity") * Value(FIELD_WEIGHTS["name"]), output_field=FloatField()),
        weighted_domain=ExpressionWrapper(F("domain_similarity") * Value(FIELD_WEIGHTS["domain"]), output_field=FloatField()),
        weighted_subdomain_2=ExpressionWrapper(F("subdomain_2_similarity") * Value(FIELD_WEIGHTS["subdomain_2"]), output_field=FloatField()),
        weighted_subdomain_3=ExpressionWrapper(F("subdomain_3_similarity") * Value(FIELD_WEIGHTS["subdomain_3"]), output_field=FloatField()),
        weighted_sku=ExpressionWrapper(F("sku_similarity") * Value(FIELD_WEIGHTS["sku"]), output_field=FloatField()),
        weighted_datatype=ExpressionWrapper(F("datatype_similarity") * Value(FIELD_WEIGHTS["datatype"]), output_field=FloatField()),
        weighted_classification=ExpressionWrapper(F("classification_similarity") * Value(FIELD_WEIGHTS["classification"]), output_field=FloatField()),
        weighted_intended_use=ExpressionWrapper(F("intended_use_similarity") * Value(FIELD_WEIGHTS["intended_use"]), output_field=FloatField()),
        weighted_short_desc=ExpressionWrapper(F("short_desc_similarity") * Value(FIELD_WEIGHTS["short_desc"]), output_field=FloatField()),
        weighted_brief_desc=ExpressionWrapper(F("brief_desc_similarity") * Value(FIELD_WEIGHTS["brief_desc"]), output_field=FloatField()),
        weighted_data_steward=ExpressionWrapper(F("data_steward_similarity") * Value(FIELD_WEIGHTS["data_steward"]), output_field=FloatField()),
        weighted_poc=ExpressionWrapper(F("poc_similarity") * Value(FIELD_WEIGHTS["poc_name"]), output_field=FloatField()),
        weighted_business_contact=ExpressionWrapper(F("business_contact_similarity") * Value(FIELD_WEIGHTS["business_contact"]), output_field=FloatField()),
        weighted_business_sme=ExpressionWrapper(F("business_sme_similarity") * Value(FIELD_WEIGHTS["business_sme"]), output_field=FloatField()),
    ).annotate(
        lexical_score=Greatest(
            F("weighted_name"),
            F("weighted_domain"),
            F("weighted_subdomain_2"),
            F("weighted_subdomain_3"),
            F("weighted_sku"),
            F("weighted_datatype"),
            F("weighted_classification"),
            F("weighted_intended_use"),
            F("weighted_short_desc"),
            F("weighted_brief_desc"),
            F("weighted_data_steward"),
            F("weighted_poc"),
            F("weighted_business_contact"),
            F("weighted_business_sme"),
        ),
        match_tier=Case(
            When(name__iexact=query, then=Value(0)),
            When(name__istartswith=query, then=Value(1)),
            When(name__icontains=query, then=Value(2)),
            When(domain__name__iexact=query, then=Value(3)),
            When(domain__name__istartswith=query, then=Value(4)),
            When(domain__name__icontains=query, then=Value(5)),
            When(subdomain_2__name__iexact=query, then=Value(6)),
            When(subdomain_2__name__istartswith=query, then=Value(7)),
            When(subdomain_2__name__icontains=query, then=Value(8)),
            When(subdomain_3__name__iexact=query, then=Value(9)),
            When(subdomain_3__name__istartswith=query, then=Value(10)),
            When(subdomain_3__name__icontains=query, then=Value(11)),
            When(sku__iexact=query, then=Value(12)),
            When(sku__istartswith=query, then=Value(13)),
            When(sku__icontains=query, then=Value(14)),
            When(keyword__name__iexact=query, then=Value(15)),
            When(keyword__name__istartswith=query, then=Value(16)),
            When(keyword__name__icontains=query, then=Value(17)),
            When(datatype__name__iexact=query, then=Value(18)),
            When(datatype__name__istartswith=query, then=Value(19)),
            When(datatype__name__icontains=query, then=Value(20)),
            When(classification__name__iexact=query, then=Value(21)),
            When(classification__name__istartswith=query, then=Value(22)),
            When(classification__name__icontains=query, then=Value(23)),
            When(intended_use__iexact=query, then=Value(24)),
            When(intended_use__istartswith=query, then=Value(25)),
            When(intended_use__icontains=query, then=Value(26)),
            When(short_desc__istartswith=query, then=Value(27)),
            When(short_desc__icontains=query, then=Value(28)),
            When(brief_desc__istartswith=query, then=Value(29)),
            When(brief_desc__icontains=query, then=Value(30)),
            When(data_steward__name__iexact=query, then=Value(31)),
            When(data_steward__name__istartswith=query, then=Value(32)),
            When(data_steward__name__icontains=query, then=Value(33)),
            When(
                Q(poc_name__name__iexact=query)
                | Q(business_contact_name__name__iexact=query)
                | Q(business_sme__name__iexact=query),
                then=Value(34),
            ),
            When(
                Q(poc_name__name__istartswith=query)
                | Q(business_contact_name__name__istartswith=query)
                | Q(business_sme__name__istartswith=query),
                then=Value(35),
            ),
            When(
                Q(poc_name__name__icontains=query)
                | Q(business_contact_name__name__icontains=query)
                | Q(business_sme__name__icontains=query),
                then=Value(36),
            ),
            default=Value(100),
            output_field=IntegerField(),
        ),
    )

    eligibility = (
        Q(name__icontains=query)
        | Q(sku__icontains=query)
        | Q(intended_use__icontains=query)
        | Q(short_desc__icontains=query)
        | Q(brief_desc__icontains=query)
        | Q(domain__name__icontains=query)
        | Q(subdomain_2__name__icontains=query)
        | Q(subdomain_3__name__icontains=query)
        | Q(datatype__name__icontains=query)
        | Q(classification__name__icontains=query)
        | Q(data_steward__name__icontains=query)
        | Q(poc_name__name__icontains=query)
        | Q(business_contact_name__name__icontains=query)
        | Q(business_sme__name__icontains=query)
        | Q(keyword__name__icontains=query)
    )

    if should_use_fuzzy(query):
        eligibility |= Q(lexical_score__gte=FUZZY_THRESHOLD)

    return (
        queryset.filter(eligibility)
        .select_related(
            "domain",
            "subdomain_2",
            "subdomain_3",
            "datatype",
            "classification",
            "data_steward",
            "poc_name",
            "business_contact_name",
            "business_sme",
        )
        .prefetch_related("keyword", "images")
        .distinct()
        .order_by("match_tier", "-lexical_score", "name")
    )


# ============================================================
# SEMANTIC SEARCH
# ============================================================

def get_semantic_matches(query, allowed_product_ids, limit=MAX_SEMANTIC_CANDIDATES):
    if not should_use_semantic(query):
        return {}

    try:
        query_vector = encode_search_text(query)
        embeddings = (
            SearchProductEmbedding.objects.filter(product_id__in=allowed_product_ids)
            .annotate(semantic_distance=CosineDistance("vector", query_vector))
            .order_by("semantic_distance")[:limit]
        )

        results = {}
        for embedding in embeddings:
            distance = float(embedding.semantic_distance or 1.0)
            similarity = max(0.0, min(1.0, 1.0 - distance))
            if similarity >= SEMANTIC_THRESHOLD:
                results[embedding.product_id] = similarity
        return results
    except Exception:
        return {}


# ============================================================
# CANDIDATE RETRIEVAL
# ============================================================

def set_basic_ranking(product, query):
    normalized_query = normalize_query(query)
    name = normalize_query(product.name or "")
    sku = normalize_query(product.sku or "")

    product.lexical_score = getattr(product, "lexical_score", 0.0) or 0.0

    if hasattr(product, "match_tier"):
        return
    if name == normalized_query:
        product.match_tier = 0
    elif name.startswith(normalized_query):
        product.match_tier = 1
    elif normalized_query in name:
        product.match_tier = 2
    elif sku == normalized_query:
        product.match_tier = 12
    elif sku.startswith(normalized_query):
        product.match_tier = 13
    elif normalized_query in sku:
        product.match_tier = 14
    else:
        product.match_tier = 100


def retrieve_hybrid_candidates(queryset, query):
    products_by_id = {}

    # Always run the basic contains search first.
    for product in basic_search_queryset(queryset, query)[:MAX_CANDIDATES]:
        set_basic_ranking(product, query)
        products_by_id[product.id] = product

    # Add or replace candidates with fully annotated fuzzy candidates.
    try:
        for product in build_lexical_queryset(queryset, query)[:MAX_CANDIDATES]:
            products_by_id[product.id] = product
    except Exception:
        pass

    product_ids = list(queryset.values_list("id", flat=True))
    semantic_scores = get_semantic_matches(query, product_ids)

    semantic_only_ids = [
        product_id
        for product_id in semantic_scores
        if product_id not in products_by_id
    ]

    if semantic_only_ids:
        semantic_products = (
            queryset.filter(id__in=semantic_only_ids)
            .select_related(
                "domain",
                "subdomain_2",
                "subdomain_3",
                "datatype",
                "classification",
                "data_steward",
                "poc_name",
                "business_contact_name",
                "business_sme",
            )
            .prefetch_related("keyword", "images")
        )
        for product in semantic_products:
            product.lexical_score = 0.0
            product.match_tier = 100
            products_by_id[product.id] = product

    return products_by_id, semantic_scores


# ============================================================
# SCORING AND EXPLANATIONS
# ============================================================

def get_weighted_scores(product):
    return {
        "product name": float(getattr(product, "weighted_name", 0) or 0),
        "domain": float(getattr(product, "weighted_domain", 0) or 0),
        "subdomain": max(
            float(getattr(product, "weighted_subdomain_2", 0) or 0),
            float(getattr(product, "weighted_subdomain_3", 0) or 0),
        ),
        "SKU": float(getattr(product, "weighted_sku", 0) or 0),
        "datatype": float(getattr(product, "weighted_datatype", 0) or 0),
        "classification": float(getattr(product, "weighted_classification", 0) or 0),
        "intended use": float(getattr(product, "weighted_intended_use", 0) or 0),
        "short description": float(getattr(product, "weighted_short_desc", 0) or 0),
        "brief description": float(getattr(product, "weighted_brief_desc", 0) or 0),
        "data steward": float(getattr(product, "weighted_data_steward", 0) or 0),
        "product contact": max(
            float(getattr(product, "weighted_poc", 0) or 0),
            float(getattr(product, "weighted_business_contact", 0) or 0),
            float(getattr(product, "weighted_business_sme", 0) or 0),
        ),
    }


def get_match_reasons(product, semantic_score):
    ranked = sorted(get_weighted_scores(product).items(), key=lambda item: item[1], reverse=True)
    reasons = [field for field, score in ranked if score >= 0.10][:3]
    if semantic_score >= SEMANTIC_THRESHOLD and len(reasons) < 3:
        reasons.append("semantic meaning")
    return reasons or ["general text match"]


def calculate_final_score(product, semantic_score):
    lexical_score = float(getattr(product, "lexical_score", 0) or 0)
    match_tier = int(getattr(product, "match_tier", 100))
    tier_score = TIER_SCORES.get(match_tier, 0.0)
    hybrid_score = lexical_score * LEXICAL_WEIGHT + semantic_score * SEMANTIC_WEIGHT
    return max(0.0, min(1.0, max(tier_score, hybrid_score)))


# ============================================================
# MAIN SEARCH
# ============================================================

def product_to_result(
    product,
    request=None,
    matched_on=None,
    relevance_score=None,
):
    """
    Convert a Product model instance into the JSON structure
    returned to Angular.
    """

    images = []

    for product_image in product.images.all():
        image_field = getattr(
            product_image,
            "image",
            None,
        )

        if not image_field:
            continue

        try:
            image_url = image_field.url

            if request:
                image_url = request.build_absolute_uri(
                    image_url
                )

            images.append(image_url)

        except (AttributeError, ValueError):
            continue

    result = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "sku": product.sku,

        "short_desc": product.short_desc,

        "domain": (
            product.domain.name
            if product.domain
            else None
        ),

        "subdomain_2": (
            product.subdomain_2.name
            if product.subdomain_2
            else None
        ),

        "subdomain_3": (
            product.subdomain_3.name
            if product.subdomain_3
            else None
        ),

        "datatype": (
            product.datatype.name
            if product.datatype
            else None
        ),

        "classification": (
            product.classification.name
            if product.classification
            else None
        ),

        "data_steward": (
            product.data_steward.name
            if product.data_steward
            else None
        ),

        "poc_name": (
            product.poc_name.name
            if product.poc_name
            else None
        ),

        "business_contact": (
            product.business_contact_name.name
            if product.business_contact_name
            else None
        ),

        "business_sme": (
            product.business_sme.name
            if product.business_sme
            else None
        ),

        "images": images,
    }

    if matched_on is not None:
        result["matched_on"] = matched_on

    if relevance_score is not None:
        result["relevance_score"] = round(
            float(relevance_score),
            4,
        )

    return result

def hybrid_product_search(request):
    raw_query = request.query_params.get("q", "").strip()
    normalized_query = normalize_query(raw_query)
    page = parse_page(request.query_params.get("page", 1))

    visible_queryset = visible_products()
    explicit_filters = get_explicit_filters(request)
    inferred_filters = (
        infer_filters_from_query(normalized_query, get_filter_vocabulary(visible_queryset))
        if normalized_query
        else {}
    )

    # Only explicit URL filters restrict the queryset.
    applied_filters = explicit_filters.copy()
    filtered_queryset = apply_filters(visible_queryset, explicit_filters)

    # Preserve the complete typed query for retrieval.
    search_query_used = normalized_query
    intent = determine_query_intent(
        normalized_query,
        {**inferred_filters, **explicit_filters},
    )

    spelling_result = None
    if normalized_query:
        spelling_result = build_did_you_mean(
            normalized_query,
            build_spelling_vocabulary(visible_queryset),
        )

    did_you_mean = spelling_result["query"] if spelling_result else None
    spelling_confidence = spelling_result["confidence"] if spelling_result else None
    correction_applied = False

    # Browse mode: all visible products, eight per page.
    if not normalized_query:
        browse_queryset = (
            filtered_queryset.select_related(
                "domain",
                "subdomain_2",
                "subdomain_3",
                "datatype",
                "classification",
                "data_steward",
                "poc_name",
                "business_contact_name",
                "business_sme",
            )
            .prefetch_related("keyword", "images")
            .order_by("name")
        )

        total = browse_queryset.count()
        total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE if total else 0
        start = (page - 1) * PAGE_SIZE
        page_products = list(browse_queryset[start : start + PAGE_SIZE])

        return {
            "query": raw_query,
            "normalized_query": normalized_query,
            "search_query_used": "",
            "intent": "browse",
            "applied_filters": applied_filters,
            "inferred_filters": inferred_filters,
            "did_you_mean": None,
            "spelling_confidence": None,
            "correction_applied": False,
            "count": total,
            "page": page,
            "page_size": PAGE_SIZE,
            "total_pages": total_pages,
            "has_previous": page > 1,
            "has_next": page < total_pages,
            "results": [
                product_to_result(
                    product,
                    request=request,
                )
                for product in page_products
            ],
        }

    products_by_id, semantic_scores = retrieve_hybrid_candidates(
        filtered_queryset,
        search_query_used,
    )

    # If the typed query has no matches, retry the correction.
    if not products_by_id and did_you_mean and did_you_mean != search_query_used:
        search_query_used = did_you_mean
        correction_applied = True
        products_by_id, semantic_scores = retrieve_hybrid_candidates(
            filtered_queryset,
            search_query_used,
        )

    ranked_results = []
    for product in products_by_id.values():
        semantic_score = semantic_scores.get(product.id, 0.0)
        final_score = calculate_final_score(product, semantic_score)
        ranked_results.append(
            {
                "product": product,
                "semantic_score": semantic_score,
                "final_score": final_score,
                "matched_on": get_match_reasons(product, semantic_score),
            }
        )

    ranked_results.sort(
        key=lambda result: (
            int(getattr(result["product"], "match_tier", 100)),
            -result["final_score"],
            (result["product"].name or "").casefold(),
        )
    )

    total = len(ranked_results)
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE if total else 0
    start = (page - 1) * PAGE_SIZE
    page_results = ranked_results[start : start + PAGE_SIZE]

    results = [
        product_to_result(
            item["product"],
            request=request,
            matched_on=item["matched_on"],
            relevance_score=item["final_score"],
        )
        for item in page_results
    ]

    return {
        "query": raw_query,
        "normalized_query": normalized_query,
        "search_query_used": search_query_used,
        "intent": intent,
        "applied_filters": applied_filters,
        "inferred_filters": inferred_filters,
        "did_you_mean": did_you_mean,
        "spelling_confidence": spelling_confidence,
        "correction_applied": correction_applied,
        "count": total,
        "page": page,
        "page_size": PAGE_SIZE,
        "total_pages": total_pages,
        "has_previous": page > 1,
        "has_next": page < total_pages,
        "results": results,
    }
