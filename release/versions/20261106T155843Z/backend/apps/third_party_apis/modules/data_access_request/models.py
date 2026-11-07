import uuid
from calendar import monthrange
from datetime import timedelta, date
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q
from django.utils.text import slugify

class AuditModel(models.Model):
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, editable=False, on_delete=models.SET_NULL, related_name='%(app_label)s_%(class)s_created')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, editable=False, on_delete=models.SET_NULL, related_name='%(app_label)s_%(class)s_updated')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class FormDefinition(AuditModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    is_published = models.BooleanField(default=False)
    success_title = models.CharField(max_length=255, default='Thank you for submitting your request.', blank=True)
    success_message = models.TextField(blank=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_formdefinition'
        ordering = ('name', 'version')

    def save(self, *a, **k):
        if not self.slug:
            self.slug = slugify(self.name)
        self.full_clean()
        return super().save(*a, **k)

    def __str__(self):
        return f'{self.name} v{self.version}'

class FormSection(AuditModel):
    form = models.ForeignKey(FormDefinition, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_formsection'
        ordering = ('order', 'title')
        constraints = [models.UniqueConstraint(fields=('form', 'title'), name='dar_module_unique_section_per_form')]

    def __str__(self):
        return f'{self.title}'

class FieldType(models.TextChoices):
    TEXT = ('text', 'Text')
    TEXTAREA = ('textarea', 'Textarea')
    EMAIL = ('email', 'Email')
    INTEGER = ('integer', 'Integer')
    DECIMAL = ('decimal', 'Decimal')
    DATE = ('date', 'Date')
    DATETIME = ('datetime', 'Date/time')
    CHECKBOX = ('checkbox', 'Checkbox')
    SELECT = ('select', 'Select')
    MULTISELECT = ('multiselect', 'Multi-select')
    RADIO = ('radio', 'Radio')
    USER_LOOKUP = ('user_lookup', 'User lookup')
    HIDDEN = ('hidden', 'Hidden')
    STATIC_TEXT = ('static_text', 'Static text')

class FormField(AuditModel):
    form = models.ForeignKey(FormDefinition, on_delete=models.CASCADE, related_name='fields')
    section = models.ForeignKey(FormSection, null=True, blank=True, on_delete=models.SET_NULL, related_name='fields')
    key = models.CharField(max_length=150)
    label = models.CharField(max_length=500)
    field_type = models.CharField(max_length=30, choices=FieldType.choices, default=FieldType.TEXT)
    help_text = models.TextField(blank=True)
    placeholder = models.CharField(max_length=500, blank=True)
    error_message = models.CharField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)
    required = models.BooleanField(default=False)
    disabled = models.BooleanField(default=False)
    read_only = models.BooleanField(default=False)
    hidden = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    default_value = models.JSONField(null=True, blank=True)
    min_length = models.PositiveIntegerField(null=True, blank=True)
    max_length = models.PositiveIntegerField(null=True, blank=True)
    regex_pattern = models.CharField(max_length=500, blank=True)
    max_selected_items = models.PositiveIntegerField(null=True, blank=True)
    external_source = models.CharField(max_length=100, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_formfield'
        ordering = ('section__order', 'order', 'label')
        constraints = [
            models.UniqueConstraint(fields=('form', 'key'), name='dar_module_unique_field_key_per_form'),
            models.CheckConstraint(check=Q(max_length__isnull=True) | Q(min_length__isnull=True) | Q(max_length__gte=F("min_length")),name="dar_module_valid_field_lengths",)
        ]

    def clean(self):
        if self.section_id and self.section.form_id != self.form_id:
            raise ValidationError({'section': 'Section must belong to the same form.'})

    def save(self, *a, **k):
        self.full_clean()
        return super().save(*a, **k)

    def __str__(self):
        return f'{self.label}'

class FieldOption(AuditModel):
    field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name='options')
    label = models.CharField(max_length=500)
    value = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_fieldoption'
        ordering = ('order', 'label')
        constraints = [
            models.UniqueConstraint(fields=('field', 'value'), name='dar_module_unique_option_per_field')
        ]

    def __str__(self):
        return f'{self.label}'

class RuleOperator(models.TextChoices):
    EQUALS = ('equals', 'Equals')
    NOT_EQUALS = ('not_equals', 'Does not equal')
    IN = ('in', 'Is one of')
    NOT_IN = ('not_in', 'Is not one of')
    IS_EMPTY = ('is_empty', 'Is empty')
    IS_NOT_EMPTY = ('is_not_empty', 'Is not empty')
    CONTAINS = ('contains', 'Contains')
    GT = ('gt', 'Greater than')
    GTE = ('gte', 'Greater than or equal')
    LT = ('lt', 'Less than')
    LTE = ('lte', 'Less than or equal')
    REGEX = ('regex', 'Regex')
    TRUTHY = ('truthy', 'Truthy')
    FALSY = ('falsy', 'Falsy')

class RuleAction(models.TextChoices):
    SHOW = ('show', 'Show')
    HIDE = ('hide', 'Hide')
    REQUIRE = ('require', 'Require')
    OPTIONAL = ('optional', 'Optional')
    ENABLE = ('enable', 'Enable')
    DISABLE = ('disable', 'Disable')
    SET_VALUE = ('set_value', 'Set value')
    CLEAR_VALUE = ('clear_value', 'Clear value')

class RuleEvaluationMode(models.TextChoices):
    ALL = ('all', 'ALL')
    ANY = ('any', 'ANY')

class RuleGroup(AuditModel):
    form = models.ForeignKey(FormDefinition, on_delete=models.CASCADE, related_name='rule_groups')
    name = models.CharField(max_length=255)
    evaluation_mode = models.CharField(max_length=20, choices=RuleEvaluationMode.choices, default=RuleEvaluationMode.ALL)
    priority = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_rulegroup'
        ordering = ('priority', 'id')
        constraints = [models.UniqueConstraint(fields=('form', 'name'), name='dar_module_unique_rule_group_per_form')]

    def __str__(self):
        return f'{self.name}'

class FieldRule(AuditModel):
    group = models.ForeignKey(RuleGroup, null=True, blank=True, on_delete=models.CASCADE, related_name='rules')
    target_field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name='incoming_rules')
    source_field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name='outgoing_rules')
    operator = models.CharField(max_length=30, choices=RuleOperator.choices)
    comparison_value = models.JSONField(null=True, blank=True)
    action = models.CharField(max_length=20, choices=RuleAction.choices)
    action_value = models.JSONField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_fieldrule'
        ordering = ('group', 'order', 'id')

    def __str__(self):
        return f'{self.group}'

class FieldAction(AuditModel):
    group = models.ForeignKey(RuleGroup, on_delete=models.CASCADE, related_name='actions')
    target_field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name='rule_actions')
    action_type = models.CharField(max_length=20, choices=RuleAction.choices)
    action_value = models.JSONField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_fieldaction'
        ordering = ('group_id', 'order', 'id')

    def __str__(self):
        return f'{self.group}'

class ValidationType(models.TextChoices):
    REQUIRED = ('required', 'Required')
    MIN_LENGTH = ('min_length', 'Minimum length')
    MAX_LENGTH = ('max_length', 'Maximum length')
    REGEX = ('regex', 'Regex')
    EMAIL = ('email', 'Email')
    UNIQUE = ('unique', 'Unique')
    MUST_MATCH_FIELD = ('must_match_field', 'Must match field')
    CUSTOM = ('custom', 'Custom')

class ValidationRule(AuditModel):
    field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name='validation_rules')
    validation_type = models.CharField(max_length=40, choices=ValidationType.choices)
    validation_value = models.JSONField(null=True, blank=True)
    error_message = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_validationrule'
        ordering = ('order', 'id')

    def __str__(self):
        return f'{self.validation_type}'

class RoutingRule(AuditModel):
    form = models.ForeignKey(FormDefinition, on_delete=models.CASCADE, related_name='routing_rules')
    name = models.CharField(max_length=255)
    platform_field_key = models.CharField(max_length=150, default='v_dar_platform')
    platform = models.CharField(max_length=500, blank=True, default='')
    domain_field_key = models.CharField(max_length=150, default='v_dar_dataDomainSelect')
    domain = models.CharField(max_length=500, blank=True, default='')
    environment_field_key = models.CharField(max_length=150, default='v_dar_environment')
    environment = models.CharField(max_length=255, blank=True, default='')
    mainframe_access_type_field_key = models.CharField(max_length=150, default='v_dar_mainframe_access_type')
    mainframe_access_type = models.CharField(max_length=500, blank=True, default='')
    company_field_key = models.CharField(max_length=150, default='v_dar_company')
    company = models.CharField(max_length=255, blank=True, default='')
    conditions = models.JSONField(default=dict, blank=True)
    route_identifier = models.CharField(max_length=100, blank=True, default='')
    fulfillment_group = models.CharField(max_length=100, blank=True, default='')
    control_group = models.CharField(max_length=100, blank=True, default='')
    organization = models.CharField(max_length=255, blank=True, default='')
    priority = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_routingrule'
        ordering = ('-priority', 'id')
        constraints = [models.UniqueConstraint(fields=('form', 'name'), name='dar_module_unique_routing_rule_name_per_form')]

    def __str__(self):
        return f'{self.name}'

class SubmissionStatus(models.TextChoices):
    DRAFT = ('draft', 'Draft')
    SUBMITTED = ('submitted', 'Submitted')
    PROCESSING = ('processing', 'Processing')
    COMPLETED = ('completed', 'Completed')
    REJECTED = ('rejected', 'Rejected')
    CANCELLED = ('cancelled', 'Cancelled')

class FormSubmission(AuditModel):
    form = models.ForeignKey(FormDefinition, on_delete=models.PROTECT, related_name='submissions')
    form_version = models.PositiveIntegerField()
    request_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    idempotency_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=30, choices=SubmissionStatus.choices, default=SubmissionStatus.DRAFT)
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='dar_module_form_submissions')
    submitted_at = models.DateTimeField(null=True, blank=True)
    context = models.JSONField(default=dict, blank=True)
    failure_code = models.CharField(max_length=100, blank=True)
    failure_message = models.TextField(blank=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_formsubmission'
        ordering = ('-created_at',)

    @property
    def data(self):
        return {x.field.key: x.value for x in self.values.select_related('field')}

    def __str__(self):
        return f'{self.request_number}'

class SubmissionValue(AuditModel):
    submission = models.ForeignKey(FormSubmission, on_delete=models.CASCADE, related_name='values')
    field = models.ForeignKey(FormField, on_delete=models.PROTECT, related_name='submitted_values')
    value = models.JSONField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_submissionvalue'
        ordering = ('field__order',)
        constraints = [models.UniqueConstraint(fields=('submission', 'field'), name='dar_module_unique_submission_field_value')]

class FormChangeLog(models.Model):
    form_id = models.PositiveBigIntegerField(null=True, blank=True, db_index=True)
    object_app_label = models.CharField(max_length=100, default='forms')
    object_model = models.CharField(max_length=100, db_index=True)
    object_pk = models.CharField(max_length=255, db_index=True)
    object_repr = models.CharField(max_length=500, blank=True)
    action = models.CharField(max_length=10, db_index=True)
    changed_fields = models.JSONField(default=dict, blank=True)
    before = models.JSONField(null=True, blank=True)
    after = models.JSONField(null=True, blank=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='dar_module_form_change_logs')
    actor_label = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=30, default='system', db_index=True)
    request_id = models.CharField(max_length=100, blank=True, db_index=True)
    request_method = models.CharField(max_length=10, blank=True)
    request_path = models.CharField(max_length=500, blank=True)
    change_reason = models.CharField(max_length=1000, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_formchangelog'
        ordering = ('-created_at', '-id')

class ProjectAreaCode(AuditModel):
    name = models.CharField(max_length=255)
    project_code = models.CharField(max_length=40, unique=True, db_index=True, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'forms_dar_projectareacode'
        ordering = ('name',)
        verbose_name = 'Project Area Code'
        verbose_name_plural = 'Project Area Codes'

    def __str__(self):
        return f'{self.project_code}: {self.name}'

class HolidayObservanceRule(models.TextChoices):
    EXACT = ('exact', 'Exact date')
    NEAREST_WEEKDAY = ('nearest_weekday', 'Nearest weekday')
    PREVIOUS_FRIDAY = ('previous_friday', 'Previous Friday')
    NEXT_MONDAY = ('next_monday', 'Next Monday')

class HolidayType(models.TextChoices):
    FIXED_DATE = ('fixed_date', 'Fixed date')
    NTH_WEEKDAY = ('nth_weekday', 'Nth weekday')
    LAST_WEEKDAY = ('last_weekday', 'Last weekday')
    DATE_RANGE = ('date_range', 'Date range')

class CompanyHoliday(AuditModel):
    code = models.SlugField(max_length=80, unique=True, blank=True)
    name = models.CharField(max_length=200)
    holiday_type = models.CharField(max_length=20, choices=HolidayType.choices, default=HolidayType.FIXED_DATE)
    month = models.PositiveSmallIntegerField(null=True, blank=True)
    day = models.PositiveSmallIntegerField(null=True, blank=True)
    week_number = models.PositiveSmallIntegerField(null=True, blank=True, help_text='1=First, 2=Second, 3=Third, 4=Fourth, 5=Fifth')
    weekday = models.PositiveSmallIntegerField(null=True, blank=True, help_text='0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday')
    end_month = models.PositiveSmallIntegerField(null=True, blank=True)
    end_day = models.PositiveSmallIntegerField(null=True, blank=True)
    observance_rule = models.CharField(max_length=30, choices=HolidayObservanceRule.choices, default=HolidayObservanceRule.NEAREST_WEEKDAY)
    is_company_shutdown = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    description = models.TextField(blank=True, max_length=4000)

    class Meta:
        managed = False
        db_table = 'forms_dar_companyholiday'
        verbose_name = 'Company Holiday'
        verbose_name_plural = 'Company Holidays'
        ordering = ('name',)

    def clean(self):
        errors = {}
        if self.month is not None and (not 1 <= self.month <= 12):
            errors['month'] = 'Month must be between 1 and 12.'
        if self.end_month is not None and (not 1 <= self.end_month <= 12):
            errors['end_month'] = 'End month must be between 1 and 12.'
        if self.weekday is not None and (not 0 <= self.weekday <= 6):
            errors['weekday'] = 'Weekday must be between 0 and 6.'
        if self.week_number is not None and (not 1 <= self.week_number <= 5):
            errors['week_number'] = 'Week number must be between 1 and 5.'
        if self.holiday_type == HolidayType.FIXED_DATE:
            if self.month is None:
                errors['month'] = 'Month is required for a fixed-date holiday.'
            if self.day is None:
                errors['day'] = 'Day is required for a fixed-date holiday.'
        elif self.holiday_type == HolidayType.NTH_WEEKDAY:
            if self.month is None:
                errors['month'] = 'Month is required for an nth-weekday holiday.'
            if self.week_number is None:
                errors['week_number'] = 'Week number is required for an nth-weekday holiday.'
            if self.weekday is None:
                errors['weekday'] = 'Weekday is required for an nth-weekday holiday.'
        elif self.holiday_type == HolidayType.LAST_WEEKDAY:
            if self.month is None:
                errors['month'] = 'Month is required for a last-weekday holiday.'
            if self.weekday is None:
                errors['weekday'] = 'Weekday is required for a last-weekday holiday.'
        elif self.holiday_type == HolidayType.DATE_RANGE:
            required_values = (self.month, self.day, self.end_month, self.end_day)
            if any((value is None for value in required_values)):
                errors['holiday_type'] = 'Date-range holidays require start and end dates.'
        if not errors:
            try:
                self.actual_date_for_year(2000)
                if self.holiday_type == HolidayType.DATE_RANGE:
                    start_date, end_date = self.date_range_for_year(2000)
                    if end_date < start_date:
                        errors['end_day'] = 'The end date must not be earlier than the start date.'
            except (TypeError, ValueError) as exc:
                errors['holiday_type'] = str(exc)
        if errors:
            raise ValidationError(errors)

    def actual_date_for_year(self, year):
        """
        Return the actual holiday date for a supplied year.

        For date-range holidays, this returns the first day of
        the range. Use date_range_for_year() when both dates are needed.
        """
        if self.holiday_type in {HolidayType.FIXED_DATE, HolidayType.DATE_RANGE}:
            if self.month is None or self.day is None:
                raise ValueError('Month and day are required.')
            return date(year, self.month, self.day)
        if self.holiday_type == HolidayType.NTH_WEEKDAY:
            if self.month is None or self.week_number is None or self.weekday is None:
                raise ValueError('Month, week number, and weekday are required.')
            first_day = date(year, self.month, 1)
            day_offset = (self.weekday - first_day.weekday()) % 7
            calculated_day = 1 + day_offset + (self.week_number - 1) * 7
            last_day = monthrange(year, self.month)[1]
            if calculated_day > last_day:
                raise ValueError('The requested weekday occurrence does not exist in this month.')
            return date(year, self.month, calculated_day)
        if self.holiday_type == HolidayType.LAST_WEEKDAY:
            if self.month is None or self.weekday is None:
                raise ValueError('Month and weekday are required.')
            last_day_number = monthrange(year, self.month)[1]
            last_date = date(year, self.month, last_day_number)
            day_offset = (last_date.weekday() - self.weekday) % 7
            return last_date - timedelta(days=day_offset)
        raise ValueError(f'Unsupported holiday type: {self.holiday_type}')

    def date_range_for_year(self, year):
        if self.holiday_type != HolidayType.DATE_RANGE:
            actual_date = self.actual_date_for_year(year)
            return (actual_date, actual_date)
        if self.month is None or self.day is None or self.end_month is None or (self.end_day is None):
            raise ValueError('Date-range holidays require start and end dates.')
        start_date = date(year, self.month, self.day)
        end_year = year
        if (self.end_month, self.end_day) < (self.month, self.day):
            end_year += 1
        end_date = date(end_year, self.end_month, self.end_day)
        return (start_date, end_date)

    def observed_date_for_year(self, year):
        actual_date = self.actual_date_for_year(year)
        if self.observance_rule == HolidayObservanceRule.EXACT:
            return actual_date
        if self.observance_rule == HolidayObservanceRule.NEAREST_WEEKDAY:
            if actual_date.weekday() == 5:
                return actual_date - timedelta(days=1)
            if actual_date.weekday() == 6:
                return actual_date + timedelta(days=1)
            return actual_date
        if self.observance_rule == HolidayObservanceRule.PREVIOUS_FRIDAY:
            days_back = (actual_date.weekday() - 4) % 7
            if days_back == 0:
                days_back = 7
            return actual_date - timedelta(days=days_back)
        if self.observance_rule == HolidayObservanceRule.NEXT_MONDAY:
            days_forward = (7 - actual_date.weekday()) % 7
            if days_forward == 0:
                days_forward = 7
            return actual_date + timedelta(days=days_forward)
        return actual_date

    def occurs_on(self, check_date):
        """Return True for actual, observed, or date-range closure dates."""
        if self.holiday_type == HolidayType.DATE_RANGE:
            for base_year in (check_date.year - 1, check_date.year):
                start_date, end_date = self.date_range_for_year(base_year)
                if start_date <= check_date <= end_date:
                    return True
            return False
        return self.actual_date_for_year(check_date.year) == check_date or self.observed_date_for_year(check_date.year) == check_date

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name
