import type { AuditFormData } from '../../types';

const heatSystems = ['Gas Combi Boiler', 'Heat Pump (Air Source)', 'Electric Storage Heaters'];
const thermostats = ['Smart TPI Thermostat', 'Mechanical Dial', 'TRVs Only'];

const labelCls = 'font-label-md text-on-surface-variant';
const inputCls = 'w-full bg-surface-container border border-outline text-on-surface p-3 rounded-lg focus:ring-2 focus:ring-primary-container outline-none transition-all';

interface Props { form: AuditFormData; onChange: (f: Partial<AuditFormData>) => void; }

export function HeatingControls({ form, onChange }: Props) {
  return (
    <section className="bg-surface-container border border-outline p-lg rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary-container">mode_fan</span>
        <h3 className="font-headline-lg text-[20px]">Heating Controls</h3>
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
            {thermostats.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}
