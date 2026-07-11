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
    <div className="space-y-lg">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">Construction &amp; Insulation Details</h1>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
          Precisely document the building fabric to calculate thermal efficiency.
        </p>
      </header>

      {submitted && (
        <div className="flex items-center gap-3 p-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-800 dark:text-green-300 text-sm font-semibold">
          <span className="material-symbols-outlined">check_circle</span>
          Audit submitted successfully — ID: {submitted}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-lg">
        {/* ── Form sections ─────────────────────────────────────────── */}
        <div className="flex-1 space-y-lg">
          <WallConstruction   form={form} onChange={handleChange} />
          <FloorDetails       form={form} onChange={handleChange} />
          <Glazing            form={form} onChange={handleChange} />
          <HeatingControls    form={form} onChange={handleChange} />
        </div>

        {/* ── Live estimate sidebar ──────────────────────────────────── */}
        {estimate && (
          <LiveEstimatePanel
            estimate={estimate}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
