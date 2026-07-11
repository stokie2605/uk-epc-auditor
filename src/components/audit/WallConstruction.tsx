import type { AuditFormData } from '../../types';

const wallTypes      = ['Cavity Wall', 'Solid Brick', 'Timber Frame', 'System Built'];
const infillMaterials = ['Mineral Wool', 'Polystyrene Beads', 'Urea Formaldehyde Foam', 'None (Empty Cavity)'];

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

const labelCls = 'font-label-md text-on-surface-variant';
const inputCls = 'w-full bg-surface-container border border-outline text-on-surface p-3 rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all';

export function WallConstruction({ form, onChange }: Props) {
  return (
    <section className="bg-surface-container border border-outline p-lg rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary-container">wall_art</span>
        <h3 className="font-headline-lg text-[20px] text-on-surface">Wall Construction</h3>
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
