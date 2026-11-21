from datetime import datetime,timedelta
from django.utils import timezone

def add_business_hours(start,hours,calendar):
    current=timezone.localtime(start); remaining=float(hours)
    holidays=set(calendar.holidays.values_list('date',flat=True))
    while remaining>0:
        current+=timedelta(minutes=30)
        local=current.astimezone(timezone.get_fixed_timezone(0)) if not timezone.is_aware(current) else current
        if local.weekday() in calendar.working_days and local.date() not in holidays and calendar.workday_start<=local.time().replace(tzinfo=None)<=calendar.workday_end:
            remaining-=0.5
    return current
