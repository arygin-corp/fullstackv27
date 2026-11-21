from django.conf import settings
from openai import AzureOpenAI
from .base import ChatProvider, EmbeddingProvider

def build_client():
    kwargs={"azure_endpoint":settings.AZURE_OPENAI_ENDPOINT,"api_version":settings.AZURE_OPENAI_API_VERSION}
    if settings.AZURE_OPENAI_USE_ENTRA_ID:
        from azure.identity import DefaultAzureCredential, get_bearer_token_provider
        kwargs["azure_ad_token_provider"]=get_bearer_token_provider(DefaultAzureCredential(),"https://cognitiveservices.azure.com/.default")
    else:
        kwargs["api_key"]=settings.AZURE_OPENAI_API_KEY
    return AzureOpenAI(**kwargs)
class AzureOpenAIChatProvider(ChatProvider):
    def __init__(self): self.client=build_client()
    def complete(self,messages):
        r=self.client.chat.completions.create(model=settings.AZURE_OPENAI_CHAT_DEPLOYMENT,messages=[{"role":m.role,"content":m.content} for m in messages],temperature=0.1)
        return r.choices[0].message.content or ""
    def stream(self,messages):
        r=self.client.chat.completions.create(model=settings.AZURE_OPENAI_CHAT_DEPLOYMENT,messages=[{"role":m.role,"content":m.content} for m in messages],temperature=0.1,stream=True)
        for event in r:
            token=event.choices[0].delta.content if event.choices else None
            if token: yield token
class AzureOpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self): self.client=build_client()
    def embed(self,text):
        vector=self.client.embeddings.create(model=settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,input=text).data[0].embedding
        if len(vector)!=settings.EMBEDDING_DIMENSIONS:
            raise ValueError(f"Embedding dimension {len(vector)} does not match EMBEDDING_DIMENSIONS={settings.EMBEDDING_DIMENSIONS}; update config and rebuild vectors")
        return vector
