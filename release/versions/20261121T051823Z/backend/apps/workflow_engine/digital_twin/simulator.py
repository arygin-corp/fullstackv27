import random,statistics
class DigitalTwinSimulator:
 @staticmethod
 def run(scenario,seed=None):
  rng=random.Random(seed if seed is not None else 1);totals=[];costs=[]
  steps=scenario.service_times or {}
  for _ in range(scenario.iterations):
   total=0;cost=0
   for key,cfg in steps.items():
    low=float(cfg.get('min',1));high=float(cfg.get('max',low));duration=rng.uniform(low,high);total+=duration;cost+=duration*float((scenario.cost_rates or {}).get(key,0))
   totals.append(total);costs.append(cost)
  return {'iterations':scenario.iterations,'mean_duration':statistics.mean(totals) if totals else 0,'p95_duration':sorted(totals)[int(.95*(len(totals)-1))] if totals else 0,'mean_cost':statistics.mean(costs) if costs else 0}
