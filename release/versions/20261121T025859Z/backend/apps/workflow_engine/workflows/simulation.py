from ..conditions import evaluate
def simulate(workflow,context=None,max_depth=50):
    initial=workflow.states.get(is_initial=True); paths=[]
    def walk(state,path,depth):
        if depth>max_depth: paths.append({'path':path,'result':'depth_limit'}); return
        if state.is_terminal: paths.append({'path':path,'result':'terminal'}); return
        transitions=[t for t in state.outgoing_transitions.filter(is_active=True) if evaluate(t.condition,{'context':context or {},'payload':{}})]
        if not transitions: paths.append({'path':path,'result':'dead_end'})
        for t in transitions:
            marker=(state.key,t.key,t.target.key)
            if marker in path: paths.append({'path':path+[marker],'result':'loop'}); continue
            walk(t.target,path+[marker],depth+1)
    walk(initial,[],0); return paths
