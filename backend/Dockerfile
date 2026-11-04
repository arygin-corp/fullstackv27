FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PROMETHEUS_MULTIPROC_DIR=/tmp/prometheus_multiproc \
    DJANGO_SETTINGS_MODULE=gdx.settings.dev

ARG APP_VERSION
ARG APP_DISPLAY_VERSION
ARG GIT_SHA
ARG BUILD_TIMESTAMP

ENV APP_VERSION="${APP_VERSION}" \
    APP_DISPLAY_VERSION="${APP_DISPLAY_VERSION}" \
    GIT_SHA="${GIT_SHA}" \
    BUILD_TIMESTAMP="${BUILD_TIMESTAMP}"

LABEL org.opencontainers.image.title="EDMP GDXP Admin" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_TIMESTAMP}"

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./
RUN chmod +x /app/docker-entrypoint.sh /app/scripts/*.sh \
    && mkdir -p /tmp/prometheus_multiproc /app/assets

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/api/health/live/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["/app/scripts/web.sh"]

