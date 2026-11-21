from .catalog import *
class RoutingError(ValueError): pass

def resolve_routing(data, profile_company=None):
    p=data.get("v_dar_platform"); domain=data.get("v_dar_dataDomainSelect"); mf=data.get("v_dar_mainframe_access_type")
    if p not in ROUTE_IDS: raise RoutingError("No active route identifier for platform")
    if domain not in CONTROL_GROUPS: raise RoutingError("No control group for domain")
    company=profile_company or data.get("companyName")
    if company not in ORGANIZATIONS: raise RoutingError("Unknown company/organization mapping")
    fg=""
    if p==DWH: fg=DWH_GROUPS.get(data.get("v_dar_select_a_data_warehouse_mart"),"")
    elif p==ORACLE: fg=ORACLE_GROUPS.get(data.get("v_dar_select_an_oracle_access_type"),"")
    elif p==MAINFRAME:
        if mf=="CICS Access": fg=CICS_GROUP
        elif mf in ("DB2 Plan Access","DB2 Table Access","Other"): fg=DB2_DOMAIN_GROUPS.get(domain,"")
        elif mf=="IMS Access": fg=IMS_GROUPS.get(domain,"")
        elif mf in ("ChangeMan Approval Authority","Mainframe Flat File Access","Mainframe Report Access","MQ Access","TWS/OPC Scheduling Access"): fg=MAINFRAME_GROUP_DEFAULT
        elif mf=="Mainframe Service Account": fg=MAINFRAME_ADD_GROUP
        elif mf=="Mainframe TSO ID": fg=MAINFRAME_ADD_GROUP if data.get("v_dar_mfr_tso_id_add_delete")=="Add TSO ID" else MAINFRAME_GROUP_DEFAULT
    if p in (DWH,ORACLE,MAINFRAME) and not fg: raise RoutingError("No fulfillment group for active route")
    return {"route_identifier":ROUTE_IDS[p],"control_group":CONTROL_GROUPS[domain],"fulfillment_group":fg,"organization":ORGANIZATIONS[company]}
