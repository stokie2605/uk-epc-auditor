import type { FinancialSummary as FinSummary } from '../../types';
import { formatGBP } from '../../lib/epcHelpers';

interface FinancialSummaryProps {
  financial: FinSummary;
}

export function FinancialSummary({ financial }: FinancialSummaryProps) {
  const { totalBudget, govGrantsAvailable, netInvestment } = financial;

  return (
    <div className="space-y-lg">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-md shadow-lg">
        <h4 className="font-label-md text-xs text-on-surface-variant uppercase tracking-widest mb-md font-bold">
          Financial Summary
        </h4>
        <div className="space-y-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant text-sm">Total Budget</span>
            <span className="text-on-surface font-bold">{formatGBP(totalBudget)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant text-sm">Gov Grants Available</span>
            <span className="text-primary font-bold">- {formatGBP(govGrantsAvailable)}</span>
          </div>
          <hr className="border-outline-variant/30" />
          <div className="flex justify-between pt-sm">
            <span className="text-on-surface font-bold">Net Investment</span>
            <span className="text-xl font-bold text-primary">{formatGBP(netInvestment)}</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden shadow-lg">
        <div className="p-md bg-surface-container-high border-b border-outline-variant flex justify-between items-center">
          <span className="font-label-md text-label-md text-on-surface font-bold">Compliance Map</span>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer hover:text-primary transition-colors">open_in_new</span>
        </div>
        <div className="h-48 relative">
          <div className="w-full h-full bg-cover bg-center grayscale-[0.6] opacity-40" data-location="London" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDslF88nqRPVSMoMVmh_0SZCM7kTrx4jkmXgx6QzK5X4Wn7YRHe9DEdzXchJ9K2qRJNtXViyRzazSr5-tUsRAw90dQ3BUEn6Z3t5LAlljYL1GjIeh67s6jdlt3SwZJlOIAqxBbjh29aGU3oKbC6fvNgKQZIQmRF1VgnR7r-NeRMtMv25oDKi_q8icoGs5wAd8RGPtxm14oGk8l-iP_Shu9UDdSL4XvkiQyZcK7VXq5aUJcJjt843-mEV-56_KZ2B_pj8vxnr_fi8MM')" }}></div>
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-primary rounded-full animate-ping absolute opacity-30"></div>
            <div className="w-6 h-6 bg-primary rounded-full relative border-2 border-surface-container shadow-[0_0_15px_rgba(123,208,255,0.6)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
