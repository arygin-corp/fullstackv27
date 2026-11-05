from contextvars import ContextVar
_current_request = ContextVar("changelog_current_request", default=None)

def set_request(request): return _current_request.set(request)
def reset_request(token): _current_request.reset(token)
def get_request(): return _current_request.get()
