import re, os, json, traceback, ssl, nltk
import numpy as np
from django.http import JsonResponse
from django.utils.text import slugify
from django.conf import settings
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from rapidfuzz import fuzz, process
# Project imports
from .models import ProductFeedback, ProductEmbedding, HistoricalRequestEmbedding

# --- 1. SYSTEM INITIALIZATION (Original NLP Logic) ---
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

try:
    from sentence_transformers import SentenceTransformer, util

    MODEL = SentenceTransformer('all-MiniLM-L6-v2')
except Exception:
    MODEL = None

try:
    from nltk.corpus import words
    from nltk.tokenize import word_tokenize
    from nltk.stem import WordNetLemmatizer

    try:
        nltk.data.find('corpora/words')
    except:
        nltk.download('words', quiet=True)
    ENGLISH_WORDS = set(w.lower() for w in words.words())
    _lemmatizer = WordNetLemmatizer()


    def lemmatize_word(w):
        return _lemmatizer.lemmatize(w)
except Exception:
    ENGLISH_WORDS = {"data", "report", "customer", "fueling", "engine", "sensitive", "vehicle", "master"}


    def word_tokenize(text):
        return text.lower().split()


    def lemmatize_word(w):
        return

# --- 2. INTELLIGENT HELPERS ---
STOP_WORDS = {'the', 'and', 'for', 'with', 'this', 'that', 'need', 'access', 'to', 'of', 'in', 'on', 'a', 'an'}

def load_master_orders():
    """Load and filter successful historical orders."""
    path = str(getattr(settings, "MARKETPLACE_ORDER_MASTER", ""))
    if not os.path.exists(path):
        return []
    try:
        with open(path, 'r') as f:
            data = json.load(f)
            # Filter for successful completions only
            return [
                o for o in data if (o.get('ritm_state') or o.get('state')) == "Closed Complete"
                and any(word in (o.get('work_notes') or "").lower() for word in ["approved", "granted", "provisioned"])
            ]
    except:
        return []

# --- 2. VIEWS ---
def search_page(request):
    """Path: /ai/search/ - Renders the AI search interface"""
    return render(request, 'suggestedAI/search.html')

def get_grade_and_color(percentage):
    val = float(percentage)
    if val >= 98: return 'A+', 'ai-grade-a-plus'
    if val >= 94: return 'A', 'ai-grade-a'
    if val >= 90: return 'A-', 'ai-grade-a-minus'
    if val >= 87: return 'B+', 'ai-grade-b-plus'
    if val >= 83: return 'B', 'ai-grade-b'
    if val >= 80: return 'B-', 'ai-grade-b-minus'
    if val >= 77: return 'C+', 'ai-grade-c-plus'
    if val >= 73: return 'C', 'ai-grade-c'
    if val >= 70: return 'C-', 'ai-grade-c-minus'
    if val >= 67: return 'D+', 'ai-grade-d-plus'
    if val >= 63: return 'D', 'ai-grade-d'
    if val >= 60: return 'D-', 'ai-grade-d-minus'
    return 'F', 'ai-grade-f'


def load_data_cached():
    cache_key = 'marketplace_master_v29'
    cached = cache.get(cache_key)
    if cached: return cached['denodo'], cached['products']
    p_path = str(getattr(settings, "MARKETPLACE_PRODUCT_MASTER", ""))
    d_path = str(getattr(settings, "MARKETPLACE_DENODO_MASTER", ""))
    products, denodo = [], []
    try:
        if os.path.exists(p_path):
            with open(p_path, 'r', encoding='utf-8') as f: products = json.load(f)
        if os.path.exists(d_path):
            with open(d_path, 'r', encoding='utf-8') as f:
                raw = json.load(f)
                if isinstance(raw, dict):
                    for v in raw.values():
                        if isinstance(v, dict): denodo.extend(v.get("elements", []))
                else:
                    denodo = raw
        cache.set(cache_key, {'denodo': denodo, 'products': products}, 3600)
    except:
        pass
    return denodo, products


def get_refined_score(query, product_name, p_datatype, preferred_type):
    """
    Improved scoring that weights name matches higher and reduces penalties.
    """
    # 1. Base Ratio (Partial match is better for long queries)
    base_score = fuzz.token_set_ratio(query.lower(), product_name.lower())

    # 2. Bonus for exact substring (e.g., 'Vehicle' inside 'Vehicle Master')
    if query.lower() in product_name.lower():
        base_score += 10

    # 3. Soften the Type Adjustment
    # Instead of -40, we just give a small boost to preferred types
    adjustment = 15 if p_datatype == preferred_type else 0

    # 4. Minimize word penalty
    product_words = set(re.findall(r'\w+', product_name.lower()))
    query_words = set(re.findall(r'\w+', query.lower()))
    extra_words = product_words - query_words - {'the', 'and', 'for', 'data'}
    word_penalty = len(extra_words) * 2  # Small flat deduction per extra word

    return min(100, (base_score + adjustment) - word_penalty)

# --- 3. VIEWS ---
@csrf_exempt
def suggest_products_by_role(request):
    """Suggested products using the same retrieval and scoring path as the Node AI engine."""
    try:
        from .node_engine.engine import suggest_from_request
        return JsonResponse(suggest_from_request(request))
    except Exception:
        return JsonResponse({"status": "error", "message": str(traceback.format_exc())}, status=500)


@csrf_exempt
def suggest_products_enhanced(request):
    try:
        # 1. Parse Input
        data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
        desc = (data.get("data_request_description") or "").strip()
        db_raw = (data.get("database-schema") or "").strip()
        tbl_raw = (data.get("tablenames") or "").strip()

        results_map = {}
        history = load_master_orders()  # Loads @master-order.json

        if desc and MODEL:
            query_vector = MODEL.encode(desc.lower(), convert_to_tensor=True)

            for p_emb in ProductEmbedding.objects.all():
                # AI Similarity Score
                sim = util.cos_sim(query_vector, np.array(p_emb.vector)).item() * 100

                # Check for Social Proof (Historical Match)
                is_historical_match = any(
                    str(h.get('product_id')) == str(p_emb.id) or
                    p_emb.product_name.lower() in (h.get('product_name') or "").lower()
                    for h in history
                )

                # Boosting & Verification
                final_score = sim + (15 if is_historical_match else 0)
                is_verified = final_score >= 88 or is_historical_match

                if final_score >= 40:
                    badges = ["AI MATCH"]
                    if is_historical_match: badges.append("PREVIOUSLY APPROVED")

                    # YOUR INTEGRATED MAP (Corrected Syntax)
                    results_map[p_emb.slug] = {
                        "name": p_emb.product_name,
                        "slug": p_emb.slug,
                        "url": f"/marketplace/products/{p_emb.id}?from_ai=true",
                        "match_percentage": round(final_score, 2),
                        "verified": is_verified,
                        "badges": badges,
                        "reason": "Historical Access Pattern" if is_historical_match else "Semantic Metadata Match",
                        "explanation": "Matched successful historical request patterns." if is_historical_match else "Verified Metadata Match.",
                        "detailed_explanation": f"This product was previously granted for a similar request with {round(sim)}% technical similarity.",
                        "db_name": db_raw,
                        "tbl_name": tbl_raw
                    }

        # Sort and return
        sorted_results = sorted(results_map.values(), key=lambda x: x['match_percentage'], reverse=True)
        return JsonResponse({"status": "success", "suggestions": sorted_results[:5]})

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

@csrf_exempt
def submit_feedback(request):
    # (Logic for feedback follows original pattern)
    return JsonResponse({"status": "success"})

@csrf_exempt
def submit_feedback(request):
    """Records whether the AI suggestion was helpful or not"""
    if request.method == "POST":
        ProductFeedback.objects.create(
            product_name=request.POST.get("product"),
            slug=request.POST.get("slug"),
            was_helpful=request.POST.get("was_helpful") == "true",
            user_ip=request.META.get("REMOTE_ADDR")
        )
        return JsonResponse({"status": "success"})
    return JsonResponse({"status": "error"}, status=400)