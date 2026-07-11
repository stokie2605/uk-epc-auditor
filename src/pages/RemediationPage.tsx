import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import type { RemediationPlan } from '../types';
import { PropertyBanner } from '../components/remediation/PropertyBanner';
import { CostImpactChart } from '../components/remediation/CostImpactChart';
import { RemediationCard } from '../components/remediation/RemediationCard';
import { FinancialSummary } from '../components/remediation/FinancialSummary';

export function RemediationPage() {
  const [params] = useSearchParams();
  const uprn = params.get('uprn') ?? 'demo';
  const [plan, setPlan]     = useState<RemediationPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getRemediationPlan(uprn).then(p => { setPlan(p); setLoading(false); });
  }, [uprn]);

  const handleAssign = async (actionId: string) => {
    await api.assignAction(actionId);
    // Refresh plan after assignment
    const updated = await api.getRemediationPlan(uprn);
    setPlan(updated);
  };

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-lg relative">
      {/* Property summary banner */}
      <PropertyBanner property={plan.property} />

      {/* Cost vs Impact chart */}
      <CostImpactChart actions={plan.actions} />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div className="flex flex-wrap gap-sm">
          <div className="px-md py-1.5 bg-error/10 text-error rounded-full border border-error/20 text-body-sm font-medium flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(255,180,171,0.6)]"></span> {plan.actions.length} Critical Actions
          </div>
          <div className="px-md py-1.5 bg-surface-container border border-outline-variant rounded-full text-body-sm font-medium text-on-surface-variant flex items-center gap-xs">
              Estimated Payback: <span className="text-on-surface font-bold">6.4 Years</span>
          </div>
        </div>
        <div className="flex items-center gap-xs bg-surface-container-low rounded-lg p-1 border border-outline-variant">
          <button className="flex items-center gap-sm px-md py-2 hover:bg-surface-bright transition-colors rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md border-r border-outline-variant">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            PDF
          </button>
          <button className="flex items-center gap-sm px-md py-2 hover:bg-surface-bright transition-colors rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px]">description</span>
            CSV
          </button>
        </div>
      </div>

      {/* Main grid: action cards + financial panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
        <div className="xl:col-span-2 space-y-md">
          {plan.actions.map(action => (
            <RemediationCard
              key={action.id}
              action={action}
              onAssign={handleAssign}
              onManage={(id) => console.log('manage', id)}
            />
          ))}
        </div>
        <div>
          <FinancialSummary financial={plan.financial} />
        </div>
      </div>
    </div>
  );
}
