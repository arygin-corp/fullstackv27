from dataclasses import dataclass, field
from typing import Any
from .catalog import *

@dataclass
class State:
    visible:set[str]=field(default_factory=set)
    required:set[str]=field(default_factory=set)
    clear:set[str]=field(default_factory=set)
    option_sets:dict[str,tuple]=field(default_factory=dict)

def evaluate(data:dict[str,Any])->State:
    d=dict(data); s=State()
    base={"requesting_id","v_dar_objectid_reqfor","v_dar_platform","v_dar_dataDomainSelect","v_dar_userType","v_dar_accessType","v_dar_DataReqDescription","v_dar_businessJustification","v_dar_pi","v_dar_spi","chk_dar_terms_message"}
    s.visible|=base; s.required|=base
    platform=d.get("v_dar_platform"); domain=d.get("v_dar_dataDomainSelect"); mf=d.get("v_dar_mainframe_access_type")
    if d.get("requesting_id")=="User": s.visible.add("people_picker")
    common={"v_dar_environment","v_dat_data_access_type"}
    if platform in (API,DWH,GATEWAY,MYSQL,ORACLE,POSTGRES,SQL,TBDP): s.visible|=common; s.required|=common; s.option_sets["v_dar_environment"]=GENERIC_ENVIRONMENTS
    if platform==API: s.visible.add("v_dat_api_name"); s.required.add("v_dat_api_name")
    if platform in (MYSQL,POSTGRES,SQL,TBDP):
        f={"v_dar_post_database_schema","v_dar_post_table_names"}; s.visible|=f; s.required|=f
    if platform==DWH: s.visible.add("v_dar_select_a_data_warehouse_mart"); s.required.add("v_dar_select_a_data_warehouse_mart")
    if platform==GATEWAY:
        f={"v_dar_bi_data_access_type","v_dar_gateway_database_schema"}; s.visible|=f; s.required|=f
        if d.get("v_dar_bi_data_access_type")=="Other": s.visible.add("v_dar_gateway_if_other"); s.required.add("v_dar_gateway_if_other")
    if platform==ORACLE:
        s.visible.add("v_dar_select_an_oracle_access_type"); s.required.add("v_dar_select_an_oracle_access_type")
        if d.get("v_dar_select_an_oracle_access_type")=="Other (Non-warehouse)": s.visible.add("v_dar_oracle_other"); s.required.add("v_dar_oracle_other")
    if d.get("v_dar_pi")=="Yes" or d.get("v_dar_spi")=="Yes":
        f={"edm_PI_personal_details","v_edm_type_of_work","v_edm_3rd_party_vendor"}; s.visible|=f; s.required|=f
        if d.get("edm_PI_personal_details")=="Yes": s.visible.add("v_emd_specify_PII_needs"); s.required.add("v_emd_specify_PII_needs")
    else: s.clear|={"edm_PI_personal_details","v_edm_type_of_work","v_edm_3rd_party_vendor","v_emd_specify_PII_needs"}
    if d.get("edm_PI_personal_details")=="No": s.clear.add("v_emd_specify_PII_needs")
    if platform==MAINFRAME:
        s.visible.add("v_dar_mainframe_access_type"); s.required.add("v_dar_mainframe_access_type")
        if domain in ("Manufacturing","Manufacturing Parts"):
            s.visible|={"v_dar_mf_what_system","v_dar_mf_what_location"}; s.required.add("v_dar_mf_what_system")
            if d.get("v_dar_mf_what_system")=="Other": s.visible.add("v_dar_other_mf"); s.required.add("v_dar_other_mf")
            if d.get("v_dar_mf_what_location")=="Other": s.visible.add("v_dar_mf_loc_if_other"); s.required.add("v_dar_mf_loc_if_other")
        _mainframe(s,d,mf)
    return s

def _req(s,*keys): s.visible.update(keys); s.required.update(keys)
def _show(s,*keys): s.visible.update(keys)
def _mainframe(s,d,mf):
    if mf=="Other": _req(s,"v_dar_mfr_other")
    elif mf=="ChangeMan Approval Authority":
        _req(s,"v_dar_changeman_add_delete")
        if d.get("v_dar_changeman_add_delete") in ("Add ChangeMan Approval Authority","Remove ChangeMan Approval Authority"):
            _req(s,"v_dar_mainframe_change_tso_id","v_dar_mainframe_changeman_application","v_dare_mainframe_change_authorizers_vertical_horizontal")
    elif mf=="CICS Access":
        _req(s,"v_dar_cics_add_delete","v_dar_environment","v_dat_data_access_type"); s.option_sets["v_dar_environment"]=CICS_ENVIRONMENTS
        if d.get("v_dar_cics_add_delete") in ("Add CICS Access","Remove CICS Access"): _req(s,"v_dar_mf_tso_id_removed","v_dar_mf_transaction")
    elif mf=="DB2 Plan Access":
        _req(s,"v_dar_environment","v_dar_mf_db2_plan_tso_id_or_job_name","v_dar_mf_db2_plan_plan_name"); _show(s,"b_dar_mf_db2_plan_grant","b_dar_mf_db2_plan_revoke","b_dar_mf_db2_plan_bind","b_dar_mf_db2_plan_execute"); s.option_sets["v_dar_environment"]=DB2_ENVIRONMENTS
    elif mf=="DB2 Table Access":
        _req(s,"v_dar_environment","v_dar_mf_db2_tso_or_job_name","v_dar_mf_db2_table_name_s"); _show(s,"b_dar_mf_db2_grant","b_dar_mf_db2_revoke","b_dar_mf_db2_select","b_dar_mf_db2_update","b_dar_mf_db2_insert","b_dar_mf_db2_delete"); s.option_sets["v_dar_environment"]=DB2_ENVIRONMENTS
    elif mf=="IMS Access":
        _req(s,"v_dar_mnfr_ims_options_select"); _show(s,"v_dar_mf_ims_ims_id","v_dar_mf_ims_tmna_region_area_code_for_adds","v_dar_mf_ims_transaction_group","v_dar_mnfr_transaction_id","v_dar_mnfr_ims_transaction_group","v_dar_mfrn_ims_transaction_group_description"); s.option_sets["v_dar_environment"]=IMS_ENVIRONMENTS
    elif mf=="Mainframe Flat File Access": _req(s,"v_dar_mfr_dataset_file_access_add_delete","v_dar_mainframe_file_set_name","v_dar_mainframe_file_tso_id","v_dat_data_access_type_flat")
    elif mf=="Mainframe Service Account":
        _req(s,"v_dar_mfr_service_account_add_delete","v_dar_mainframe_service_id_to_be_added")
        if d.get("v_dar_mfr_service_account_add_delete")=="Add New Service Account": _show(s,"v_dar_service_account_to_model"); _req(s,"v_dar_service_account_desc","v_dar_service_account_owner","v_dar_service_account_default_racf_grp")
    elif mf=="Mainframe TSO ID":
        _req(s,"v_dar_mfr_tso_id_add_delete")
        if d.get("v_dar_mfr_tso_id_add_delete")=="Remove TSO ID": _req(s,"v_dar_mfr_tso_id")
        elif d.get("v_dar_mfr_tso_id_add_delete")=="Add TSO ID": _show(s,"v_dar_service_account_to_model");
        if d.get("v_dar_mfr_tso_id_add_delete")=="Add TSO ID" and d.get("v_dar_dataDomainSelect") not in ("Manufacturing","Manufacturing Parts"): _req(s,"v_dar_mainframe_service_project_area")
    elif mf=="Mainframe Report Access": _req(s,"v_dar_mf_rep_grant_or_revoke"); _show(s,"v_dar_mf_report_id_s_being_requested","v_dar_mf_rep_list_tso_id_or_project_area_group")
    elif mf=="MQ Access": _req(s,"v_dar_mf_tso_id_removed","v_dar_mf_mq_explorer","v_dar_mf_queue_manager","v_dar_mf_message_queue","v_dat_data_access_type")
    elif mf=="TWS/OPC Scheduling Access": _req(s,"v_dar_tws_opc_scheduling_add_remove"); _show(s,"v_dar_mainframe_TWS_tso_id","v_dar_mainframe_TWS_access_group")
