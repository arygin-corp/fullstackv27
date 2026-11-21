<h1 align="center">
    <img src="static/images/gdx/gdx-logo-light.svg" alt="GDX Admin Portal" width="100%px" height="75" title="GDX Admin Portal"/>
</h1>

<p align="center">
  <img src="static/images/readme/login%403x.png" width="800" style="border-radius: 12px;"/>
</p>

<p align="center">Built With <br>
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=fff" width="88">
<img src="https://img.shields.io/badge/HTML-%23E34F26?style=for-the-badge&logo=html5&logoColor=white" width="72">
<img src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white" width="112">
<img src="https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white" width="86">
<img src="https://img.shields.io/badge/AWS-%23FF9900?style=for-the-badge&logo=amazon-web-services&logoColor=white" width="65">
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=fff" width="86">
<img src="https://img.shields.io/badge/Postgres-%23316192?style=for-the-badge&logo=postgresql&logoColor=white" width="100">
</p>
<p align="center">These are the essential commands to build the Global Data Marketplace Application.</p>

<h3>Installation Commands</h3>
<p>pip install -r requirements.txt</p>
<p>python3 manage.py migrate</p>
<p>python3 manage.py createsuperuser</p>
<p>Create Superuser Username</p>
<p>Create Superuser Email</p>
<p>Create Superuser Password</p>
<p>Re-enter Superuser Username</p>
<p>python3 manage.py runserver</p>



<p>python3 manage.py migrate --run-syncdb</p>

<h3>Run this DB query after all of the CSV files has been imported</h3>
<p>
BEGIN;
SELECT setval(pg_get_serial_sequence('"changelog_categorie"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"changelog_post"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_accesstype"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_datawarehouse"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_domain"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_environment"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_gateway"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_oracle"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_platform"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_requester"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_sensitivepi"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_term"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_usertype"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_vendor"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"dar_worktype"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"forms_feature"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"forms_feedback"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"forms_productintake"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_attribute"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_badge"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_classification"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_companie"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_contact"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_dataacesstype"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_datatype"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_domain"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_environment"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_keyword"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_onetsdomain"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_organization"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_platform"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_platformbranding"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_platformtype"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_product"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_sampledatadef"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_subdomain"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"marketplace_subdomain_domains"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"orders_request"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"orders_task"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"pages_changelog"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"pages_disclaimer"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"pages_leadership"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"pages_term"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
SELECT setval(pg_get_serial_sequence('"profile_profile"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "auth_permission";
COMMIT;
</p>