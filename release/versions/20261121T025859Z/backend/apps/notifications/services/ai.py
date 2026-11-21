import json
from urllib.request import Request, urlopen
from django.conf import settings

class SummaryProviderError(RuntimeError): pass

class BaseSummaryProvider:
    name="base"
    model_name=""
    def summarize(self, payload): raise NotImplementedError

class DeterministicSummaryProvider(BaseSummaryProvider):
    name="deterministic"
    model_name="rules-v1"
    def summarize(self,payload):
        counts=payload["category_counts"]; unread=payload["unread_count"]; total=payload["input_count"]
        ordered=sorted(counts.items(),key=lambda x:(-x[1],x[0]))
        points=[f"{count} {category} notification{'s' if count != 1 else ''}" for category,count in ordered[:5]]
        actions=[f"Review {unread} unread notification{'s' if unread != 1 else ''}." ] if unread else []
        content=f"You received {total} notification{'s' if total != 1 else ''} in this period."
        if points: content += " " + "; ".join(points) + "."
        return {"content":content,"key_points":points,"action_items":actions}

class OpenAICompatibleSummaryProvider(BaseSummaryProvider):
    name="openai_compatible"
    def __init__(self): self.model_name=settings.AI_SUMMARY_MODEL
    def summarize(self,payload):
        if not settings.AI_SUMMARY_ENDPOINT or not settings.AI_SUMMARY_API_KEY: raise SummaryProviderError("AI provider is not configured")
        prompt={"instruction":"Summarize notification metadata. Return strict JSON with content, key_points, action_items. Do not invent facts.","data":payload}
        body=json.dumps({"model":self.model_name,"messages":[{"role":"system","content":"You summarize only supplied notification metadata. Do not infer missing facts."},{"role":"user","content":json.dumps(prompt)}],"temperature":0,"response_format":{"type":"json_object"}}).encode()
        req=Request(settings.AI_SUMMARY_ENDPOINT,data=body,headers={"Content-Type":"application/json","Authorization":f"Bearer {settings.AI_SUMMARY_API_KEY}"},method="POST")
        try:
            with urlopen(req,timeout=settings.AI_SUMMARY_TIMEOUT_SECONDS) as response: result=json.loads(response.read().decode())
            parsed=json.loads(result["choices"][0]["message"]["content"])
            return {"content":str(parsed.get("content",""))[:4000],"key_points":[str(x)[:500] for x in parsed.get("key_points",[])[:10]],"action_items":[str(x)[:500] for x in parsed.get("action_items",[])[:10]]}
        except Exception as exc: raise SummaryProviderError(str(exc)) from exc

def get_summary_provider():
    return OpenAICompatibleSummaryProvider() if settings.AI_SUMMARY_PROVIDER=="openai_compatible" else DeterministicSummaryProvider()
