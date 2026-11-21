import logging
import os
_configured = False
logger = logging.getLogger(__name__)

def configure_telemetry():
    global _configured
    if _configured or os.getenv("OTEL_ENABLED", "false").lower() != "true": return False
    try:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.django import DjangoInstrumentor
        from opentelemetry.instrumentation.celery import CeleryInstrumentor
        from opentelemetry.instrumentation.redis import RedisInstrumentor
        from opentelemetry.instrumentation.psycopg import PsycopgInstrumentor
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        resource=Resource.create({"service.name":os.getenv("OTEL_SERVICE_NAME","notification-app"),"service.version":os.getenv("OTEL_SERVICE_VERSION","phase6"),"deployment.environment":os.getenv("APP_ENV","local")})
        provider=TracerProvider(resource=resource)
        provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT","http://otel-collector:4317"),insecure=os.getenv("OTEL_EXPORTER_OTLP_INSECURE","true").lower()=="true")))
        trace.set_tracer_provider(provider)
        DjangoInstrumentor().instrument()
        CeleryInstrumentor().instrument()
        RedisInstrumentor().instrument()
        try: PsycopgInstrumentor().instrument()
        except Exception: logger.info("psycopg instrumentation unavailable")
        _configured=True; return True
    except ImportError:
        logger.warning("OpenTelemetry is enabled but dependencies are not installed")
        return False
