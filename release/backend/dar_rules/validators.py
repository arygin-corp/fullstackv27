from dataclasses import dataclass
from typing import Any, Callable
from .catalog import *
from .engine import evaluate
from .routing import resolve_routing, RoutingError
@dataclass(frozen=True)
class Error: field:str; code:str; message:str

def empty(v): return v is None or v is False or v==[] or v=={} or (isinstance(v,str) and not v.strip())
def one_of(field,value,allowed): return [] if value in allowed else [Error(field,"invalid_choice",f"Choose one of: {', '.join(allowed)}")]
def required(field,value): return [Error(field,"required","This field is required.")] if empty(value) else []
def min_length(field,value,n=10): return [Error(field,"min_length",f"Enter at least {n} characters.")] if not isinstance(value,str) or len(value.strip())<n else []
def exactly_one(data,keys,field): return [] if sum(bool(data.get(k)) for k in keys)==1 else [Error(field,"exactly_one","Select exactly one option.")]
def at_least_one(data,keys,field): return [] if any(bool(data.get(k)) for k in keys) else [Error(field,"at_least_one","Select at least one option.")]

def validate_submission(data:dict[str,Any], *, profile_company=None, directory_user_exists:Callable[[str],bool]=lambda _:True, db_exists:Callable[[str],bool]=lambda _:True, table_exists:Callable[[str,str],bool]=lambda _d,_t:True):
    d=dict(data); state=evaluate(d); errors=[]
    for f in sorted(state.required): errors += required(f,d.get(f))
    enums={"requesting_id":("Me","User"),"v_dar_platform":PLATFORMS,"v_dar_dataDomainSelect":DOMAINS,"v_dar_userType":USER_TYPES,"v_dar_accessType":ACCESS_ACTORS,"v_dar_pi":YES_NO,"v_dar_spi":YES_NO}
    for f,a in enums.items(): errors += one_of(f,d.get(f),a)
    for f in ("v_dar_DataReqDescription","v_dar_businessJustification"):
        if not empty(d.get(f)): errors += min_length(f,d.get(f),10)
    if "v_emd_specify_PII_needs" in state.required and not empty(d.get("v_emd_specify_PII_needs")): errors += min_length("v_emd_specify_PII_needs",d.get("v_emd_specify_PII_needs"),10)
    if (d.get("v_dar_pi")=="Yes" or d.get("v_dar_spi")=="Yes"):
        errors += one_of("edm_PI_personal_details",d.get("edm_PI_personal_details"),YES_NO)
        errors += one_of("v_edm_type_of_work",d.get("v_edm_type_of_work"),WORK_TYPES)
        errors += one_of("v_edm_3rd_party_vendor",d.get("v_edm_3rd_party_vendor"),YES_NO)
    if d.get("chk_dar_terms_message") is not True: errors.append(Error("chk_dar_terms_message","required_true","Terms must be accepted."))
    if d.get("requesting_id")=="User" and not empty(d.get("v_dar_objectid_reqfor")) and not directory_user_exists(d["v_dar_objectid_reqfor"]): errors.append(Error("v_dar_objectid_reqfor","lookup_exists","Select an active directory user."))
    p=d.get("v_dar_platform"); mf=d.get("v_dar_mainframe_access_type")
    if "v_dar_environment" in state.required: errors += one_of("v_dar_environment",d.get("v_dar_environment"),state.option_sets.get("v_dar_environment",GENERIC_ENVIRONMENTS))
    if "v_dat_data_access_type" in state.required: errors += one_of("v_dat_data_access_type",d.get("v_dat_data_access_type"),GENERAL_ACCESS)
    if p==GATEWAY: errors += one_of("v_dar_bi_data_access_type",d.get("v_dar_bi_data_access_type"),BI_TYPES)
    if p==ORACLE: errors += one_of("v_dar_select_an_oracle_access_type",d.get("v_dar_select_an_oracle_access_type"),ORACLE_TYPES)
    if p==DWH: errors += one_of("v_dar_select_a_data_warehouse_mart",d.get("v_dar_select_a_data_warehouse_mart"),WAREHOUSES)
    if p==TBDP and d.get("v_dar_environment") in ("Prod","All"):
        db=d.get("v_dar_post_database_schema"); tables=d.get("v_dar_post_table_names")
        if db and not db_exists(db): errors.append(Error("v_dar_post_database_schema","lookup_exists","Select a valid database."))
        if not isinstance(tables,list): errors.append(Error("v_dar_post_table_names","type","Expected a list of tables."))
        else:
            if len(tables)>50: errors.append(Error("v_dar_post_table_names","max_items","Select no more than 50 tables."))
            if len(tables)!=len(set(tables)): errors.append(Error("v_dar_post_table_names","unique_items","Duplicate tables are not allowed."))
            for t in tables:
                if db and not table_exists(db,t): errors.append(Error("v_dar_post_table_names","lookup_exists",f"Table {t} is not valid for {db}."))
    if mf=="DB2 Plan Access":
        errors += exactly_one(d,("b_dar_mf_db2_plan_grant","b_dar_mf_db2_plan_revoke"),"db2_plan_operation")
        errors += at_least_one(d,("b_dar_mf_db2_plan_bind","b_dar_mf_db2_plan_execute"),"db2_plan_privileges")
    if mf=="DB2 Table Access":
        errors += exactly_one(d,("b_dar_mf_db2_grant","b_dar_mf_db2_revoke"),"db2_table_operation")
        errors += at_least_one(d,("b_dar_mf_db2_select","b_dar_mf_db2_update","b_dar_mf_db2_insert","b_dar_mf_db2_delete"),"db2_table_privileges")
    if mf=="Mainframe Flat File Access": errors += one_of("v_dat_data_access_type_flat",d.get("v_dat_data_access_type_flat"),("Read","Write","Create/Delete"))
    if "v_dare_mainframe_change_authorizers_vertical_horizontal" in state.required: errors += one_of("v_dare_mainframe_change_authorizers_vertical_horizontal",d.get("v_dare_mainframe_change_authorizers_vertical_horizontal"),("Manager","DBA","Other"))
    try: routing=resolve_routing(d,profile_company=profile_company)
    except RoutingError as e: errors.append(Error("routing","unresolved",str(e))); routing=None
    cleaned={k:v for k,v in d.items() if k in state.visible and k not in state.clear and k not in SERVER_COMPUTED}
    return errors, cleaned, routing
