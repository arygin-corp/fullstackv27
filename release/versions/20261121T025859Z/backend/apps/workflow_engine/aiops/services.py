import statistics
class AnomalyDetector:
 @staticmethod
 def zscore(values,current,threshold=3):
  if len(values)<2:return {'anomaly':False,'score':0}
  mean=statistics.mean(values);stdev=statistics.stdev(values)
  score=0 if stdev==0 else abs((current-mean)/stdev);return {'anomaly':score>=threshold,'score':score,'mean':mean,'stdev':stdev}
