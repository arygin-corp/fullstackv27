class PerformanceValidator:
 @staticmethod
 def evaluate(results,thresholds):
    failures=[]
    for metric,limit in thresholds.items():
        value=results.get(metric)
        if value is None:failures.append({'metric':metric,'reason':'missing'})
        elif value>limit:failures.append({'metric':metric,'value':value,'limit':limit})
    return {'passed':not failures,'failures':failures}
