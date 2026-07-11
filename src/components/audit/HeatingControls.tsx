import type { AuditFormData } from '../../types';

const heatSystems = ['Gas Combi Boiler', 'Heat Pump (Air Source)', 'Electric Storage Heaters'];
const thermostats = ['Smart TPI Thermostat', 'Mechanical Dial', 'TRVs Only'];

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

const labelCls = 'text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1';
const inputCls = 'w-full bg-surface-container border border-outline text-on-surface px-4 py-2.5 rounded-lg text-sm focus:border-primary focus:outline-none transition-all';

export function HeatingControls({ form, onChange }: Props) {
  return (
    <section className="bg-surface border border-outline p-6 rounded-xl shadow-sm">
      {/* Header Container */}
      <div className="flex items-center gap-3 mb-5 border-b border-outline/40 pb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">mode_fan</span>
        <h3 className="text-base font-bold text-on-surface tracking-tight">Heating Controls</h3>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className={labelCls}>Primary Heating System</label>
          <select className={inputCls} value={form.primaryHeatSystem} onChange={e => onChange({ primaryHeatSystem: e.target.value })}>
            {heatSystems.map(o => <option key={o} className="bg-surface-container">{o}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className={labelCls}>Thermostat Type</label>
          <select className={inputCls} value={form.thermostatType} onChange={e => onChange({ thermostatType: e.target.value })}>
            {thermostats.map(o => <option key={o} className="bg-surface-container">{o}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}