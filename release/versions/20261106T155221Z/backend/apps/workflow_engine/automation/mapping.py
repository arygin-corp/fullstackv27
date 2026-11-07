def resolve(data,path,default=None):
    value=data
    for part in path.split('.'):
        if not isinstance(value,dict) or part not in value:return default
        value=value[part]
    return value
def map_payload(mapping,source):
    result={}
    for target,spec in mapping.items():
        if isinstance(spec,dict) and '$path' in spec:result[target]=resolve(source,spec['$path'],spec.get('default'))
        else:result[target]=spec
    return result
