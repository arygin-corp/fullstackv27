"""Canonical desktop-only DAR catalog. Mobile, AWS, Azure, platform Other, and obsolete IRM pricing are removed."""
YES_NO = ("Yes", "No")
PLATFORMS = (
 "API (EIG Application Support)",
 "Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.)",
 "Gateway Access Request (PowerBI, Tableau, Alteryx, etc)",
 "Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)",
 "My SQL", "Oracle (Non-Data Warehouse, MDW, TOMS, Customer Central, etc.)",
 "PostgreSQL", "SQL", "TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)",
)
API, DWH, GATEWAY, MAINFRAME, MYSQL, ORACLE, POSTGRES, SQL, TBDP = PLATFORMS
DOMAINS = (
 "Customer","Dealer Identity","Dealership","Digital Assets","Enterprise Corporate Applications",
 "Finance","Identity Access Management","Manufacturing","Manufacturing Parts","Product Quality",
 "Research and Development","Service History","Service Parts and Accessories","Telematics","Vehicles","Warranty",
)
USER_TYPES=("TMNA User","TMNA Affiliates","External User")
ACCESS_ACTORS=(
 "User Requested Access (Individual is directly accessing the data)",
 "Application Requested Access (Program/System is accessing the data; non-human actor)",
)
GENERIC_ENVIRONMENTS=("QA","Dev","Prod","All")
GENERAL_ACCESS=("read","modify","insert","update","delete","privileged","na")
WORK_TYPES=("Development","Analytics","Research","Extract","Other","All")
BI_TYPES=("Alteryx","Other","PowerBI","Tableau")
ORACLE_TYPES=("Customer Central DB","Other (Non-warehouse)","TOMS - (Toyota Order Management System)")
WAREHOUSES=("CDW - (Customer Data Warehouse)","FDM - (Finance Data Mart)","FDW - (Finance Data Warehouse)","MDW - (Manufacturing Data Warehouse)","NDW - (North America Parts Operations Data Warehouse)","Other")
BROAD_MAINFRAME_TYPES=("ChangeMan Approval Authority","CICS Access","DB2 Plan Access","DB2 Table Access","IMS Access","Mainframe Flat File Access","Mainframe Report Access","Mainframe Service Account","Mainframe TSO ID","MQ Access","TWS/OPC Scheduling Access","Other")
MFG_MAINFRAME_TYPES=("Mainframe TSO ID","Mainframe Service Account","IMS Access","Other")
CICS_ENVIRONMENTS=("CICSP - Production","CICST - TEST","CICSTA - TESTA","CICSTB - TESTB","CICSTC - TESTC","CICSTD - TESTD","CICSTE - TESTE","CICSTF - TESTF","CICSTG - TESTG","CICSTH - TESTH","CICSTJ - TESTJ","CICSTK - TESTK","All")
DB2_ENVIRONMENTS=("PDB2 - Production","TDB2 - TEST","DB2A - TESTA","DB2B - TESTB","DB2C - TESTC","DB2D - TESTD","DB2E - TESTE","DB2F - TESTF","DB2G - TESTG","DB2H - TESTH","DB2I - TESTI","DB2J - TESTJ","DB2K - TESTK","All")
IMS_ENVIRONMENTS=("IMSP - Production","IMST - TEST","IMSTA - TESTA","IMSTB - TESTB","IMSTC - TESTC","IMSTD - TESTD","IMSTE - TESTE","IMSTF - TESTF","IMSTG - TESTG","IMSTH - TESTH","IMSTJ - TESTJ","IMSTK - TESTK","All")
CONTROL_GROUPS={
"Customer":"676f978fdbd3081012b941a4059619d7","Dealer Identity":"c8a6b5441b591410950f113fad4bcbf7","Dealership":"50b63d441b591410950f113fad4bcbbb","Digital Assets":"35db35081b991410950f113fad4bcb8a","Enterprise Corporate Applications":"38fb3d081b991410950f113fad4bcb55","Finance":"b07f1b8fdbd3081012b941a405961982","Identity Access Management":"981c3d481b991410950f113fad4bcb68","Manufacturing":"55fed34fdbd3081012b941a4059619ec","Manufacturing Parts":"0d0c75481b991410950f113fad4bcb4c","Product Quality":"0cebf5081b991410950f113fad4bcb66","Research and Development":"b7ee934fdbd3081012b941a405961915","Service History":"22ebb9081b991410950f113fad4bcb75","Service Parts and Accessories":"5e1cfd481b991410950f113fad4bcba7","Telematics":"196f178fdbd3081012b941a405961911","Vehicles":"966f578fdbd3081012b941a405961984","Warranty":"3efbbd081b991410950f113fad4bcbf2"}
ORGANIZATIONS={**{x:"TMNA" for x in "AIR BJN BSL BTR CPT GTS MSO R&D SIA TAL TBC TCA TDP TCN TIN TKY TLS TMA TME TMM TMN TMP TMS TNA TTC TTX TWV TDM".split()},**{x:"TFS" for x in "TCC TIS TFB TFS TSM TPR".split()},"MTM":"MTMUS","WP":"Woven Planet","Toyota Connected":"Toyota Connected","TMC":"Toyota Motors Corporation","Servco Pacific Inc.":"Servco"}
ROUTE_IDS={API:"4",DWH:"1",GATEWAY:"14",MAINFRAME:"1",MYSQL:"10",ORACLE:"1",POSTGRES:"11",SQL:"9",TBDP:"5"}
DWH_GROUPS={"CDW - (Customer Data Warehouse)":"9442b1a70f92bd404758e388b1050eac","FDM - (Finance Data Mart)":"c642f1a70f92bd404758e388b1050ee8","FDW - (Finance Data Warehouse)":"4942f1a70f92bd404758e388b1050e19","MDW - (Manufacturing Data Warehouse)":"151268f737db2e4477a094c543990e95","NDW - (North America Parts Operations Data Warehouse)":"4942f1a70f92bd404758e388b1050e19","Other":"e0ce7292db9dc740ad1d7eb6bf961996"}
ORACLE_GROUPS={"TOMS - (Toyota Order Management System)":"3d42f1a70f92bd404758e388b1050ec2","Customer Central DB":"5542f1a70f92bd404758e388b1050e46","Other (Non-warehouse)":"5542f1a70f92bd404758e388b1050e46"}
MAINFRAME_GROUP_DEFAULT="4942f1a70f92bd404758e388b1050e2b"
MAINFRAME_ADD_GROUP="29a0b284db6b8bc4878bf7951d96192f"
CICS_GROUP="4542f1a70f92bd404758e388b1050e2c"
DB2_DOMAIN_GROUPS={
 **{d:"ca42f1a70f92bd404758e388b1050ee7" for d in ("Dealership","Dealer Identity","Digital Assets","Product Quality","Telematics","Vehicles")},
 "Finance":"8842b1a70f92bd404758e388b1050e95",
 **{d:"4942f1a70f92bd404758e388b1050e16" for d in ("Research and Development","Service Parts and Accessories")},
 **{d:"9042b1a70f92bd404758e388b1050ea7" for d in ("Customer","Identity Access Management","Service History","Warranty")},
}
IMS_GROUPS={d:MAINFRAME_GROUP_DEFAULT for d in DOMAINS}; IMS_GROUPS["Vehicles"]="c642f1a70f92bd404758e388b1050eeb"
SERVER_COMPUTED=("v_dar_objectid_createdby","companyName","v_dar_organization","v_custom_routing_rule_identifier","v_custom_control_group","v_custom_fulfillment_group_1","v_dar_dm_version")
