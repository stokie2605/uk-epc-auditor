import type { AuditFormData } from '../../types';

const floorTypes = ['Suspended Timber', 'Solid Concrete', 'Beam and Block'];

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

const labelCls = 'text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1';
const inputCls = 'w-full bg-surface-container border border-outline text-on-surface px-4 py-2.5 rounded-lg text-sm focus:border-primary focus:outline-none transition-all';

export function FloorDetails({ form, onChange }: Props) {
  return (
    <section className="bg-surface border border-outline p-6 rounded-xl shadow-sm">
      {/* Header Container */}
      <div className="flex items-center gap-3 mb-5 border-b border-outline/40 pb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
        <h3 className="text-base font-bold text-on-surface tracking-tight">Floor Details</h3>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className={labelCls}>Total Floor Area (m²)</label>
          <div className="relative">
            <input 
              type="number" 
              className={inputCls} 
              value={form.floorAreaM2}
              onChange={e => onChange({ floorAreaM2: e.target.value ? Number(e.target.value) : '' })} 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-semibold">m²</span>
          </div>
        </div>

        <div className="flex flex-col">
          <label className={labelCls}>Floor Construction</label>
          <select className={inputCls} value={form.floorConstruction} onChange={e => onChange({ floorConstruction: e.target.value })}>
            {floorTypes.map(o => <option key={o} className="bg-surface-container">{o}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}