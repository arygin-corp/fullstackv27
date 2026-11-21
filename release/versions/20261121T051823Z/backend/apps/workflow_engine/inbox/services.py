from django.db.models import Q
class InboxService:
 @staticmethod
 def for_user(queryset,user,group_names=None):
  groups=group_names or list(user.groups.values_list('name',flat=True));return queryset.filter(Q(assigned_user=user)|Q(assigned_group__in=groups)).exclude(status__in=('completed','cancelled')).order_by('-priority','due_at')
