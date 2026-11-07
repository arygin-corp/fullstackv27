import random,statistics
class EnterpriseTwinSimulator:
 @staticmethod
 def run(scenario,seed=1):
  rng=random.Random(seed);base=float(scenario.assumptions.get('base_throughput',100));staff=float(scenario.assumptions.get('staffing_factor',1));budget=float(scenario.assumptions.get('budget_factor',1));values=[base*staff*budget*rng.uniform(.9,1.1) for _ in range(1000)];return {'mean_throughput':statistics.mean(values),'p10_throughput':sorted(values)[99],'p90_throughput':sorted(values)[899]}
