<h1 align="center">
    <img src="static/images/gdx/gdx-logo-light.svg" alt="GDX Admin Portal" width="100%px" height="75" title="GDX Admin Portal"/>
</h1>

<p align="center">🍳 <strong>Development Recipes</strong></p>

### 🧪 Resetting Sequence IDs (Postgres)
If you import data manually (CSV), run this within the Django shell:
```python
# python manage.py shell
from django.core.management.color import no_style
from django.db import connection
from apps.marketplace.models import Product

sequence_sql = connection.ops.sequence_reset_sql(no_style(), [Product])
with connection.cursor() as cursor:
    for sql in sequence_sql:
        cursor.execute(sql)