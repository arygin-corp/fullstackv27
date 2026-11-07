from operator import eq, ge, gt, le, lt, ne
OPS={'eq':eq,'ne':ne,'gt':gt,'gte':ge,'lt':lt,'lte':le,'in':lambda a,b:a in b,'contains':lambda a,b:b in a}
def resolve(data,path):
    value=data
    for part in path.split('.'):
        if not isinstance(value,dict) or part not in value: return None
        value=value[part]
    return value
def evaluate(expr,data):
    if not expr: return True
    if 'all' in expr: return all(evaluate(x,data) for x in expr['all'])
    if 'any' in expr: return any(evaluate(x,data) for x in expr['any'])
    if 'not' in expr: return not evaluate(expr['not'],data)
    op=expr.get('op'); left=resolve(data,expr.get('field','')); right=expr.get('value')
    if op not in OPS: return False
    try: return bool(OPS[op](left,right))
    except (TypeError,ValueError): return False
