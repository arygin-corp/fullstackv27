from contextlib import contextmanager
@contextmanager
def span(name, **attributes):
    try:
        from opentelemetry import trace
        tracer=trace.get_tracer("notification-app")
        with tracer.start_as_current_span(name) as current:
            for key,value in attributes.items():
                if value is not None: current.set_attribute(key,str(value))
            yield current
    except ImportError:
        yield None
