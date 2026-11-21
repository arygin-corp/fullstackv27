import requests
from django.conf import settings
from .exceptions import OneTSAddError, OneTSSubmitError

class OneTSClient:
    def __init__(self, session=None):
        self.session = session or requests.Session(); self._owns_session = session is None
        self.add_url = settings.ONETS_ADD_TO_CART_URL; self.submit_url = settings.ONETS_SUBMIT_CART_URL
        self.timeout = getattr(settings, "ONETS_TIMEOUT_SECONDS", 30)
        self.session.auth = (settings.ONETS_USERNAME, settings.ONETS_PASSWORD)
        self.session.headers.update({"Accept":"application/json","Content-Type":"application/json"})
    def __enter__(self): return self
    def __exit__(self, *_):
        if self._owns_session: self.session.close()
    def add_to_cart(self, variables, quantity=1):
        response = self.session.post(self.add_url, json={"sysparm_quantity":[str(quantity)], "variables":variables}, timeout=self.timeout)
        if not response.ok: raise OneTSAddError("1TS add-to-cart failed.")
        data = response.json(); return {"cart_item_identifier": str(data.get("cart_item_id") or data.get("sys_id") or ""), "response": data}
    def submit_cart(self):
        response = self.session.post(self.submit_url, json={}, timeout=self.timeout)
        if not response.ok: raise OneTSSubmitError("1TS submit-cart failed.")
        data = response.json()
        request_number = data.get("request_number") or data.get("number")
        if not request_number: raise OneTSSubmitError("1TS response did not include request_number.")
        return {"request_number": request_number, "ritm_id": data.get("ritm_id", ""), "ritm_number": data.get("ritm_number", ""), "ritms": data.get("ritms", [])}
