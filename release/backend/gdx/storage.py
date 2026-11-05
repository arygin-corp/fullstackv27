from __future__ import annotations
import json
from dataclasses import dataclass
from io import BytesIO
from typing import Any, Iterable
import boto3
from botocore.exceptions import ClientError
from django.conf import settings

@dataclass(frozen=True)
class S3DataStore:
    bucket: str = settings.DATA_S3_BUCKET
    prefix: str = settings.DATA_S3_PREFIX

    def _key(self, path: str) -> str:
        clean = str(path).lstrip("/")
        return f"{self.prefix}/{clean}" if self.prefix else clean

    @property
    def client(self):
        return boto3.client("s3", region_name=settings.AWS_S3_REGION_NAME)

    def read_bytes(self, path: str) -> bytes:
        return self.client.get_object(Bucket=self.bucket, Key=self._key(path))["Body"].read()

    def read_text(self, path: str, encoding: str = "utf-8") -> str:
        return self.read_bytes(path).decode(encoding)

    def read_json(self, path: str) -> Any:
        return json.loads(self.read_text(path))

    def write_bytes(self, path: str, payload: bytes, content_type: str = "application/octet-stream") -> None:
        self.client.put_object(Bucket=self.bucket, Key=self._key(path), Body=payload, ContentType=content_type)

    def write_text(self, path: str, payload: str, content_type: str = "text/plain; charset=utf-8") -> None:
        self.write_bytes(path, payload.encode("utf-8"), content_type)

    def write_json(self, path: str, payload: Any) -> None:
        self.write_bytes(path, json.dumps(payload).encode("utf-8"), "application/json")

    def exists(self, path: str) -> bool:
        try:
            self.client.head_object(Bucket=self.bucket, Key=self._key(path))
            return True
        except ClientError as exc:
            if exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode") == 404:
                return False
            raise

    def list(self, prefix: str = "") -> list[str]:
        result=[]
        for page in self.client.get_paginator("list_objects_v2").paginate(Bucket=self.bucket, Prefix=self._key(prefix)):
            result.extend(obj["Key"] for obj in page.get("Contents", []))
        return result
