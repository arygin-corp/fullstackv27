#!/bin/sh
set -eu
: "${AWS_STORAGE_BUCKET_NAME:?AWS_STORAGE_BUCKET_NAME is required}"
: "${AWS_S3_MEDIA_PREFIX:=media}"
aws s3 sync ./media "s3://${AWS_STORAGE_BUCKET_NAME}/${AWS_S3_MEDIA_PREFIX}/"
