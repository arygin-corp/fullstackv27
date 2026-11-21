from django.db import connection
from django.db.models import Q

SEARCH_FIELDS = ["version", "title", "desc"] + [f"post{x}" for x in "ABCDEFGHIJ"]


def search_posts(queryset, term):
    term = (term or "").strip()
    if not term:
        return queryset

    if connection.vendor == "postgresql":
        from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector

        vector = SearchVector("version", weight="A")
        vector += SearchVector("title", weight="A")
        vector += SearchVector("desc", weight="B")
        for field in [f"post{x}" for x in "ABCDEFGHIJ"]:
            vector += SearchVector(field, weight="C")
        query = SearchQuery(term, search_type="websearch")
        return (
            queryset.annotate(search_rank=SearchRank(vector, query))
            .filter(search_rank__gte=0.05)
            .order_by("-search_rank", "-release_date", "-id")
        )

    condition = Q()
    for field in SEARCH_FIELDS:
        condition |= Q(**{f"{field}__icontains": term})
    return queryset.filter(condition).distinct()
