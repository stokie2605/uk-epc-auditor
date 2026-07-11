import type { RemediationProperty } from '../../types';
import { EpcBadge } from '../ui/EpcBadge';

interface PropertyBannerProps {
  property: RemediationProperty;
}

const statusColour: Record<string, string> = {
  FAILING:  'text-tertiary',
  'AT RISK': 'text-[#F58220]',
  PASSING:  'text-[#52AE32]',
};

export function PropertyBanner({ property }: PropertyBannerProps) {
  const { address, currentScore, targetScore, currentGrade, epcStatus } = property;

  return (
    <section className="relative overflow-hidden rounded-xl bg-surface-container border border-outline-variant p-lg shadow-xl shadow-black/20">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        {/* Left: address + scores */}
        <div className="space-y-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">{address}</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Action plan required to reach Grade C target by 2025
          </p>
          <div className="flex gap-md pt-xs flex-wrap">
            <div className="bg-surface-container-highest px-md py-sm rounded-lg border border-outline-variant">
              <p className="text-[10px] text-on-surface-variant font-label-md uppercase tracking-wider">Current Score</p>
              <p className="text-xl font-bold text-on-surface">
                {currentScore} <span className="text-sm font-normal text-on-surface-variant">/ 100</span>
              </p>
            </div>
            <div className="bg-primary/10 px-md py-sm rounded-lg border border-primary/20">
              <p className="text-[10px] text-primary font-label-md uppercase tracking-wider">Target Score</p>
              <p className="text-xl font-bold text-primary">
                {targetScore} <span className="text-sm font-normal text-primary/70">/ 100</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: EPC badge + status */}
        <div className="flex flex-col items-end gap-sm">
          <div className="flex items-center gap-lg">
            <div className="text-right">
              <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest">EPC Status</p>
              <p className={`font-headline-lg text-xl font-bold ${statusColour[epcStatus] ?? ''}`}>{epcStatus}</p>
            </div>
            <EpcBadge grade={currentGrade} size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
