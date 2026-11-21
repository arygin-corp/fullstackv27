import os

AWS_STORAGE_BUCKET_NAME = os.environ["AWS_STORAGE_BUCKET_NAME"]
AWS_S3_REGION_NAME = os.environ["AWS_REGION"]
AWS_S3_DATA_PREFIX = os.getenv("AWS_S3_DATA_PREFIX", "data").strip("/")

# Media uploads use the local media folder from base settings.
DATA_S3_BUCKET = AWS_STORAGE_BUCKET_NAME
DATA_S3_PREFIX = AWS_S3_DATA_PREFIX
