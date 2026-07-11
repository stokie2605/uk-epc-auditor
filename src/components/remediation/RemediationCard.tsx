import type { RemediationAction } from '../../types';

interface RemediationCardProps {
  action: RemediationAction;
  onAssign: (id: string) => void;
  onManage: (id: string) => void;
}

const statusBadge: Record<string, string> = {
  'NOT STARTED': 'bg-surface-container-highest text-on-surface-variant border-outline-variant',
  'IN PROGRESS': 'bg-primary/10 text-primary border-primary/20 font-bold',
  'COMPLETE':    'bg-[#52AE32]/10 text-[#52AE32] border-[#52AE32]/20 font-bold',
};

export function RemediationCard({ action, onAssign, onManage }: RemediationCardProps) {
  const { id, icon, title, description, epcImpactPoints, estimatedCostLow, estimatedCostHigh, status } = action;

  const formatCost = (n: number) => `£${n.toLocaleString('en-GB')}`;

  return (
    <div className="remediation-card-hover group relative bg-surface-container border border-outline-variant p-md rounded-xl transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-md items-start md:items-center">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant group-hover:bg-primary/10 transition-all shrink-0 ml-2">
          <span className="material-symbols-outlined text-primary">{icon}</span>
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <h3 className="font-body-md text-body-md font-bold text-on-surface">{title}</h3>
          <p className="text-sm text-on-surface-variant">{description}</p>
        </div>

        {/* Metrics + CTA */}
        <div className="flex flex-wrap items-center gap-md">
          <div className="text-right px-sm">
            <p className="text-[10px] text-on-surface-variant font-label-md uppercase">EPC Impact</p>
            <p className="font-label-md text-primary font-bold">+{epcImpactPoints} Points</p>
          </div>
          <div className="text-right px-sm">
            <p className="text-[10px] text-on-surface-variant font-label-md uppercase">Est. Cost</p>
            <p className="font-label-md text-on-surface">
              {formatCost(estimatedCostLow)} - {formatCost(estimatedCostHigh)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full border text-[11px] font-label-md ${statusBadge[status]}`}>
            {status}
          </span>
          {status !== 'COMPLETE' && (
            status === 'IN PROGRESS'
              ? <button id={`manage-${id}`} onClick={() => onManage(id)}
                  className="bg-surface-variant border border-outline-variant text-on-surface px-6 py-2 rounded-lg font-bold font-label-md text-label-md hover:bg-surface-bright transition-all">
                  MANAGE
                </button>
              : <button id={`assign-${id}`} onClick={() => onAssign(id)}
                  className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-bold font-label-md text-label-md hover:bg-primary transition-all shadow-lg active:scale-95">
                  ASSIGN
                </button>
          )}
        </div>
      </div>
    </div>
  );
}
