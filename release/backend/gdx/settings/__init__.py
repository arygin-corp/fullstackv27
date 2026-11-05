import os
from .base import *

env_name = os.environ.get("DJANGO_ENV", "local").lower()

if env_name == "local":
    from .local import *
elif env_name == "dev":
    from .dev import *
elif env_name == "demo":
    from .demo import *
elif env_name == "qa":
    from .qa import *
elif env_name == "stage":
    from .stage import *
elif env_name == "prod":
    from .prod import *
else:
    raise ValueError(f"Unsupported DJANGO_ENV: {env_name}")