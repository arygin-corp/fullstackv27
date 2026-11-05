import json, os, re
from difflib import SequenceMatcher
from django.http.response import JsonResponse
from rapidfuzz import fuzz
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import ProductFeedback
from django.core.cache import cache
from difflib import SequenceMatcher

file_path = os.path.join('static', 'json', 'marketplace', 'products', 'products.json')
with open(file_path, encoding='utf-8') as f:
    file = json.load(f)

def load_product_info(file):
    with open(file, 'r') as f:
        data = json.load(f)
    return data

def fuzzy_match_score(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def load_json_from_file(path, cache_key, timeout=3600):
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    try:
        with open(path, 'r') as f:
            data = json.load(f)
            cache.set(cache_key, data, timeout)
            return data
    except Exception as e:
        print(f"Error loading {cache_key}:", e)
        return []
    
def load_denodo_json(filepath):
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
        all_records = []
        for role_key, role_data in data.items():
            elements = role_data.get("elements", [])
            for element in elements:
                all_records.append(element)
        return all_records
    except Exception as e:
        print("Error loading denodo JSON:", e)
        return []

def get_grade_and_color(percentage):
    if percentage >= 90:
        return 'A', 'ai-suggested-excellent'
    elif percentage >= 80:
        return 'B', 'ai-suggested-good'
    elif percentage >= 70:
        return 'C', 'ai-suggested-fair'
    elif percentage >= 60:
        return 'D', 'ai-suggested-poor'
    else:
        return 'F', 'ai-suggested-bad'

def extract_schema_names(raw_input):
    quoted = re.findall(r'"(.*?)"', raw_input)
    unquoted = re.sub(r'"(.*?)"', '', raw_input)
    unquoted_parts = [part.strip() for part in unquoted.split(',') if part.strip()]
    return quoted + unquoted_parts

def extract_table_names(raw_input):
    parts = [p.strip() for p in raw_input.split(',') if p.strip()]
    table_names = []
    for part in parts:
        match = re.search(r'table\s*=\s*(\w+)', part, re.IGNORECASE)
        if match:
            table_names.append(match.group(1))
        else:
            table_names.append(part.strip('"'))
    return table_names
    
def compute_cosine_similarity(user_text, product_texts):
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform([user_text] + product_texts)
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    return similarities

def get_feedback_stats_for_products(products):
    for product in products:
        feedback = ProductFeedback.objects.filter(slug=product.get('slug'))
        total = feedback.count()
        positive = feedback.filter(was_helpful=True).count()
        product["feedback_total"] = total
        product["feedback_positive"] = positive
        product["feedback_percent"] = round((positive / total) * 100) if total else 0
    return products

def extract_keywords(text, top_n=5):
    words = re.findall(r'\b\w+\b', text.lower())
    stopwords = {'the', 'and', 'for', 'with', 'this', 'that', 'need', 'access', 'to', 'of', 'in', 'on', 'a', 'an'}
    filtered_words = [word for word in words if word not in stopwords and len(word) > 2]
    filtered_text = ' '.join(filtered_words)
    vectorizer = CountVectorizer(stop_words='english')
    X = vectorizer.fit_transform([filtered_text])
    keywords = vectorizer.get_feature_names_out()
    return keywords[:top_n]

def get_verified_history(product_id):
    """
    Parses @master-order.json to find if this specific product
    has a history of 'Closed Complete' with approval confirmation.
    """
    with open('static/json/marketplace/orders/@master-order.json', 'r') as f:
        master_data = json.load(f)

    # Filtering Criteria:
    # 1. Matches Product ID
    # 2. State is "Closed Complete"
    # 3. Work Notes contain approval keywords
    approval_keywords = ["approved", "granted", "given access", "provisioned"]

    verified_matches = []

    for order in master_data:
        # Check standard fields or variables for Product ID
        if order.get('product_id') == product_id:
            state = order.get('ritm_state') or order.get('state')

            if state == "Closed Complete":
                # Scan work_notes or ritm_comments for approval proof
                notes = (order.get('work_notes') or "" + order.get('ritm_comments') or "").lower()

                if any(keyword in notes for keyword in approval_keywords):
                    verified_matches.append(order)

    return verified_matches

def check_verified_product(order, denodo_entries, products, similarity_threshold=1.0):
    work_notes = order.get("Work notes", "").lower()

    # Handle both "Database/Schema" and "Database/Schema:"
    order_db = order.get("Database/Schema", order.get("Database/Schema:", "")).lower()

    # Handle both "Platform" and "Platform:"
    platform_value = order.get("Platform", order.get("Platform:", "")).strip()
    order_tables_raw = order.get("Table Name(s)", "").lower()
    order_tables = [tbl.strip() for tbl in order_tables_raw.split(",")]

    valid_state = order.get("Request State", "") in ["Closed Complete", "Closed Skipped"]
    valid_platform = platform_value in ["", "TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)"]

    # Extract optional AD group from work notes
    ad_group_match = re.search(r"\btbdp-[\w\-]+", work_notes, re.IGNORECASE)
    extracted_ad_group = ad_group_match.group(0) if ad_group_match else None

    access_granted = (
        "access granted" in work_notes or
        "access granted to the user" in work_notes or
        "access to prod has been granted" in work_notes or
        "your data access request has been completed" in work_notes or
        extracted_ad_group is not None
    )

    if not (valid_state and valid_platform and access_granted):
        return False, None

    for entry in denodo_entries:
        db_match = entry['dbname'].lower() == order_db

        if "all" in order_tables:
            table_match = db_match
        else:
            table_match = (
                entry.get('elementname', '').lower() in order_tables or
                entry.get('column_name', '').lower() in order_tables
            )

        if db_match and table_match:
            user_role = entry.get('userrolename', '').lower()
            for product in products:
                ad_groups = product.get("ad_group", [])
                if isinstance(ad_groups, str):
                    ad_groups = [ad_groups]
                ad_groups_lower = [ag.lower() for ag in ad_groups]
                if user_role in ad_groups_lower or (extracted_ad_group and extracted_ad_group in ad_groups_lower):
                    return True, product

    return False, None

