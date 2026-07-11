import type { LiveEstimate } from '../../types';
import { EpcBadge } from '../ui/EpcBadge';
import { EPC_COLOURS } from '../../lib/epcHelpers';

interface LiveEstimatePanelProps {
  estimate: LiveEstimate;
  onSubmit: () => void;
  submitting: boolean;
}

export function LiveEstimatePanel({ estimate, onSubmit, submitting }: LiveEstimatePanelProps) {
  const { sapScore, epcGrade, thermalLoss, co2EmissionsTYear, improvementPotentialPoints } = estimate;
  const circumference = 2 * Math.PI * 58;
  const dashOffset = circumference - (sapScore / 100) * circumference;

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-lg lg:sticky lg:top-0 h-fit pb-12">
      <div className="bg-surface-container-high border border-outline p-lg rounded-xl shadow-lg transition-all">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-headline-lg text-[18px] text-on-surface">Live Estimate</h4>
          <span className="bg-primary-container/20 text-primary-container px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
            Real-time
          </span>
        </div>

        {/* EPC Gauge */}
        <div className="flex flex-col items-center justify-center py-6 border-b border-outline-variant/50 mb-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 136 136">
              <circle cx="68" cy="68" r="58" fill="transparent" className="text-surface-variant" stroke="currentColor" strokeWidth="8" />
              <circle
                cx="68" cy="68" r="58" fill="transparent"
                stroke={EPC_COLOURS[epcGrade]}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <EpcBadge grade={epcGrade} size="lg" />
              <span className="text-[12px] font-label-md mt-2 text-on-surface-variant">Rating</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="font-headline-lg text-[24px]">
              {sapScore} <span className="text-[14px] font-normal text-on-surface-variant">/ 100</span>
            </p>
            <p className="font-body-sm text-on-surface-variant">Current SAP Score</p>
          </div>
        </div>

        {/* Summary data */}
        <div className="space-y-4 mb-8">
          {[
            { label: 'Thermal Loss',          value: thermalLoss,                    cls: 'text-primary-container'  },
            { label: 'CO₂ Emissions',          value: `${co2EmissionsTYear} t/year`,  cls: 'text-on-surface' },
            { label: 'Improvement Potential',  value: `+${improvementPotentialPoints} Points`, cls: 'text-tertiary' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant">{label}</span>
              <span className={`font-mono font-semibold ${cls}`}>{value}</span>
            </div>
          ))}
        </div>

        <button
          id="submit-audit-btn"
          onClick={() => onSubmit()}
          disabled={submitting}
          className="w-full bg-primary-container text-on-primary-container py-4 rounded-lg font-bold text-[16px] flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-xl shadow-primary-container/10 disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Save Audit Draft'}
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>

      {/* Heuristic note */}
      <div className="bg-surface-container border-l-4 border-primary-container p-md rounded-lg">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-primary-container">info</span>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-on-surface">Compliance Tip</p>
            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              Increasing wall insulation to &gt;100mm would raise this property to a <strong>C rating</strong> automatically.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
