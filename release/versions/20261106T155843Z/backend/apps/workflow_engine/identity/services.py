class IdentityResolver:
 @staticmethod
 def claims(user,tenant):
  external={}
  for item in user.externalidentity_set.filter(provider__tenant=tenant,provider__enabled=True):external.update(item.claims)
  return {'user_id':user.pk,'groups':list(user.groups.values_list('name',flat=True)),'external':external}
