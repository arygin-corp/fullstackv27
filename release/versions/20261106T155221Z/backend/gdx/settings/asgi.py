import os

ASGI_APPLICATION = "gdx.asgi.application"

CHANNEL_REDIS_URL = os.getenv("CHANNEL_REDIS_URL", os.getenv("REDIS_URL", ""))

if CHANNEL_REDIS_URL:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [CHANNEL_REDIS_URL]},
        }
    }
