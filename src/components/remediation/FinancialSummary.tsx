import type { FinancialSummary as FinSummary } from '../../types';
import { formatGBP } from '../../lib/epcHelpers';

interface FinancialSummaryProps {
  financial: FinSummary;
}

export function FinancialSummary({ financial }: FinancialSummaryProps) {
  const { totalBudget, govGrantsAvailable, netInvestment, estimatedPaybackYears, criticalActionCount } = financial;

  return (
    <div className="space-y-lg">
      {/* Financial breakdown */}
      <div className="bg-surface dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant rounded-xl p-md shadow-card">
        <h4 className="text-[10px] font-bold text-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-widest mb-md">
          Financial Summary
        </h4>
        <div className="space-y-sm text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant dark:text-dark-on-surface-variant">Total Budget</span>
            <span className="text-on-surface dark:text-dark-on-surface font-bold">{formatGBP(totalBudget)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant dark:text-dark-on-surface-variant">Gov Grants Available</span>
            <span className="text-primary dark:text-dark-primary font-bold">- {formatGBP(govGrantsAvailable)}</span>
          </div>
          <hr className="border-outline-variant/30 dark:border-dark-outline-variant/30 my-1" />
          <div className="flex justify-between">
            <span className="font-bold text-on-surface dark:text-dark-on-surface">Net Investment</span>
            <span className="text-xl font-bold text-primary dark:text-dark-primary">{formatGBP(netInvestment)}</span>
          </div>
        </div>
      </div>

      {/* Action summary badges */}
      <div className="flex flex-wrap gap-sm">
        <div className="px-md py-1.5 bg-error-container dark:bg-dark-error-container text-error dark:text-dark-error rounded-full border border-error/10 text-sm font-medium flex items-center gap-xs">
          <span className="w-2 h-2 rounded-full bg-error dark:bg-dark-error animate-pulse" />
          {criticalActionCount} Critical Actions
        </div>
        <div className="px-md py-1.5 bg-surface-container dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-full text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant flex items-center gap-xs">
          Payback: <span className="text-on-surface dark:text-dark-on-surface font-bold">{estimatedPaybackYears} yrs</span>
        </div>
      </div>
    </div>
  );
}
