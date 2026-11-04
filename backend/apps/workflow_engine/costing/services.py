from decimal import Decimal
from django.db.models import Sum
from .models import InstanceCostSummary
class CostingService:
 @staticmethod
 def summarize(instance):
  total=instance.cost_events.aggregate(v=Sum('amount'))['v'] or Decimal('0');obj,_=InstanceCostSummary.objects.update_or_create(instance=instance,defaults={'total':total});return obj
