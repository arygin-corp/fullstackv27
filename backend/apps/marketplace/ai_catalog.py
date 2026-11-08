"""Match typed database, table, and column names to catalog products.

The index lives in backend/assets/json/marketplace/ai_search/. Each file
describes one product role and the databases, tables, and columns behind it.
"""

import json
import re
import time
from pathlib import Path

from django.db.models import Q

from .hybrid_search import (
    PAGE_SIZE,
    STOP_WORDS,
    build_did_you_mean,
    content_query,
    get_semantic_matches,
    hybrid_product_search,
    normalize_query,
    parse_page,
    product_to_result,
    slice_results,
    spoken_matches,
    term_filter,
    visible_products,
)

_CATALOG_CACHE = {"stamp": None, "records": [], "vocabulary": []}
_RESULT_CACHE = {}
_RESULT_TTL = 120


def _remember_catalog(query_key, page, builder):
    now = time.time()
    stamp = _CATALOG_CACHE.get("stamp")
    cached = _RESULT_CACHE.get(query_key)
    if cached and cached[0] == stamp and now - cached[1] < _RESULT_TTL:
        return {**cached[2], **slice_results(cached[2]["results"], page)}
    bundle = builder()
    if bundle.get("page"):
        return bundle
    _RESULT_CACHE[query_key] = (stamp, now, bundle)
    if len(_RESULT_CACHE) > 40:
        oldest = min(_RESULT_CACHE, key=lambda key: _RESULT_CACHE[key][1])
        _RESULT_CACHE.pop(oldest, None)
    return {**bundle, **slice_results(bundle["results"], page)}


def catalog_directory():
    return Path(__file__).resolve().parents[2] / "assets" / "json" / "marketplace" / "ai_search"


def _directory_stamp(root):
    if not root.exists():
        return None
    newest = root.stat().st_mtime
    for path in root.glob("*.json"):
        newest = max(newest, path.stat().st_mtime)
    return newest


def load_ai_catalog():
    root = catalog_directory()
    stamp = _directory_stamp(root)
    if _CATALOG_CACHE["stamp"] == stamp:
        return _CATALOG_CACHE["records"]

    records = []
    vocabulary = set()
    for path in _catalog_files(root):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        for record in _records_from_payload(payload):
            records.append(record)
            for value in record["databases"] + record["tables"] + record["columns"]:
                token = normalize_query(value)
                if len(token) >= 3:
                    vocabulary.add(token)

    _CATALOG_CACHE["stamp"] = stamp
    _CATALOG_CACHE["records"] = records
    _CATALOG_CACHE["vocabulary"] = sorted(vocabulary)
    return records


def _catalog_files(root):
    if not root.exists():
        return []
    combined = root / "ai_search.json"
    others = sorted(path for path in root.glob("*.json") if path.name != "ai_search.json")
    if not combined.exists():
        return others
    try:
        payload = json.loads(combined.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return others
    if _records_from_payload(payload):
        return [combined]
    return others


def _records_from_payload(payload):
    if isinstance(payload, dict) and isinstance(payload.get("products"), list):
        records = []
        for item in payload["products"]:
            record = _normalize_record(item)
            if record:
                records.append(record)
        return records
    record = _normalize_record(payload)
    return [record] if record else []


def _as_list(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _normalize_record(payload):
    if not isinstance(payload, dict):
        return None

    if isinstance(payload.get("elements"), list):
        databases, tables, columns, adgroups, slugs = set(), set(), set(), set(), set()
        for element in payload["elements"]:
            if not isinstance(element, dict):
                continue
            if element.get("userrolename"):
                adgroups.add(str(element["userrolename"]).strip())
            if element.get("dbname"):
                databases.add(str(element["dbname"]).strip())
            if element.get("elementname"):
                tables.add(str(element["elementname"]).strip())
            column = element.get("column_name") or element.get("column_names")
            columns.update(_as_list(column))
        adgroup = next(iter(adgroups), "")
        return _record(adgroup, slugs, databases, tables, columns)

    adgroup = str(payload.get("adgroup") or payload.get("userrolename") or "").strip()
    slugs = set(_as_list(payload.get("slugs") or payload.get("slug")))
    return _record(
        adgroup,
        slugs,
        _as_list(payload.get("databases") or payload.get("dbname")),
        _as_list(payload.get("tables") or payload.get("elementname")),
        _as_list(payload.get("columns") or payload.get("column_name") or payload.get("column_names")),
    )


def _record(adgroup, slugs, databases, tables, columns):
    databases = sorted({item for item in databases if item})
    tables = sorted({item for item in tables if item})
    columns = sorted({item for item in columns if item})
    slugs = sorted({item for item in slugs if item})
    if not adgroup and not slugs:
        return None
    if not databases and not tables and not columns:
        return None
    return {
        "adgroup": adgroup,
        "slugs": slugs,
        "databases": databases,
        "tables": tables,
        "columns": columns,
    }


FIELD_LABELS = {
    "adgroup": "Ad Group",
    "database": "Database",
    "table": "Table",
    "column": "Column",
}
FIELD_RANK = {"column": 0, "table": 10, "database": 20, "adgroup": 30}


def _metadata_terms(query):
    """Names to look up. A sentence keeps only identifier-like words."""
    text = normalize_query(query).rstrip("?")
    tokens = [
        token.strip("?.,!;:\"'`()[]{}")
        for token in re.split(r"[\s,]+", text)
    ]
    tokens = [token for token in tokens if token and token != "and"]
    sentence = is_question(query) or any(token in STOP_WORDS for token in tokens)
    terms = []
    seen = set()
    for token in tokens:
        if len(token) < 3 or token in STOP_WORDS or token in seen:
            continue
        technical = bool(re.search(r"[_\-\d]", token))
        if sentence and not technical:
            continue
        seen.add(token)
        terms.append(token)
    return terms


def _field_hits(term, values, technical, segments=False):
    """Exact names, then a typed word that is one piece of a longer name."""
    hits = []
    for value in values:
        text = normalize_query(value)
        if not text:
            continue
        if text == term:
            hits.append((0, value))
            continue
        if (
            segments
            and len(term) >= 3
            and term in re.split(r"[_-]+", text)
        ):
            hits.append((1, value))
            continue
        if technical and len(term) >= 3 and text.startswith(term):
            hits.append((1, value))
        elif technical and len(term) >= 3 and term in text:
            hits.append((2, value))
    hits.sort(key=lambda item: (item[0], len(item[1])))
    return hits[:3]


PRIVACY_QUERIES = {
    "pi": "pi",
    "personal information": "pi",
    "personal info": "pi",
    "spi": "spi",
    "sensitive pi": "spi",
    "sensitive personal information": "spi",
    "sensitive personal info": "spi",
}


def privacy_query(query):
    text = normalize_query(query).rstrip("?")
    direct = PRIVACY_QUERIES.get(text)
    if direct:
        return direct
    if "sensitive personal" in text or " spi " in f" {text} " or text.endswith(" spi"):
        return "spi"
    if "personal information" in text or " pi " in f" {text} " or text.endswith(" pi"):
        return "pi"
    return None


QUESTION_WORDS = ("who", "what", "which", "where", "when", "why", "how", "show", "find", "list")


# Generic words. They can support a phrase, but they do not decide the match.
WEAK_TERMS = frozenset({
    "data", "information", "info", "details", "detail", "records", "record",
    "name", "names", "type", "types", "dataset", "datasets",
})


def _search_parts(query):
    text = normalize_query(query).rstrip("?")
    parts = [part.strip(" ?.!") for part in re.split(r"[,;]+", text)]
    parts = [part for part in parts if part]
    return parts or ([text] if text else [])


def _plain_terms(part):
    return [
        term for term in content_query(part).split()
        if len(term) >= 3 and not re.search(r"[_\-\d]", term)
    ]


def _is_phrase_part(part):
    words = normalize_query(part).split()
    plain = _plain_terms(part)
    if is_question(part):
        return True
    if any(word in STOP_WORDS for word in words):
        return True
    return len(plain) >= 2


def _wants_relevance(query):
    """Questions, phrases, and comma-separated searches rank by meaning."""
    parts = _search_parts(query)
    if any(_is_phrase_part(part) for part in parts):
        return True
    if len(parts) <= 1:
        return False
    return any(_plain_terms(part) for part in parts)


def _clean_text(value):
    text = re.sub(r"<[^>]+>", " ", str(value or ""))
    return normalize_query(text)


def _named(value):
    return value.name if value is not None and getattr(value, "name", None) else ""


def _product_fields(product):
    keywords = " ".join(keyword.name for keyword in product.keyword.all())
    return (
        (_clean_text(product.name), 1.0),
        (_clean_text(_named(product.domain)), 0.92),
        (_clean_text(_named(product.subdomain_2)), 0.86),
        (_clean_text(_named(product.subdomain_3)), 0.82),
        (_clean_text(keywords), 0.84),
        (_clean_text(_named(product.datatype)), 0.70),
        (_clean_text(product.short_desc), 0.64),
        (_clean_text(product.intended_use), 0.60),
        (_clean_text(product.brief_desc), 0.56),
        (_clean_text(product.sku), 0.45),
    )


def _term_score(term, fields):
    """Whole-word score, then a smaller score when the word only sits inside another word."""
    whole = 0.0
    partial = 0.0
    pattern = rf"(?<!\w){re.escape(term)}(?!\w)"
    for text, weight in fields:
        if not text:
            continue
        if re.search(pattern, text):
            whole = max(whole, weight)
        elif term in text:
            partial = max(partial, weight * 0.22)
    return whole, partial


def _load_products(product_filter, limit=None):
    queryset = (
        visible_products()
        .filter(product_filter)
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
            "org",
            "ad_group",
        )
        .prefetch_related("keyword", "images")
        .distinct()
    )
    if limit:
        queryset = queryset.order_by("name")[:limit]
    return list(queryset)


_EMBEDDINGS_READY = None
_VECTOR_CACHE = {"stamp": None, "ids": [], "matrix": None}


def _semantic_scores(text):
    """Rank by meaning. Uses stored embeddings, or builds them in memory once."""
    global _EMBEDDINGS_READY
    try:
        from .models import SearchProductEmbedding
        if _EMBEDDINGS_READY is None:
            _EMBEDDINGS_READY = SearchProductEmbedding.objects.exists()
        if _EMBEDDINGS_READY:
            allowed = list(visible_products().values_list("id", flat=True))
            scores = get_semantic_matches(text, allowed)
            return {
                product_id: score
                for product_id, score in scores.items()
                if score >= 0.32
            }
    except Exception:
        _EMBEDDINGS_READY = False
    return _local_semantic_scores(text)


def _local_semantic_scores(text):
    from django.db.models import Count, Max

    from .search_services import get_search_model

    stamp = visible_products().aggregate(count=Count("id"), updated=Max("updated_at"))
    stamp = (stamp["count"], stamp["updated"])
    if _VECTOR_CACHE["stamp"] != stamp or _VECTOR_CACHE["matrix"] is None:
        products = list(
            visible_products().select_related("domain", "datatype").only(
                "id", "name", "short_desc", "sku", "domain", "datatype",
            )
        )
        texts = [
            " ".join(part for part in (
                product.name or "",
                _clean_text(product.short_desc),
                product.sku or "",
                product.datatype.name if product.datatype_id else "",
                product.domain.name if product.domain_id else "",
            ) if part)
            for product in products
        ]
        model = get_search_model()
        matrix = model.encode(texts or [""], show_progress_bar=False, normalize_embeddings=True)
        _VECTOR_CACHE["stamp"] = stamp
        _VECTOR_CACHE["ids"] = [product.id for product in products]
        _VECTOR_CACHE["matrix"] = matrix
    model = get_search_model()
    query = model.encode([text or ""], show_progress_bar=False, normalize_embeddings=True)[0]
    scores = _VECTOR_CACHE["matrix"] @ query
    return {
        product_id: float(score)
        for product_id, score in zip(_VECTOR_CACHE["ids"], scores.tolist())
        if float(score) >= 0.20
    }


def _phrase_relevance(product, terms, meaning):
    fields = _product_fields(product)
    strong = [term for term in terms if term not in WEAK_TERMS] or list(terms)
    total = 0.0
    strong_hits = 0
    for term in terms:
        whole, partial = _term_score(term, fields)
        rarity = 0.45 if term in WEAK_TERMS else 1.15
        total += rarity * (whole if whole else partial)
        if term in strong and whole > 0:
            strong_hits += 1
    vectors_ready = _EMBEDDINGS_READY or _VECTOR_CACHE["matrix"] is not None
    if vectors_ready:
        if meaning <= 0:
            return None
        if strong_hits < len(strong) and meaning < 0.38:
            return None
    elif strong_hits < len(strong):
        return None
    together = 0.0
    if len(terms) > 1:
        for text, weight in fields:
            if not text:
                continue
            if all(re.search(rf"(?<!\w){re.escape(term)}(?!\w)", text) for term in terms):
                together = max(together, weight)
    total += 0.35 * together
    lexical = min(1.0, total / max(1.0, len(terms) * 1.15))
    if vectors_ready:
        return min(1.0, meaning + 0.03 * lexical)
    return lexical


def _score_phrase(phrase):
    terms = [term for term in content_query(phrase).split() if len(term) >= 3]
    strong = [term for term in terms if term not in WEAK_TERMS] or terms
    if not strong:
        return []
    query = Q()
    for term in strong:
        query |= term_filter(term)
    products = _load_products(query, limit=400)
    found_ids = {product.id for product in products}
    semantic = _semantic_scores(" ".join(terms))
    missing = [product_id for product_id in semantic if product_id not in found_ids]
    if missing:
        products.extend(_load_products(Q(id__in=missing)))

    scored = []
    for product in products:
        score = _phrase_relevance(product, terms, semantic.get(product.id, 0.0))
        if score is None:
            continue
        scored.append((product, score))
    return scored


def _relevance_bundle(request, raw_query, normalized_query, records):
    parts = [
        part for part in _search_parts(raw_query)
        if _is_phrase_part(part) or _plain_terms(part)
    ]
    phrase_parts = [part for part in parts if not _metadata_terms(part) or _is_phrase_part(part)]
    if not phrase_parts:
        phrase_parts = parts or [normalized_query]
    combined = {}
    for part in phrase_parts:
        if _metadata_terms(part) and not _plain_terms(part):
            continue
        for product, score in _score_phrase(part):
            row = combined.setdefault(product.id, {"product": product, "scores": []})
            row["scores"].append(score)
    part_count = max(1, len([
        part for part in phrase_parts
        if not (_metadata_terms(part) and not _plain_terms(part))
    ]))
    highlights = _highlights_for_query(records, raw_query)
    ranked = []
    for row in combined.values():
        best = max(row["scores"])
        matched_parts = len(row["scores"]) / part_count
        product = row["product"]
        tags = highlights.get(product.id, [])
        if part_count == 1:
            final = best
        else:
            final = best + 0.05 * (len(row["scores"]) - 1)
        final = min(1.0, final + min(0.06, 0.02 * len(tags)))
        ranked.append((product, final, tags))
    seen = {product.id for product, _, _ in ranked}
    extra_ids = [product_id for product_id, tags in highlights.items() if product_id not in seen and tags]
    if extra_ids:
        for product in _load_products(Q(id__in=extra_ids)):
            tags = highlights.get(product.id, [])
            ranked.append((product, min(0.55, 0.30 + 0.04 * len(tags)), tags))
    ranked.sort(key=lambda item: (-item[1], item[0].name or ""))
    if ranked:
        floor = ranked[0][1] * 0.62
        ranked = [item for item in ranked if item[1] >= floor]
    ranked = ranked[:96]

    def _result(product, score, tags):
        result = product_to_result(
            product,
            request=request,
            matched_on=[f"{tag['kind']}:{tag['value']}" for tag in tags],
            relevance_score=round(score, 4),
        )
        if tags:
            result["highlights"] = tags
        return result

    return {
        "query": raw_query,
        "normalized_query": normalized_query,
        "search_query_used": content_query(normalized_query),
        "intent": "question",
        "applied_filters": {},
        "inferred_filters": {},
        "did_you_mean": None,
        "spelling_confidence": None,
        "correction_applied": False,
        "results": [_result(product, score, tags) for product, score, tags in ranked],
    }


def _highlights_for_query(records, query):
    terms = [term for term in _metadata_terms(query) if re.search(r"[_\-\d]", term)]
    if not terms:
        return {}
    by_product = {}
    matches = _ranked_matches(records, terms)
    if not matches:
        return {}
    slugs = []
    adgroups = []
    for _, record, _, _ in matches:
        slugs.extend(record["slugs"])
        if record["adgroup"]:
            adgroups.append(record["adgroup"])
    products = visible_products().filter(
        Q(slug__in=slugs) | Q(ad_group__name__in=adgroups) | Q(ad_group__value__in=adgroups)
    ).select_related("ad_group")
    by_slug = {product.slug: product.id for product in products if product.slug}
    by_group = {}
    for product in products:
        group = product.ad_group
        if not group:
            continue
        if group.name:
            by_group[group.name.lower()] = product.id
        if group.value:
            by_group[group.value.lower()] = product.id
    for _, record, tags, _ in matches:
        product_id = None
        for slug in record["slugs"]:
            product_id = by_slug.get(slug)
            if product_id:
                break
        if product_id is None and record["adgroup"]:
            product_id = by_group.get(record["adgroup"].lower())
        if product_id is None:
            continue
        current = by_product.setdefault(product_id, [])
        seen = {(tag["kind"], tag["value"].casefold()) for tag in current}
        for tag in tags:
            key = (tag["kind"], tag["value"].casefold())
            if key not in seen:
                current.append(tag)
                seen.add(key)
    return by_product


def is_question(query):
    text = normalize_query(query).rstrip("?")
    words = text.split()
    if len(words) < 4:
        return False
    if str(query).strip().endswith("?"):
        return True
    if words[0] in QUESTION_WORDS:
        return True
    return any(phrase in text for phrase in ("products that", "products with", "product that", "looking for", "i need", "i want"))


def _ranked_matches(records, terms):
    if isinstance(terms, str):
        terms = _metadata_terms(terms) or ([terms] if terms else [])
    matches = []
    for record in records:
        found = _match_record(terms, record)
        if found:
            matches.append((found[0], record, found[1], found[2]))
    matches.sort(key=lambda item: (-item[3], item[0], item[1]["adgroup"]))
    return matches


def _match_record(terms, record):
    if isinstance(terms, str):
        terms = [terms]
    tags = []
    seen = set()
    best = None
    matched_terms = set()
    fields = (
        ("column", record["columns"]),
        ("table", record["tables"]),
        ("database", record["databases"]),
        ("adgroup", [record["adgroup"]] if record["adgroup"] else []),
    )
    for term in terms:
        technical = bool(re.search(r"[_\-\d]", term))
        for kind, values in fields:
            # A full ad group still matches that group only. A single word can match one piece of it.
            hits = _field_hits(
                term,
                values,
                technical and kind != "adgroup",
                segments=True,
            )
            if not hits:
                continue
            matched_terms.add(term)
            for rank, value in hits:
                key = (kind, value.casefold())
                if key in seen:
                    continue
                seen.add(key)
                tags.append({
                    "kind": kind,
                    "label": FIELD_LABELS[kind],
                    "value": value,
                })
                score = FIELD_RANK[kind] + rank
                best = score if best is None else min(best, score)
    if not tags:
        return None
    tags.sort(key=lambda tag: (FIELD_RANK[tag["kind"]], tag["value"].casefold()))
    return best, tags, len(matched_terms)


def _privacy_search(request, raw_query, normalized_query, page, privacy):
    field_name = "pi" if privacy == "pi" else "sensitive_pi"
    label = "PI" if privacy == "pi" else "SPI"
    products = list(
        visible_products()
        .filter(**{f"{field_name}__iexact": "Yes"})
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
            "org",
            "ad_group",
        )
        .prefetch_related("images")
        .order_by("name")
    )
    return {
        "query": raw_query,
        "normalized_query": normalized_query,
        "search_query_used": normalized_query,
        "intent": "catalog",
        "applied_filters": {field_name: "Yes"},
        "inferred_filters": {},
        "did_you_mean": None,
        "spelling_confidence": None,
        "correction_applied": False,
        "results": [
            product_to_result(product, request=request, matched_on=[f"privacy:{label}"])
            for product in products
        ],
    }


def catalog_product_search(request):
    raw_query = request.query_params.get("q", "").strip()
    normalized_query = normalize_query(raw_query)
    page = parse_page(request.query_params.get("page", 1))
    load_ai_catalog()
    response = _remember_catalog(
        normalized_query,
        page,
        lambda: _catalog_bundle(request, raw_query, normalized_query),
    )
    if page == 1 and _wants_relevance(raw_query):
        cached = _RESULT_CACHE.get(normalized_query)
        source = cached[2] if cached else response
        from .training_store import record_training
        record_training(raw_query, normalized_query, source)
    return response


def _catalog_bundle(request, raw_query, normalized_query):
    records = load_ai_catalog()
    page = 1
    search_query = normalized_query
    correction_applied = False
    privacy = privacy_query(search_query)
    if privacy:
        return _privacy_search(request, raw_query, normalized_query, page, privacy)
    if _wants_relevance(raw_query):
        bundle = _relevance_bundle(request, raw_query, normalized_query, records)
        if bundle["results"]:
            return bundle
        spelling = build_did_you_mean(normalized_query, _CATALOG_CACHE["vocabulary"])
        if spelling and spelling["query"] != normalized_query:
            retry = _relevance_bundle(request, spelling["query"], spelling["query"], records)
            if retry["results"]:
                corrected = spelling["query"]
                retry["query"] = raw_query
                retry["normalized_query"] = normalized_query
                retry["did_you_mean"] = corrected[:1].upper() + corrected[1:]
                retry["spelling_confidence"] = spelling["confidence"]
                retry["correction_applied"] = True
                return retry
    terms = _metadata_terms(raw_query)
    search_terms = list(terms)
    if not search_terms and not is_question(raw_query) and len(normalized_query) >= 3:
        search_terms = [normalized_query]
    matches = _ranked_matches(records, search_terms) if search_terms else []
    spelling = None
    if not matches and search_terms and not is_question(raw_query) and len(normalized_query) >= 3:
        spelling = build_did_you_mean(normalized_query, _CATALOG_CACHE["vocabulary"])
    if not matches and spelling and spelling["query"] != normalized_query:
        search_query = spelling["query"]
        correction_applied = True
        corrected_terms = _metadata_terms(search_query) or [search_query]
        matches = _ranked_matches(records, corrected_terms)
    if not matches and is_question(raw_query):
        spoken = content_query(normalized_query)
        spoken_rows, search_query_used = spoken_matches(normalized_query)
        spoken_products = list(spoken_rows[:96])
        if spoken_products:
            return {
                "query": raw_query,
                "normalized_query": normalized_query,
                "search_query_used": search_query_used,
                "intent": "question",
                "applied_filters": {},
                "inferred_filters": {},
                "did_you_mean": None,
                "spelling_confidence": None,
                "correction_applied": False,
                "results": [
                    product_to_result(product, request=request)
                    for product in spoken_products
                ],
            }
        data = hybrid_product_search(request)
        data["intent"] = "question"
        if spoken != normalized_query:
            data["did_you_mean"] = None
        return data
    did_you_mean = None
    if spelling and (correction_applied or not matches):
        corrected = spelling["query"]
        did_you_mean = corrected[:1].upper() + corrected[1:]

    slugs = []
    adgroups = []
    for _, record, _, _ in matches:
        slugs.extend(record["slugs"])
        if record["adgroup"]:
            adgroups.append(record["adgroup"])

    products = []
    if slugs or adgroups:
        products = list(
            visible_products()
            .filter(Q(slug__in=slugs) | Q(ad_group__name__in=adgroups) | Q(ad_group__value__in=adgroups))
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
                "org",
                "ad_group",
            )
            .prefetch_related("images")
            .distinct()
        )

    by_slug = {product.slug: product for product in products if product.slug}
    by_group = {}
    for product in products:
        group = product.ad_group
        if not group:
            continue
        if group.name:
            by_group.setdefault(group.name.lower(), product)
        if group.value:
            by_group.setdefault(group.value.lower(), product)

    ordered = []
    details = {}
    for score, record, tags, term_count in matches:
        product = None
        for slug in record["slugs"]:
            product = by_slug.get(slug)
            if product:
                break
        if product is None and record["adgroup"]:
            product = by_group.get(record["adgroup"].lower())
        if product is None:
            continue
        current = details.get(product.id)
        if current is None:
            details[product.id] = {
                "product": product,
                "score": score,
                "terms": term_count,
                "highlights": list(tags),
            }
            ordered.append(product)
            continue
        current["score"] = min(current["score"], score)
        current["terms"] = max(current["terms"], term_count)
        seen_tags = {(tag["kind"], tag["value"].casefold()) for tag in current["highlights"]}
        for tag in tags:
            key = (tag["kind"], tag["value"].casefold())
            if key not in seen_tags:
                current["highlights"].append(tag)
                seen_tags.add(key)

    ordered.sort(key=lambda product: (
        -details[product.id]["terms"],
        details[product.id]["score"],
        product.name or "",
    ))

    def _result(product):
        highlights = details[product.id]["highlights"]
        result = product_to_result(
            product,
            request=request,
            matched_on=[f"{tag['kind']}:{tag['value']}" for tag in highlights],
        )
        result["highlights"] = highlights
        return result

    return {
        "query": raw_query,
        "normalized_query": normalized_query,
        "search_query_used": search_query,
        "intent": "catalog",
        "applied_filters": {},
        "inferred_filters": {},
        "did_you_mean": did_you_mean,
        "spelling_confidence": spelling["confidence"] if spelling else None,
        "correction_applied": correction_applied,
        "results": [_result(product) for product in ordered],
    }
