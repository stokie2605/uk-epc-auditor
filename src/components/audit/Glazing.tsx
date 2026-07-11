import type { AuditFormData } from '../../types';

const windowTypes  = ['Double Glazing', 'Single Glazing', 'Triple Glazing', 'Secondary Glazing'];
const frameTypes   = ['uPVC', 'Wood/Timber', 'Metal/Aluminum'];
const labelCls = 'text-xs font-semibold text-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wide';
const inputCls = 'w-full bg-white dark:bg-dark-surface-container border border-outline dark:border-dark-outline text-on-surface dark:text-dark-on-surface p-3 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary outline-none transition-all text-sm';

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

export function Glazing({ form, onChange }: Props) {
  return (
    <section className="bg-surface dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant p-lg rounded-xl shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary dark:text-dark-primary">window</span>
        <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">Glazing &amp; Fenestration</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Window Type</label>
          <select className={inputCls} value={form.windowType} onChange={e => onChange({ windowType: e.target.value })}>
            {windowTypes.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Frame Material</label>
          <select className={inputCls} value={form.frameMaterial} onChange={e => onChange({ frameMaterial: e.target.value })}>
            {frameTypes.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Year of Installation</label>
          <input type="number" placeholder="YYYY" className={inputCls}
            value={form.glazingYear}
            onChange={e => onChange({ glazingYear: e.target.value ? Number(e.target.value) : '' })} />
        </div>
      </div>
    </section>
  );
}
