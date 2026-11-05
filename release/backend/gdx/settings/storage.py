import os

AWS_STORAGE_BUCKET_NAME = os.environ["AWS_STORAGE_BUCKET_NAME"]
AWS_S3_REGION_NAME = os.environ["AWS_REGION"]
AWS_S3_MEDIA_PREFIX = os.getenv("AWS_S3_MEDIA_PREFIX", "media").strip("/")
AWS_S3_DATA_PREFIX = os.getenv("AWS_S3_DATA_PREFIX", "data").strip("/")
AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = True
AWS_S3_FILE_OVERWRITE = False

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "bucket_name": AWS_STORAGE_BUCKET_NAME,
            "region_name": AWS_S3_REGION_NAME,
            "location": AWS_S3_MEDIA_PREFIX,
            "default_acl": None,
            "file_overwrite": False,
            "querystring_auth": True,
        },
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DATA_S3_BUCKET = AWS_STORAGE_BUCKET_NAME
DATA_S3_PREFIX = AWS_S3_DATA_PREFIX
