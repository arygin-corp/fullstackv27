from django.forms import CheckboxInput


class ToggleSwitchInput(CheckboxInput):
    template_name = "third_party_apis/widgets/toggle_switch.html"
