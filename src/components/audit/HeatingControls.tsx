import type { AuditFormData } from '../../types';

const heatSystems  = ['Gas Combi Boiler', 'Heat Pump (Air Source)', 'Electric Storage Heaters', 'Oil Boiler'];
const thermoTypes  = ['Smart TPI Thermostat', 'Mechanical Dial', 'TRVs Only', 'No Controls'];
const labelCls = 'text-xs font-semibold text-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wide';
const inputCls = 'w-full bg-white dark:bg-dark-surface-container border border-outline dark:border-dark-outline text-on-surface dark:text-dark-on-surface p-3 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary outline-none transition-all text-sm';

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

export function HeatingControls({ form, onChange }: Props) {
  return (
    <section className="bg-surface dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant p-lg rounded-xl shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary dark:text-dark-primary">mode_fan</span>
        <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">Heating Controls</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Primary Heating System</label>
          <select className={inputCls} value={form.primaryHeatSystem} onChange={e => onChange({ primaryHeatSystem: e.target.value })}>
            {heatSystems.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Thermostat Type</label>
          <select className={inputCls} value={form.thermostatType} onChange={e => onChange({ thermostatType: e.target.value })}>
            {thermoTypes.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}
