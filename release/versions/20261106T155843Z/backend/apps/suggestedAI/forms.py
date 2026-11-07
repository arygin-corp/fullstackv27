from django import forms

class DBSearchForm(forms.Form):
    query = forms.CharField(label="Search for a car", max_length=100)

class TableSearchForm(forms.Form):
    query = forms.CharField(label="Search for a car", max_length=100)

class DescriptionSearchForm(forms.Form):
    query = forms.CharField(label="Search for a car", max_length=4000)

class IntendedUseSearchForm(forms.Form):
    query = forms.CharField(label="Search for a car", max_length=4000)
