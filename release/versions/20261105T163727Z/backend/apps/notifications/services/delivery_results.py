from dataclasses import dataclass
from enum import Enum
class DeliveryOutcome(str, Enum):
    DELIVERED="delivered"; SUPPRESSED="suppressed"; PERMANENT_FAILURE="permanent_failure"; RETRYABLE_FAILURE="retryable_failure"
@dataclass(frozen=True)
class DeliveryResult:
    outcome: DeliveryOutcome
    code: str = ""
    summary: str = ""
    @property
    def is_terminal(self): return self.outcome in {DeliveryOutcome.DELIVERED,DeliveryOutcome.SUPPRESSED,DeliveryOutcome.PERMANENT_FAILURE}
    @property
    def should_retry(self): return self.outcome == DeliveryOutcome.RETRYABLE_FAILURE
class RetryableDeliveryError(ConnectionError): pass
class PermanentDeliveryError(RuntimeError): pass
