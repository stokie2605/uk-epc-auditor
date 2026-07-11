import type { RemediationProperty } from '../../types';
import { EpcBadge } from '../ui/EpcBadge';

interface PropertyBannerProps {
  property: RemediationProperty;
}

const statusColour: Record<string, string> = {
  FAILING:  'text-error dark:text-dark-error',
  'AT RISK': 'text-[#F58220]',
  PASSING:  'text-[#52AE32]',
};

export function PropertyBanner({ property }: PropertyBannerProps) {
  const { address, currentScore, targetScore, currentGrade, epcStatus } = property;

  return (
    <section className="relative overflow-hidden rounded-xl bg-surface dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant p-lg shadow-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        {/* Left: address + scores */}
        <div className="space-y-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary dark:text-dark-primary">location_on</span>
            <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">{address}</h2>
          </div>
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
            Action plan required to reach Grade C target
          </p>
          <div className="flex gap-md pt-xs flex-wrap">
            <div className="bg-surface-container-low dark:bg-dark-surface-container px-md py-sm rounded-lg border border-outline-variant dark:border-dark-outline-variant">
              <p className="text-[10px] text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase tracking-wider">Current Score</p>
              <p className="text-xl font-bold text-on-surface dark:text-dark-on-surface">
                {currentScore} <span className="text-sm font-normal text-on-surface-variant dark:text-dark-on-surface-variant">/ 100</span>
              </p>
            </div>
            <div className="bg-secondary-container/30 dark:bg-dark-surface-container px-md py-sm rounded-lg border border-secondary/20 dark:border-dark-outline">
              <p className="text-[10px] text-secondary dark:text-dark-primary font-semibold uppercase tracking-wider">Target Score</p>
              <p className="text-xl font-bold text-secondary dark:text-dark-primary">
                {targetScore} <span className="text-sm font-normal opacity-70">/ 100</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: EPC badge + status */}
        <div className="flex items-center gap-lg">
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase tracking-widest">EPC Status</p>
            <p className={`text-xl font-bold ${statusColour[epcStatus] ?? ''}`}>{epcStatus}</p>
          </div>
          <EpcBadge grade={currentGrade} size="lg" />
        </div>
      </div>
    </section>
  );
}
