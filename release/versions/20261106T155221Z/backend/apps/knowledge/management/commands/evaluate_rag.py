import json
import time
from pathlib import Path
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from knowledge.retrieval import retrieve_chunks

class Command(BaseCommand):
    help = "Evaluate retrieval against a reviewed JSON ground-truth dataset."
    def add_arguments(self, parser):
        parser.add_argument("--user", required=True, help="Username whose private knowledge base should be evaluated")
        parser.add_argument("--dataset", default=settings.RAG_EVALUATION_DATASET)
        parser.add_argument("--top-k", type=int, default=settings.RAG_TOP_K)
        parser.add_argument("--output", help="Optional JSON report path")
    def handle(self, *args, **options):
        try: user = get_user_model().objects.get(username=options["user"])
        except get_user_model().DoesNotExist as exc: raise CommandError("User not found") from exc
        path = Path(options["dataset"])
        if not path.exists(): raise CommandError(f"Dataset not found: {path}")
        cases = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(cases, list) or not cases: raise CommandError("Dataset must be a non-empty JSON array")
        rows=[]
        for case in cases:
            started=time.perf_counter(); results=retrieve_chunks(case["question"], user, options["top_k"]); latency=(time.perf_counter()-started)*1000
            expected_titles={str(x) for x in case.get("expected_document_titles",[])}
            expected_ids={int(x) for x in case.get("expected_document_ids",[])}
            expected_text=[str(x).lower() for x in case.get("expected_chunk_contains",[])]
            def relevant(item):
                return item.document_title in expected_titles or item.document_id in expected_ids or any(x in item.content.lower() for x in expected_text)
            ranks=[i for i,item in enumerate(results,1) if relevant(item)]
            expected_count=max(len(expected_titles)+len(expected_ids)+len(expected_text),1)
            rows.append({"question":case["question"],"hit":bool(ranks),"reciprocal_rank":1/ranks[0] if ranks else 0.0,"recall":min(len(ranks)/expected_count,1.0),"latency_ms":round(latency,2),"retrieved":[{"rank":i,"document_title":r.document_title,"chunk_id":r.chunk_id,"fusion_score":r.fusion_score,"rerank_score":r.rerank_score} for i,r in enumerate(results,1)]})
        n=len(rows); report={"cases":n,"top_k":options["top_k"],"hit_rate":sum(r["hit"] for r in rows)/n,"mrr":sum(r["reciprocal_rank"] for r in rows)/n,"mean_recall":sum(r["recall"] for r in rows)/n,"mean_latency_ms":sum(r["latency_ms"] for r in rows)/n,"results":rows}
        rendered=json.dumps(report,indent=2)
        if options.get("output"): Path(options["output"]).write_text(rendered,encoding="utf-8")
        self.stdout.write(rendered)
