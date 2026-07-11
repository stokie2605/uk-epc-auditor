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
        <span className="material-symbols-outlined text-4xl text-on-surface-variant dark:text-dark-on-surface-variant animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary dark:text-dark-primary">Remediation Action Plan</h1>
        <div className="flex gap-xs bg-surface-container-low dark:bg-dark-surface-container rounded-lg p-1 border border-outline-variant dark:border-dark-outline-variant">
          <button className="flex items-center gap-sm px-md py-2 hover:bg-surface-bright dark:hover:bg-dark-surface-container-high transition-colors rounded text-on-surface-variant dark:text-dark-on-surface-variant text-xs font-semibold border-r border-outline-variant dark:border-dark-outline-variant">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>PDF
          </button>
          <button className="flex items-center gap-sm px-md py-2 hover:bg-surface-bright dark:hover:bg-dark-surface-container-high transition-colors rounded text-on-surface-variant dark:text-dark-on-surface-variant text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px]">description</span>CSV
          </button>
        </div>
      </div>

      {/* Property summary banner */}
      <PropertyBanner property={plan.property} />

      {/* Cost vs Impact chart */}
      <CostImpactChart actions={plan.actions} />

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
