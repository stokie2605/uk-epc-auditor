import type { RemediationAction } from '../../types';

interface RemediationCardProps {
  action: RemediationAction;
  onAssign: (id: string) => void;
  onManage: (id: string) => void;
}

const statusBadge: Record<string, string> = {
  'NOT STARTED': 'bg-surface-container-highest dark:bg-dark-surface-container text-on-surface-variant dark:text-dark-on-surface-variant border-outline-variant dark:border-dark-outline-variant',
  'IN PROGRESS':  'bg-secondary-container/20 dark:bg-dark-surface-container text-secondary dark:text-dark-primary border-secondary/20 dark:border-dark-outline font-bold',
  'COMPLETE':     'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 font-bold',
};

export function RemediationCard({ action, onAssign, onManage }: RemediationCardProps) {
  const { id, icon, title, description, epcImpactPoints, estimatedCostLow, estimatedCostHigh, status } = action;

  const formatCost = (n: number) => `£${n.toLocaleString('en-GB')}`;

  return (
    <div className="group relative bg-surface dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant p-md rounded-xl transition-all duration-300 hover:shadow-modal hover:border-secondary/30 dark:hover:border-dark-primary/30">
      <div className="flex flex-col md:flex-row gap-md items-start md:items-center">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-surface-container dark:bg-dark-surface-container flex items-center justify-center border border-outline-variant dark:border-dark-outline-variant group-hover:bg-secondary/5 transition-all shrink-0 ml-2">
          <span className="material-symbols-outlined text-primary dark:text-dark-primary">{icon}</span>
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-on-surface dark:text-dark-on-surface text-sm">{title}</h3>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">{description}</p>
        </div>

        {/* Metrics + CTA */}
        <div className="flex flex-wrap items-center gap-md">
          <div className="text-right px-sm">
            <p className="text-[10px] text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase">EPC Impact</p>
            <p className="text-sm font-bold text-primary dark:text-dark-primary">+{epcImpactPoints} pts</p>
          </div>
          <div className="text-right px-sm">
            <p className="text-[10px] text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase">Est. Cost</p>
            <p className="text-sm font-mono text-on-surface dark:text-dark-on-surface">
              {formatCost(estimatedCostLow)} – {formatCost(estimatedCostHigh)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full border text-[11px] ${statusBadge[status]}`}>
            {status}
          </span>
          {status !== 'COMPLETE' && (
            status === 'IN PROGRESS'
              ? <button id={`manage-${id}`} onClick={() => onManage(id)}
                  className="bg-surface-container-high dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface px-6 py-2 rounded-lg font-bold text-xs hover:brightness-105 transition-all">
                  MANAGE
                </button>
              : <button id={`assign-${id}`} onClick={() => onAssign(id)}
                  className="bg-primary dark:bg-dark-primary text-on-primary dark:text-dark-on-primary px-6 py-2 rounded-lg font-bold text-xs hover:opacity-90 transition-all shadow-md active:scale-95">
                  ASSIGN
                </button>
          )}
        </div>
      </div>
    </div>
  );
}
