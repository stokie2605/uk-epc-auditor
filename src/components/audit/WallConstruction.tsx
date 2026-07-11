import type { AuditFormData } from '../../types';

const wallTypes      = ['Cavity Wall', 'Solid Brick', 'Timber Frame', 'System Built'];
const infillMaterials = ['Mineral Wool', 'Polystyrene Beads', 'Urea Formaldehyde Foam', 'None (Empty Cavity)'];

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

const labelCls = 'text-xs font-semibold text-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wide';
const inputCls = 'w-full bg-white dark:bg-dark-surface-container border border-outline dark:border-dark-outline text-on-surface dark:text-dark-on-surface p-3 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary outline-none transition-all text-sm';

export function WallConstruction({ form, onChange }: Props) {
  return (
    <section className="bg-surface dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant p-lg rounded-xl shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary dark:text-dark-primary">wall_art</span>
        <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">Wall Construction</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Wall Type</label>
          <select className={inputCls} value={form.wallType} onChange={e => onChange({ wallType: e.target.value })}>
            {wallTypes.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Insulation Thickness (mm)</label>
          <input type="number" placeholder="e.g. 100" className={inputCls}
            value={form.insulationThicknessMm}
            onChange={e => onChange({ insulationThicknessMm: e.target.value ? Number(e.target.value) : '' })} />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={labelCls}>Infill Material</label>
          <select className={inputCls} value={form.infillMaterial} onChange={e => onChange({ infillMaterial: e.target.value })}>
            {infillMaterials.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}
