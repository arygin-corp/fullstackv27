from django.conf import settings
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    HnswAlgorithmConfiguration, SearchField, SearchFieldDataType,
    SearchIndex, SimpleField, VectorSearch, VectorSearchProfile,
)
from azure.search.documents.models import VectorizedQuery


def credential():
    if settings.AZURE_AI_SEARCH_USE_ENTRA_ID:
        from azure.identity import DefaultAzureCredential
        return DefaultAzureCredential()
    from azure.core.credentials import AzureKeyCredential
    return AzureKeyCredential(settings.AZURE_AI_SEARCH_API_KEY)


def index_client():
    return SearchIndexClient(settings.AZURE_AI_SEARCH_ENDPOINT, credential())


def search_client():
    return SearchClient(settings.AZURE_AI_SEARCH_ENDPOINT, settings.AZURE_AI_SEARCH_INDEX, credential())


def ensure_index():
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SimpleField(name="owner_id", type=SearchFieldDataType.String, filterable=True),
        SimpleField(name="document_id", type=SearchFieldDataType.String, filterable=True),
        SimpleField(name="document_title", type=SearchFieldDataType.String, filterable=True),
        SimpleField(name="position", type=SearchFieldDataType.Int32),
        SearchField(name="content", type=SearchFieldDataType.String, searchable=True),
        SearchField(name="embedding", type=SearchFieldDataType.Collection(SearchFieldDataType.Single), searchable=True, vector_search_dimensions=settings.EMBEDDING_DIMENSIONS, vector_search_profile_name="default-vector-profile"),
    ]
    vector_search = VectorSearch(
        algorithms=[HnswAlgorithmConfiguration(name="default-hnsw")],
        profiles=[VectorSearchProfile(name="default-vector-profile", algorithm_configuration_name="default-hnsw")],
    )
    return index_client().create_or_update_index(SearchIndex(name=settings.AZURE_AI_SEARCH_INDEX, fields=fields, vector_search=vector_search))


def upload_chunks(chunks):
    payload = [{"id": str(c.id), "owner_id": str(c.document.owner_id), "document_id": str(c.document_id), "document_title": c.document.title, "position": c.position, "content": c.content, "embedding": list(c.embedding)} for c in chunks]
    return search_client().upload_documents(payload) if payload else []


def delete_document_chunks(document_id):
    client = search_client()
    results = client.search(search_text="*", filter=f"document_id eq '{document_id}'", select=["id"])
    docs = [{"id": item["id"]} for item in results]
    if docs:
        client.delete_documents(docs)


def vector_search(question_vector, user_id, top_k):
    query = VectorizedQuery(vector=question_vector, k_nearest_neighbors=top_k, fields="embedding")
    return search_client().search(search_text=None, vector_queries=[query], filter=f"owner_id eq '{user_id}'", select=["id", "document_id", "document_title", "position", "content"], top=top_k)
