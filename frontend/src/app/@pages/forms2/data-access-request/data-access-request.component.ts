import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { DataAccessRequestApiService } from './data-access-request-api.service';
import { DarField, DarSchema, DarState } from './data-access-request';
import { DarRuleEngineService } from './dar-rule-engine.service';
import { environment } from 'src/environments/environment';

export interface DarUserProfile {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  jobTitle: string;
  userPrincipalName: string;
  mail: string;
  businessPhones: string[];
  officeLocation: string;
  employeeId: string;
  department: string;
  companyName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  [key: string]: unknown;
}


@Component({
  selector: 'app-data-access-request',
  templateUrl: './data-access-request.component.html',
  styleUrls: ['./data-access-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataAccessRequestComponent
  implements OnInit, OnDestroy {
  isLoading = true;
  form: FormGroup = this.fb.group({});
  schema?: DarSchema;
  profile?: DarUserProfile;
  loading = true;
  submitting = false;
  success = '';
  fatal = '';
  private readonly destroyed$ = new Subject<void>();
  private readonly activeRequired = new Set<string>();
  private states: Record<string, DarState> = {};

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: DataAccessRequestApiService,
    private readonly rules: DarRuleEngineService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly http: HttpClient
  ) {}


  ngOnInit(): void {
    this.loading = true;
    this.fatal = '';

    console.log('Microsoft Graph endpoint:', environment.microsoft.graphAPI);

    forkJoin({
      schema: this.api.getSchema(),

      profile: this.http.get<DarUserProfile>(
        environment.microsoft.graphAPI).pipe(catchError(error => {
          console.error('Microsoft Graph profile request failed:', error);

            return of<DarUserProfile | null>(null);
          })
        )
      }).pipe(takeUntil(this.destroyed$)).subscribe({
        next: ({ schema, profile }) => {
          console.log('DAR schema:', schema);
          console.log('Microsoft Graph profile:', profile);
          this.schema = schema;
          this.profile = profile ?? undefined;
          this.buildForm();
          this.applyRules();
          if (this.profile) {
            this.populateSystemMetadata();
            this.populateRequestForMe();
          } else {
            console.warn('DAR rendered without Microsoft Graph profile data.');
          }

          this.applyRules();
          this.logInitialization();
          this.loading = false;
          this.cdr.markForCheck();
        },

        error: error => {
          console.error('DAR initialization failed:', error);
          this.loading = false;
          this.fatal = this.apiError(error, 'Unable to load the request form.');
          this.cdr.markForCheck();
        }
      }
    );
  }

  private populateSystemMetadata(): void {
    if (!this.profile) {
      return;
    }

    this.patchExistingControls({
      v_dar_objectid_createdby: this.profile.id,
      v_dar_workdayID_created_by: this.profile.employeeId ?? '',
      companyName: this.profile.companyName ?? '',
      v_dar_organization: this.organizationForCompany(this.profile.companyName),
      v_dar_dm_version: `Version ${this.applicationVersion()}`
    });
  }

  private organizationForCompany(companyName: string | null | undefined): string {
    const company = (companyName ?? '').trim();

    const tmnaCompanies = new Set([
      'AIR',
      'BJN',
      'BSL',
      'BTR',
      'CPT',
      'GTS',
      'MSO',
      'R&D',
      'SIA',
      'TAL',
      'TBC',
      'TCA',
      'TDP',
      'TCN',
      'TIN',
      'TKY',
      'TLS',
      'TMA',
      'TME',
      'TMM',
      'TMN',
      'TMP',
      'TMS',
      'TNA',
      'TTC',
      'TTX',
      'TWV',
      'TDM'
    ]);

    const tfsCompanies = new Set(['TCC', 'TIS', 'TFB', 'TFS', 'TSM', 'TPR']);

    if (tmnaCompanies.has(company)) {return 'TMNA';}

    if (tfsCompanies.has(company)) {return 'TFS';}

    switch (company) {
      case 'MTM': return 'MTMUS';
      case 'WP': return 'Woven Planet';
      case 'Toyota Connected': return 'Toyota Connected';
      case 'TMC': return 'Toyota Motors Corporation';
      case 'Servco Pacific Inc.': return 'Servco';
      default: return '';
    }
  }

  private logInitialization(): void {
    const raw = this.form.getRawValue();

    console.table(
      this.fields.map(field => {
        const control =
          this.form.get(field.key);

        return {
          label: field.label,
          key: field.key,
          fieldType: field.field_type,
          controlExists: !!control,
          value: control?.value,
          rawValue: raw[field.key],
          defaultValue: field.default_value,
          disabled: control?.disabled,
          readOnly: field.read_only,
          hidden: field.hidden,
          externalSource: field.external_source
        };
      })
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private findField(preferredKey: string, label: string): DarField | undefined {
    const normalizedLabel = label.trim().toLowerCase();

    return this.fields.find(field => field.key === preferredKey || field.label.trim().toLowerCase() === normalizedLabel);
  }

  private setRuntimeValue(preferredKey: string, label: string, value: unknown): void {
    if (value === undefined || value === null) {
      return;
    }

    const field = this.findField(preferredKey, label);

    if (!field) {
      console.warn(`No schema field found for key "${preferredKey}" or label "${label}".`);
      return;
    }

    const control = this.form.get(field.key);

    if (!control) {
      console.warn(`Schema field "${field.key}" exists, but no Angular control was created.`);
      return;
    }

    control.setValue(value, {emitEvent: false});
    console.log(`Hydrated ${field.label} (${field.key}):`, value);
  }


  get fields(): DarField[] {
    if (!this.schema) {
      return [];
    }

    const sectionFields =
      this.schema.sections.reduce(
        (all, section) =>
          all.concat(
            section.section_fields || []
          ),
        [] as DarField[]
      );

    return sectionFields.concat(
      this.schema.unsectioned_fields || []
    );
  }

  get requiredFields(): Array<{control: string; label: string; valid: boolean;}> {
    return this.fields.filter(field => this.activeRequired.has(field.key)).map(field => ({
      control: field.key,
      label: field.label,
      valid: !!this.form.get(field.key)?.valid
    }));
  }

  get remainingFields(): Array<{control: string; label: string; valid: boolean;}> {
    return this.requiredFields.filter(item => !item.valid);
  }

  private buildForm(): void {
    const controls: Record<string, FormControl> = {};

    this.fields.filter(field => field.field_type !== 'static_text').forEach(field => {
      const initial = this.initialValue(field);

      controls[field.key] = new FormControl({
        value: initial,

        disabled: !!field.disabled || !!field.read_only
      });
    });

    this.form = this.fb.group(controls);

    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.applyRules();
      this.cdr.markForCheck();
    });
  }

  private initialValue(field: DarField): unknown {
    if (field.field_type === 'checkbox') {
      return !!field.default_value;
    }

    if (field.field_type === 'multiselect') {
      return Array.isArray(field.default_value) ? field.default_value : [];
    }

    return field.default_value ?? null;
  }

  private populateRequestForMe(): void {
    if (!this.profile) {
      return;
    }

    this.setRuntimeValue('requesting_id', 'Who are you requesting data access for?', 'Me');
    this.setRuntimeValue('v_dar_objectid_reqfor', 'Requested For Object ID', this.profile.id);
    this.setRuntimeValue('v_dar_workdayID', 'Requested For Employee ID', this.profile.employeeId);
  }

  private applicationVersion(): string {
    const config = environment as unknown as {appVersion?: string; version?: string;};
    const version = config.appVersion || config.version;

    if (!version) {
      console.warn('Neither environment.appVersion nor environment.version is configured.');
      return 'Unknown';
    }
    return version;
  }

  private patchExistingControls(values: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(values)) {
      const control = this.form.get(key);

      if (!control || value === undefined || value === null) {
        continue;
      }

      control.setValue(value, {emitEvent: false});
    }
  }


  private applyRules(): void {
    if (!this.schema) {
      return;
    }

    try {
      this.states = this.rules.resolve(
        this.schema,
        this.form.getRawValue()
      );

      /*
       * Clear an old rule error after resolution succeeds.
       */
      if (
        this.fatal ===
        'Invalid form rule configuration.'
      ) {
        this.fatal = '';
      }
    } catch (error) {
      console.error(
        'DAR rule resolution failed:',
        error
      );

      this.fatal =
        error instanceof Error
          ? error.message
          : 'Invalid form rule configuration.';

      return;
    }

    this.activeRequired.clear();

    this.fields
      .filter(field =>
        field.field_type !== 'static_text'
      )
      .forEach(field => {
        const control =
          this.form.get(field.key);

        const state =
          this.states[field.key];

        if (!control || !state) {
          return;
        }

        const shouldBeDisabled =
          state.disabled ||
          state.read_only;

        if (
          shouldBeDisabled &&
          control.enabled
        ) {
          control.disable({
            emitEvent: false
          });
        }

        if (
          !shouldBeDisabled &&
          control.disabled
        ) {
          control.enable({
            emitEvent: false
          });
        }

        if (
          !this.valuesEqual(
            control.value,
            state.value
          )
        ) {
          control.setValue(
            state.value,
            {
              emitEvent: false
            }
          );
        }

        /*
         * Hidden field types can carry System Metadata,
         * but do not need ordinary browser validators.
         */
        const isVisibleUserField =
          field.field_type !== 'hidden' &&
          !state.hidden;

        control.setValidators(
          isVisibleUserField
            ? this.validatorsFor(
                field,
                state.required
              )
            : []
        );

        /*
         * Only user-answerable fields should appear in
         * the "Required information" navigation.
         *
         * Read-only/system/routing fields should not be
         * shown as incomplete questions.
         */
        if (
          isVisibleUserField &&
          state.required &&
          !state.disabled &&
          !state.read_only
        ) {
          this.activeRequired.add(
            field.key
          );
        }

        control.updateValueAndValidity({
          emitEvent: false
        });
      });
  }


  private valuesEqual(
    left: unknown,
    right: unknown
  ): boolean {
    if (left === right) {
      return true;
    }

    const leftIsObject =
      left !== null &&
      typeof left === 'object';

    const rightIsObject =
      right !== null &&
      typeof right === 'object';

    if (
      leftIsObject ||
      rightIsObject
    ) {
      try {
        return (
          JSON.stringify(left) ===
          JSON.stringify(right)
        );
      } catch {
        return false;
      }
    }

    return false;
  }


  private validatorsFor(
    field: DarField,
    required: boolean
  ): ValidatorFn[] {
    const validators:
      ValidatorFn[] = [];

    if (required) {
      validators.push(
        field.field_type === 'checkbox'
          ? Validators.requiredTrue
          : Validators.required
      );
    }

    if (field.min_length != null) {
      validators.push(
        Validators.minLength(
          field.min_length
        )
      );
    }

    if (field.max_length != null) {
      validators.push(
        Validators.maxLength(
          field.max_length
        )
      );
    }

    if (field.regex_pattern) {
      validators.push(
        Validators.pattern(
          field.regex_pattern
        )
      );
    }

    if (field.field_type === 'email') {
      validators.push(
        Validators.email
      );
    }

    if (
      field.max_selected_items != null
    ) {
      validators.push(
        control => {
          const value = control.value;

          const invalid =
            Array.isArray(value) &&
            value.length >
              field.max_selected_items!;

          return invalid
            ? {
                maxSelected: {
                  maximum:
                    field.max_selected_items,

                  actual:
                    value.length
                }
              }
            : null;
        }
      );
    }

    (field.validations || [])
      .filter(validation =>
        validation.is_active !== false
      )
      .forEach(validation => {
        const config =
          validation.validation_value || {};

        switch (
          validation.validation_type
        ) {
          case 'required':
            /*
             * Avoid adding a duplicate required
             * validator when state.required already
             * produced one.
             */
            if (!required) {
              validators.push(
                field.field_type ===
                  'checkbox'
                  ? Validators.requiredTrue
                  : Validators.required
              );
            }
            break;

          case 'min_length':
            if (config.length != null) {
              validators.push(
                Validators.minLength(
                  Number(config.length)
                )
              );
            }
            break;

          case 'max_length':
            if (config.length != null) {
              validators.push(
                Validators.maxLength(
                  Number(config.length)
                )
              );
            }
            break;

          case 'regex':
            if (config.pattern) {
              validators.push(
                Validators.pattern(
                  String(config.pattern)
                )
              );
            }
            break;

          case 'email':
            if (
              field.field_type !== 'email'
            ) {
              validators.push(
                Validators.email
              );
            }
            break;
        }
      });

    return validators;
  }


  visible(field: DarField): boolean {
    if (field.field_type === 'hidden') {
      return false;
    }

    const state =
      this.states[field.key];

    return state
      ? !state.hidden
      : !field.hidden;
  }


  required(field: DarField): boolean {
    return (
      this.states[field.key]?.required ??
      !!field.required
    );
  }


  private buildDarData():
    Record<string, unknown> {
    const raw =
      this.form.getRawValue();

    return this.fields.reduce(
      (output, field) => {
        if (
          field.field_type ===
          'static_text'
        ) {
          return output;
        }

        const state =
          this.states[field.key];

        if (!state) {
          return output;
        }

        /*
         * Read-only values are intentionally included.
         * Read-only means non-editable, not non-submit.
         *
         * Hidden field types are included because System
         * Metadata may intentionally use hidden fields.
         *
         * A field hidden dynamically by a business rule
         * is excluded unless metadata explicitly permits
         * hidden submission.
         */
        const submitWhenHidden =
          field.metadata?.[
            'submit_when_hidden'
          ] === true;

        const isSystemHiddenField =
          field.field_type === 'hidden';

        const shouldSubmit =
          !state.disabled &&
          (
            !state.hidden ||
            submitWhenHidden ||
            isSystemHiddenField
          );

        if (shouldSubmit) {
          output[field.key] =
            raw[field.key];
        }

        return output;
      },
      {} as Record<string, unknown>
    );
  }


  onSubmit(): void {
    if (
      this.submitting ||
      !this.schema
    ) {
      return;
    }

    this.applyRules();

    if (this.form.invalid) {
      this.markActiveTouched();
      this.focusFirstInvalid();
      return;
    }

    this.submitting = true;
    this.fatal = '';

    const payload =
      this.buildDarData();

    /*
     * This preserves your current record/submit method.
     *
     * When the ServiceNow-first orchestration is enabled,
     * replace this call with:
     *
     * preflight -> addToCart -> submitCart ->
     * recordExternalSubmission.
     */
    this.api.submit(
      payload,
      {
        schema_version:
          this.schema.schema_version,

        form_version:
          this.schema.version
      }
    )
    .pipe(
      takeUntil(this.destroyed$),

      finalize(() => {
        this.submitting = false;
        this.cdr.markForCheck();
      })
    )
    .subscribe({
      next: result => {
        this.success =
          result.message ||
          'Your data access request was submitted successfully.';

        if (result.redirect_url) {
          this.router.navigateByUrl(
            result.redirect_url
          );
        }

        this.cdr.markForCheck();
      },

      error: error => {
        console.error(
          'DAR submission failed:',
          error
        );

        this.applyServerFieldErrors(
          error
        );

        this.fatal = this.apiError(
          error,
          'Submission failed. Your entries have been retained.'
        );

        this.cdr.markForCheck();
      }
    });
  }


  private applyServerFieldErrors(
    error: any
  ): void {
    const fieldErrors =
      error?.error?.field_errors ??
      error?.error?.errors ??
      error?.error?.values;

    if (
      !fieldErrors ||
      typeof fieldErrors !== 'object' ||
      Array.isArray(fieldErrors)
    ) {
      return;
    }

    for (
      const [key, message]
      of Object.entries(fieldErrors)
    ) {
      const control =
        this.form.get(key);

      if (!control) {
        continue;
      }

      const text =
        Array.isArray(message)
          ? message.join(' ')
          : typeof message === 'string'
            ? message
            : JSON.stringify(message);

      control.setErrors({
        ...control.errors,
        server: text
      });

      control.markAsTouched();
    }
  }


  private markActiveTouched(): void {
    this.fields
      .filter(field =>
        this.visible(field)
      )
      .forEach(field => {
        const control =
          this.form.get(field.key);

        /*
         * Disabled/read-only metadata cannot be fixed by
         * the user and should not receive touch state.
         */
        if (
          control &&
          control.enabled
        ) {
          control.markAsTouched();
        }
      });

    this.cdr.markForCheck();
  }


  private focusFirstInvalid(): void {
    const first =
      this.fields.find(field => {
        const control =
          this.form.get(field.key);

        return (
          this.visible(field) &&
          !!control &&
          control.enabled &&
          control.invalid
        );
      });

    if (first) {
      setTimeout(() => {
        document
          .getElementById(first.key)
          ?.focus();
      });
    }
  }


  error(field: DarField): string {
    const control =
      this.form.get(field.key);

    if (
      !control ||
      !control.touched ||
      !control.errors
    ) {
      return '';
    }

    if (control.errors['server']) {
      return String(
        control.errors['server']
      );
    }

    if (
      control.errors['required'] ||
      control.errors['requiredTrue']
    ) {
      return (
        `${field.label} is required.`
      );
    }

    if (control.errors['email']) {
      return (
        'Enter a valid email address.'
      );
    }

    if (control.errors['minlength']) {
      return (
        `${field.label} must be at least ` +
        `${control.errors['minlength']
          .requiredLength} characters.`
      );
    }

    if (control.errors['maxlength']) {
      return (
        `${field.label} must be no more than ` +
        `${control.errors['maxlength']
          .requiredLength} characters.`
      );
    }

    if (control.errors['pattern']) {
      return (
        `${field.label} has an invalid format.`
      );
    }

    if (control.errors['maxSelected']) {
      return (
        `${field.label} allows no more than ` +
        `${control.errors['maxSelected']
          .maximum} selections.`
      );
    }

    return `${field.label} is invalid.`;
  }


  inputType(field: DarField): string {
    const inputTypes:
      Record<string, string> = {

      email: 'email',
      integer: 'number',
      decimal: 'number',
      date: 'date',
      datetime: 'datetime-local'
    };

    return (
      inputTypes[field.field_type] ||
      'text'
    );
  }


  isTermsField(
    field: DarField
  ): boolean {
    return (
      field.key ===
        'chk_dar_terms_message' ||
      field.key ===
        'terms_accepted'
    );
  }


  helpId(field: DarField): string {
    return `${field.key}-help`;
  }


  errorId(field: DarField): string {
    return `${field.key}-error`;
  }


  describedBy(
    field: DarField
  ): string | null {
    const ids = [
      field.help_text
        ? this.helpId(field)
        : '',

      this.error(field)
        ? this.errorId(field)
        : ''
    ].filter(Boolean);

    return ids.length
      ? ids.join(' ')
      : null;
  }


  focusField(key: string): void {
    document
      .getElementById(key)
      ?.focus();
  }


  handleRequiredFieldKeydown(
    event: KeyboardEvent,
    key: string
  ): void {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      this.focusField(key);
    }
  }


  track(
    _: number,
    field: DarField
  ): string {
    return field.key;
  }


  trackRequiredField(
    _: number,
    field: {
      control: string;
    }
  ): string {
    return field.control;
  }


  // private logInitialization(): void {
  //   const metadataKeys = [
  //     'request_created_by',
  //     'v_dar_objectid_createdby',
  //     'v_dar_workdayID_created_by',
  //     'v_dar_objectid_reqfor',
  //     'v_dar_workdayID',
  //     'companyName',
  //     'v_dar_organization',
  //     'v_dar_dm_version'
  //   ];

  //   console.table(
  //     metadataKeys.map(key => ({
  //       key,

  //       controlExists:
  //         this.form.contains(key),

  //       value:
  //         this.form.get(key)?.value,

  //       disabled:
  //         this.form.get(key)?.disabled
  //     }))
  //   );
  // }


  private apiError(
    error: any,
    fallback: string
  ): string {
    console.error('API error:', error);

    const body =
      error?.error;

    if (
      typeof body === 'string' &&
      body.trim()
    ) {
      return body;
    }

    if (body?.detail) {
      return String(body.detail);
    }

    if (body?.message) {
      return String(body.message);
    }

    if (body?.error_description) {
      return String(
        body.error_description
      );
    }

    if (
      typeof body?.error === 'string'
    ) {
      return body.error;
    }

    if (body?.error?.message) {
      return String(
        body.error.message
      );
    }

    if (error?.message) {
      return String(error.message);
    }

    if (error?.status) {
      return (
        `${fallback} ` +
        `HTTP status: ${error.status}.`
      );
    }

    return fallback;
  }
}