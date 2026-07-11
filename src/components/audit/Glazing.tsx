import type { AuditFormData } from '../../types';

const windowTypes = ['Double Glazing', 'Single Glazing', 'Triple Glazing', 'Secondary Glazing'];
const frameMaterials = ['uPVC', 'Wood/Timber', 'Metal/Aluminum'];

const labelCls = 'font-label-md text-on-surface-variant';
const inputCls = 'w-full bg-surface-container border border-outline text-on-surface p-3 rounded-lg focus:ring-2 focus:ring-primary-container outline-none transition-all';

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

export function Glazing({ form, onChange }: Props) {
  return (
    <section className="bg-surface-container border border-outline p-lg rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary-container">window</span>
        <h3 className="font-headline-lg text-[20px]">Glazing & Fenestration</h3>
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
            {frameMaterials.map(o => <option key={o}>{o}</option>)}
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
