from dataclasses import dataclass
@dataclass(frozen=True)
class ReadinessCheck:
    category:str;name:str;status:str;message:str;remediation:str=""
def overall_status(checks):
    states={x.status for x in checks}
    if "failed" in states:return "not_ready"
    if "warning" in states:return "ready_with_warnings"
    return "ready" if checks else "incomplete"
