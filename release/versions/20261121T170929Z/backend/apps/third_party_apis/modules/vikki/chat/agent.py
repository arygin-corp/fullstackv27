import json
import re
from django.conf import settings
from django.utils import timezone
from ai_providers.base import ChatMessage
from ai_providers.factory import get_chat_provider
from .agent_tools import TOOL_DESCRIPTIONS, ToolError, execute_tool
from .memory import memory_prompt_block
from .models import AgentRun, AgentStep

PLANNER_PROMPT="""Create a bounded read-only plan for the user's objective. Return only JSON with shape {"steps":[{"title":"...","tool":"approved tool name","arguments":{...}}]}. Use only the supplied tools. Never invent tools. Use the minimum steps needed. Do not include answer-generation as a tool step. Never request secrets. The maximum step count is {max_steps}. Available tools: {tools}"""
FINAL_PROMPT="""Answer the user's objective using only the supplied tool results. Cite document evidence using [Source N] labels exactly as supplied in the evidence. Clearly distinguish calculations from document evidence. If evidence is insufficient, say so. Do not invent tool results, sources, actions, or facts."""

def _json_object(text):
    try: value=json.loads(text)
    except json.JSONDecodeError:
        match=re.search(r"\{[\s\S]*\}",text)
        if not match: raise ValueError("Planner did not return JSON")
        value=json.loads(match.group(0))
    if not isinstance(value,dict): raise ValueError("Planner returned an invalid object")
    return value

def create_plan(objective,mode):
    raw=get_chat_provider().complete([ChatMessage("system",PLANNER_PROMPT.format(max_steps=settings.AGENT_MAX_STEPS,tools=json.dumps(TOOL_DESCRIPTIONS))),ChatMessage("user",f"Mode: {mode}\nObjective: {objective}")])
    data=_json_object(raw); steps=data.get("steps",[])
    if not isinstance(steps,list): raise ValueError("Plan steps must be an array")
    cleaned=[]
    for item in steps[:settings.AGENT_MAX_STEPS]:
        if not isinstance(item,dict): continue
        tool=str(item.get("tool","")).strip(); title=str(item.get("title",tool)).strip(); arguments=item.get("arguments",{})
        if tool not in TOOL_DESCRIPTIONS or not isinstance(arguments,dict): continue
        cleaned.append({"title":title[:255],"tool":tool,"arguments":arguments})
    if not cleaned:
        cleaned=[{"title":"Search relevant documents","tool":"document_search","arguments":{"query":objective,"limit":settings.AGENT_MAX_TOOL_RESULTS}}]
    return cleaned

def _evidence(steps):
    blocks=[]; citations=[]; source=0
    for step in steps:
        output=step.tool_output
        if step.tool_name=="document_search":
            for item in output.get("results",[]):
                source+=1
                blocks.append(f"[Source {source}] Document: {item['document_title']} | Chunk: {item['position']}\n{item['content']}")
                citations.append({"source_number":source,"document_id":item["document_id"],"document_title":item["document_title"],"chunk_id":item["chunk_id"],"chunk_position":item["position"]})
        else:
            blocks.append(f"Tool {step.tool_name} output:\n{json.dumps(output,ensure_ascii=False)}")
    return "\n\n".join(blocks)[:settings.AGENT_TOOL_RESULT_MAX_CHARS],citations

def run_agent(user,objective,mode="assistant",conversation=None):
    if not settings.AGENT_ENABLED: raise ValueError("Agent framework is disabled")
    if mode not in {x for x,_ in AgentRun.Mode.choices}: raise ValueError("Invalid agent mode")
    if mode==AgentRun.Mode.RESEARCH and not settings.AGENT_ALLOW_RESEARCH: raise ValueError("Research mode is disabled")
    run=AgentRun.objects.create(user=user,conversation=conversation,mode=mode,objective=objective,status=AgentRun.Status.PLANNING)
    try:
        plan=create_plan(objective,mode); run.plan=plan; run.status=AgentRun.Status.RUNNING; run.save(update_fields=["plan","status"])
        for position,item in enumerate(plan,1):
            step=AgentStep.objects.create(run=run,position=position,title=item["title"],tool_name=item["tool"],tool_input=item["arguments"],status=AgentStep.Status.RUNNING,started_at=timezone.now())
            try:
                result=execute_tool(item["tool"],user,item["arguments"]); step.tool_output=result; step.status=AgentStep.Status.COMPLETED
            except Exception as exc:
                step.error=str(exc)[:2000]; step.status=AgentStep.Status.FAILED
            step.completed_at=timezone.now(); step.save(update_fields=["tool_output","status","error","completed_at"])
        evidence,citations=_evidence(run.steps.filter(status=AgentStep.Status.COMPLETED))
        memory=memory_prompt_block(user)
        messages=[ChatMessage("system",FINAL_PROMPT)]
        if memory: messages.append(ChatMessage("system",memory))
        messages.append(ChatMessage("user",f"Objective:\n{objective}\n\nExecuted plan:\n{json.dumps(plan)}\n\nEvidence and tool results:\n{evidence or 'No successful tool results.'}"))
        answer=get_chat_provider().complete(messages).strip()
        run.final_answer=answer; run.citations=citations; run.status=AgentRun.Status.COMPLETED; run.completed_at=timezone.now(); run.save(update_fields=["final_answer","citations","status","completed_at"])
    except Exception as exc:
        run.status=AgentRun.Status.FAILED; run.error=str(exc)[:2000]; run.completed_at=timezone.now(); run.save(update_fields=["status","error","completed_at"])
    return run
