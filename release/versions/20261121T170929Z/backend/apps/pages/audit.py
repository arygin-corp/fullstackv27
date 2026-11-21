from django.core.exceptions import PermissionDenied
class ImmutableAuditMixin:
    def save(self,*args,**kwargs):
        if self.pk and type(self).objects.filter(pk=self.pk).exists(): raise PermissionDenied("Audit events are immutable.")
        return super().save(*args,**kwargs)
    def delete(self,*args,**kwargs): raise PermissionDenied("Audit events cannot be deleted.")
