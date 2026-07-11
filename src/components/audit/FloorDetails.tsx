import type { AuditFormData } from '../../types';

const floorTypes = ['Suspended Timber', 'Solid Concrete', 'Beam and Block'];
const labelCls = 'font-label-md text-on-surface-variant';
const inputCls = 'w-full bg-surface-container border border-outline text-on-surface p-3 rounded-lg focus:ring-2 focus:ring-primary-container outline-none transition-all';

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

export function FloorDetails({ form, onChange }: Props) {
  return (
    <section className="bg-surface-container border border-outline p-lg rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary-container">layers</span>
        <h3 className="font-headline-lg text-[20px]">Floor Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Total Floor Area (m²)</label>
          <div className="relative">
            <input type="number" className={inputCls} value={form.floorAreaM2}
              onChange={e => onChange({ floorAreaM2: e.target.value ? Number(e.target.value) : '' })} />
            <span className="absolute right-4 top-3 text-on-surface-variant font-label-md">m²</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Floor Construction</label>
          <select className={inputCls} value={form.floorConstruction} onChange={e => onChange({ floorConstruction: e.target.value })}>
            {floorTypes.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}
