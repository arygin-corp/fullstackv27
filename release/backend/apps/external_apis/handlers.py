from .graph_services import next_users, search_users  
from .domain_services import add_to_cart, axon_search, extract_axon, metadata_views, request_details, request_ids, submit_cart, tdsp_pods, upload_attachment

def _tdsp(request, **kwargs): return tdsp_pods(request)
def _metadata(request, **kwargs): return metadata_views(request, request.query_params.get("userrolename"))
def _axon_facet(request, **kwargs): return extract_axon(axon_search(request, request.query_params.get("id")), 8)
def _axon_glossary(request, **kwargs): return extract_axon(axon_search(request, request.query_params.get("id")), 2)
def _request_lookup(request, **kwargs):
    ids = request_ids(request, request.query_params)
    return request_details(request, ids) if ids else []
def _add_to_cart(request, **kwargs): return add_to_cart(request, request.data)
def _submit_cart(request, **kwargs): return {"result": submit_cart(request, request.data)}
def _attachment(request, **kwargs): return upload_attachment(request, request.data.get("table_name"), request.data.get("table_sys_id"), request.FILES.get("file"))
def _graph_users(request, **kwargs): return search_users(request, request.query_params)  
def _graph_users_next(request, **kwargs):  
    link = request.query_params.get("nextLink")  
    if not link: raise ValueError("nextLink is required")  
    return next_users(request, link)  
PLATFORM_HANDLERS = {"tdsp-pods": _tdsp, "denodo-metadata-views": _metadata, "axon-facet-search": _axon_facet, "axon-glossary": _axon_glossary, "servicenow-request-lookup": _request_lookup, "servicenow-add-to-cart": _add_to_cart, "servicenow-submit-cart": _submit_cart, "servicenow-attachment-upload": _attachment, "graph-users": _graph_users, "graph-users-next": _graph_users_next}
