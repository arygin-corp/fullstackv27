import { Injectable } from '@angular/core';
import { DarField, DarRule, DarRuleGroup, DarSchema, DarState } from './data-access-request';

@Injectable({ 
  providedIn: 'root' 
})

export class DarRuleEngineService {
  resolve(schema: DarSchema, raw: Record<string, any>): Record<string, DarState> {
    const fields = this.fields(schema);
    let values = {...raw};
    let previous = '';
    const maxPasses = Math.max(10, fields.length * 2);
    for (let pass = 0; pass < maxPasses; pass++) {
      const states: Record<string, DarState> = {};
      fields.forEach(f => states[f.key] = {
        hidden: !!f.hidden, required: !!f.required, disabled: !!f.disabled,
        read_only: !!f.read_only, value: values[f.key] !== undefined ? values[f.key] : f.default_value
      });
      this.actions(schema, values).forEach(action => {
        const state = states[action.target_key];
        if (!state) { return; }
        switch (action.action_type || action.action) {
          case 'show': state.hidden = false; break;
          case 'hide': state.hidden = true; state.required = false; state.value = null; break;
          case 'require': state.required = true; break;
          case 'optional': state.required = false; break;
          case 'enable': state.disabled = false; break;
          case 'disable': state.disabled = true; state.value = null; break;
          case 'set_value': state.value = action.action_value; break;
          case 'clear_value': state.value = null; break;
        }
      });
      const signature = JSON.stringify(Object.keys(states).sort().map(k => [k, states[k]]));
      if (signature === previous) { return states; }
      previous = signature;
      values = Object.keys(states).reduce((o, k) => ({...o, [k]: states[k].value}), {});
    }
    throw new Error('Form rules did not converge. Check cyclic or conflicting actions.');
  }

  private actions(schema: DarSchema, values: Record<string, any>): DarRule[] {
  const result: DarRule[] = [];

  (schema.rule_groups || []).filter(group => group.is_active !== false).sort((a, b) =>
    (a.priority || 0) - (b.priority || 0))
    .forEach(group => {
      const checks = (group.rules || []).filter(rule => rule.is_active !== false).map(rule => this.match(rule, values));
      const matched = checks.length > 0 && (group.evaluation_mode === 'any' ? checks.some(Boolean) : checks.every(Boolean));

      if (matched) {
        result.push(
          ...(group.actions || [])
            .filter(action => action.is_active !== false)
        );
      }
    });

  return result.sort(
    (a, b) =>
      (a.order || 0) - (b.order || 0)
  );
}

  // private actions(schema: DarSchema, values: Record<string, any>): DarRule[] {
  //   const result: DarRule[] = [];
  //   (schema.rule_groups || []).filter(g => g.is_active !== false).sort((a,b) => (a.priority || 0) - (b.priority || 0)).forEach(group => {
  //     const checks = (group.rules || []).filter(r => r.is_active !== false).map(r => this.match(r, values));
  //     const matched = checks.length > 0 && (group.evaluation_mode === 'any' ? checks.some(Boolean) : checks.every(Boolean));
  //     if (matched) { result.push(...(group.actions || []).filter(a => a.is_active !== false)); }
  //   });
  //   this.fields(schema).forEach(field => (field.rules || []).filter(r => !r.group && r.is_active !== false).forEach(rule => { if (this.match(rule, values)) { result.push(rule); } }));
  //   return result.sort((a,b) => (a.order || 0) - (b.order || 0));
  // }

  private match(rule: DarRule, values: Record<string, any>): boolean {
    const value = values[rule.source_key]; const compare = rule.comparison_value;
    switch (rule.operator) {
      case 'equals': return value === compare;
      case 'not_equals': return value !== compare;
      case 'in': return Array.isArray(compare) && compare.indexOf(value) >= 0;
      case 'not_in': return Array.isArray(compare) && compare.indexOf(value) < 0;
      case 'is_empty': return this.empty(value);
      case 'is_not_empty': return !this.empty(value);
      case 'contains': return value != null && typeof value.indexOf === 'function' && value.indexOf(compare) >= 0;
      case 'gt': return value > compare; case 'gte': return value >= compare;
      case 'lt': return value < compare; case 'lte': return value <= compare;
      case 'regex': try { return typeof value === 'string' && new RegExp(`^(?:${compare})$`).test(value); } catch { return false; }
      case 'truthy': return !!value; case 'falsy': return !value; default: return false;
    }
  }
  private empty(v: any): boolean { return v == null || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length); }
  private fields(s: DarSchema): DarField[] { return s.sections.reduce((a,x) => a.concat(x.section_fields || []), [] as DarField[]).concat(s.unsectioned_fields || []); }
}
