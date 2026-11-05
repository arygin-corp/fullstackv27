#!/bin/sh
set -eu
: "${AWS_STORAGE_BUCKET_NAME:?AWS_STORAGE_BUCKET_NAME is required}"
: "${AWS_S3_DATA_PREFIX:=data}"
aws s3 sync ./data "s3://${AWS_STORAGE_BUCKET_NAME}/${AWS_S3_DATA_PREFIX}/" --delete
