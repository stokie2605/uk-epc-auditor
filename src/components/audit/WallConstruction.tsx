import type { AuditFormData } from '../../types';

const wallTypes      = ['Cavity Wall', 'Solid Brick', 'Timber Frame', 'System Built'];
const infillMaterials = ['Mineral Wool', 'Polystyrene Beads', 'Urea Formaldehyde Foam', 'None (Empty Cavity)'];

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

// Upgraded input tokens to match the dark slate figma design patterns cleanly
const labelCls = 'text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1';
const inputCls = 'w-full bg-surface-container border border-outline text-on-surface px-4 py-2.5 rounded-lg text-sm focus:border-primary focus:outline-none transition-all custom-select';

export function WallConstruction({ form, onChange }: Props) {
  return (
    <section className="bg-surface border border-outline p-6 rounded-xl shadow-sm">
      {/* Header Container */}
      <div className="flex items-center gap-3 mb-5 border-b border-outline/40 pb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">wall_art</span>
        <h3 className="text-base font-bold text-on-surface tracking-tight">Wall Construction</h3>
      </div>
      
      {/* Form Fields Grid Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className={labelCls}>Wall Type</label>
          <select className={inputCls} value={form.wallType} onChange={e => onChange({ wallType: e.target.value })}>
            {wallTypes.map(o => <option key={o} className="bg-surface-container">{o}</option>)}
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className={labelCls}>Insulation Thickness (mm)</label>
          <input 
            type="number" 
            placeholder="e.g. 100" 
            className={inputCls}
            value={form.insulationThicknessMm}
            onChange={e => onChange({ insulationThicknessMm: e.target.value ? Number(e.target.value) : '' })} 
          />
        </div>
        
        <div className="flex flex-col md:col-span-2">
          <label className={labelCls}>Infill Material</label>
          <select className={inputCls} value={form.infillMaterial} onChange={e => onChange({ infillMaterial: e.target.value })}>
            {infillMaterials.map(o => <option key={o} className="bg-surface-container">{o}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}