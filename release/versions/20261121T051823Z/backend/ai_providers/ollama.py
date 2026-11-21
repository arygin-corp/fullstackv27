import json
import httpx
from django.conf import settings
from .base import ChatMessage, ChatProvider, EmbeddingProvider
class OllamaChatProvider(ChatProvider):
    def _payload(self, messages, stream):
        return {"model":settings.OLLAMA_CHAT_MODEL,"messages":[{"role":m.role,"content":m.content} for m in messages],"stream":stream,"options":{"temperature":0.1}}
    def complete(self, messages):
        response=httpx.post(f"{settings.OLLAMA_BASE_URL}/api/chat",json=self._payload(messages,False),timeout=180)
        response.raise_for_status()
        return response.json()["message"]["content"]
    def stream(self, messages):
        with httpx.stream("POST",f"{settings.OLLAMA_BASE_URL}/api/chat",json=self._payload(messages,True),timeout=180) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if not line: continue
                item=json.loads(line)
                token=item.get("message",{}).get("content","")
                if token: yield token
                if item.get("done"): break
class OllamaEmbeddingProvider(EmbeddingProvider):
    def embed(self, text):
        response=httpx.post(f"{settings.OLLAMA_BASE_URL}/api/embed",json={"model":settings.OLLAMA_EMBEDDING_MODEL,"input":text},timeout=180)
        response.raise_for_status()
        vector=response.json()["embeddings"][0]
        if len(vector)!=settings.EMBEDDING_DIMENSIONS:
            raise ValueError(f"Embedding dimension {len(vector)} does not match EMBEDDING_DIMENSIONS={settings.EMBEDDING_DIMENSIONS}")
        return vector
