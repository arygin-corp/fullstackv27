from abc import ABC, abstractmethod
from collections.abc import Iterable, Iterator
from dataclasses import dataclass
@dataclass(frozen=True)
class ChatMessage:
    role: str
    content: str
class ChatProvider(ABC):
    @abstractmethod
    def complete(self, messages: list[ChatMessage]) -> str: ...
    def stream(self, messages: list[ChatMessage]) -> Iterator[str]:
        yield self.complete(messages)
class EmbeddingProvider(ABC):
    @abstractmethod
    def embed(self, text: str) -> list[float]: ...
    def embed_many(self, texts: Iterable[str]) -> list[list[float]]:
        return [self.embed(text) for text in texts]
