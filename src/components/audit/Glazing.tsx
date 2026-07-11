import type { AuditFormData } from '../../types';

const windowTypes = ['Double Glazing', 'Single Glazing', 'Triple Glazing', 'Secondary Glazing'];
const frameMaterials = ['uPVC', 'Wood/Timber', 'Metal/Aluminum'];

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

const labelCls = 'text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1';
const inputCls = 'w-full bg-surface-container border border-outline text-on-surface px-4 py-2.5 rounded-lg text-sm focus:border-primary focus:outline-none transition-all';

export function Glazing({ form, onChange }: Props) {
  return (
    <section className="bg-surface border border-outline p-6 rounded-xl shadow-sm">
      {/* Header Container */}
      <div className="flex items-center gap-3 mb-5 border-b border-outline/40 pb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">window</span>
        <h3 className="text-base font-bold text-on-surface tracking-tight">Glazing & Fenestration</h3>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className={labelCls}>Window Type</label>
          <select className={inputCls} value={form.windowType} onChange={e => onChange({ windowType: e.target.value })}>
            {windowTypes.map(o => <option key={o} className="bg-surface-container">{o}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className={labelCls}>Frame Material</label>
          <select className={inputCls} value={form.frameMaterial} onChange={e => onChange({ frameMaterial: e.target.value })}>
            {frameMaterials.map(o => <option key={o} className="bg-surface-container">{o}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className={labelCls}>Year of Installation</label>
          <input 
            type="number" 
            placeholder="YYYY" 
            className={inputCls}
            value={form.glazingYear}
            onChange={e => onChange({ glazingYear: e.target.value ? Number(e.target.value) : '' })} 
          />
        </div>
      </div>
    </section>
  );
}