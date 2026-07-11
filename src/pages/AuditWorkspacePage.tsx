import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { AuditFormData, LiveEstimate } from '../types';
import { WallConstruction } from '../components/audit/WallConstruction';
import { FloorDetails } from '../components/audit/FloorDetails';
import { Glazing } from '../components/audit/Glazing';
import { HeatingControls } from '../components/audit/HeatingControls';
import { LiveEstimatePanel } from '../components/audit/LiveEstimatePanel';

const DEFAULT_FORM: AuditFormData = {
  uprn: '',
  wallType: 'Cavity Wall',
  insulationThicknessMm: '',
  infillMaterial: 'Mineral Wool',
  floorAreaM2: '',
  floorConstruction: 'Suspended Timber',
  windowType: 'Double Glazing',
  frameMaterial: 'uPVC',
  glazingYear: '',
  primaryHeatSystem: 'Gas Combi Boiler',
  thermostatType: 'Smart TPI Thermostat',
};

export function AuditWorkspacePage() {
  const [form, setForm]           = useState<AuditFormData>(DEFAULT_FORM);
  const [estimate, setEstimate]   = useState<LiveEstimate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api.estimateAudit(form, controller.signal)
         .then(setEstimate)
         .catch(err => {
           if (err.name !== 'AbortError') console.error(err);
         });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form]);

  const handleChange = (patch: Partial<AuditFormData>) => {
    setForm(prev => ({ ...prev, ...patch }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitAudit(form);
      if (res.success) setSubmitted(res.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Standardized framework spacing parameters for robust v4 layout structures */
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      {/* ── Form sections ─────────────────────────────────────────── */}
      <div className="flex-1 space-y-6 w-full">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">
            Construction & Insulation Details
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Precisely document the building fabric to calculate thermal efficiency.
          </p>
        </header>

        {submitted && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold mb-6">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Audit submitted successfully — ID: {submitted}
          </div>
        )}

        <div className="space-y-6">
          <WallConstruction   form={form} onChange={handleChange} />
          <FloorDetails       form={form} onChange={handleChange} />
          <Glazing            form={form} onChange={handleChange} />
          <HeatingControls    form={form} onChange={handleChange} />
        </div>
      </div>

      {/* ── Live estimate sidebar ──────────────────────────────────── */}
      {estimate && (
        <div className="w-full lg:w-[320px] shrink-0 sticky top-24">
          <LiveEstimatePanel
            estimate={estimate}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      )}
    </div>
  );
}