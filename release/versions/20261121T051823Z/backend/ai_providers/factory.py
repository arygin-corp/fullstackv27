from django.conf import settings
from .ollama import OllamaChatProvider, OllamaEmbeddingProvider

def get_chat_provider():
    if settings.AI_CHAT_PROVIDER == "ollama": return OllamaChatProvider()
    if settings.AI_CHAT_PROVIDER == "azure_openai":
        from .azure_openai import AzureOpenAIChatProvider
        return AzureOpenAIChatProvider()
    raise ValueError(f"Unsupported AI_CHAT_PROVIDER: {settings.AI_CHAT_PROVIDER}")
def get_embedding_provider():
    if settings.AI_EMBEDDING_PROVIDER == "ollama": return OllamaEmbeddingProvider()
    if settings.AI_EMBEDDING_PROVIDER == "azure_openai":
        from .azure_openai import AzureOpenAIEmbeddingProvider
        return AzureOpenAIEmbeddingProvider()
    raise ValueError(f"Unsupported AI_EMBEDDING_PROVIDER: {settings.AI_EMBEDDING_PROVIDER}")
