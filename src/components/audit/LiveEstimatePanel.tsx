
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
    <aside className="w-full lg:w-80 flex flex-col gap-lg sticky top-[64px] h-fit pb-12">
      {/* Main estimate card */}
      <div className="bg-white dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant p-lg rounded-xl shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">Live Estimate</h4>
          <span className="bg-secondary-container dark:bg-dark-surface-container text-on-secondary-container dark:text-dark-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
            Real-time
          </span>
        </div>

        {/* SVG gauge */}
        <div className="flex flex-col items-center justify-center py-6 border-b border-outline-variant dark:border-dark-outline-variant mb-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 136 136">
              <circle cx="68" cy="68" r="58" fill="transparent" stroke="#e5eeff" strokeWidth="8" />
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
              <span className="text-[12px] font-semibold mt-1 text-on-surface-variant dark:text-dark-on-surface-variant">Rating</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">
              {sapScore} <span className="text-sm font-normal text-on-surface-variant dark:text-dark-on-surface-variant">/ 100</span>
            </p>
            <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Current SAP Score</p>
          </div>
        </div>

        {/* Summary data */}
        <div className="space-y-3 mb-6">
          {[
            { label: 'Thermal Loss',          value: thermalLoss,                    cls: 'text-primary dark:text-dark-primary'  },
            { label: 'CO₂ Emissions',          value: `${co2EmissionsTYear} t/year`,  cls: 'text-on-surface dark:text-dark-on-surface' },
            { label: 'Improvement Potential',  value: `+${improvementPotentialPoints} Points`, cls: 'text-[#F58220]' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant dark:text-dark-on-surface-variant">{label}</span>
              <span className={`font-mono font-semibold ${cls}`}>{value}</span>
            </div>
          ))}
        </div>

        <button
          id="submit-audit-btn"
          onClick={() => onSubmit()}
          disabled={submitting}
          className="w-full bg-primary dark:bg-dark-primary text-on-primary dark:text-dark-on-primary py-4 rounded-lg font-bold text-base flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Save Audit Draft'}
          <span className="material-symbols-outlined">send</span>
        </button>
        <p className="mt-4 text-[10px] text-center text-on-surface-variant dark:text-dark-on-surface-variant leading-tight">
          Portfolio estimate only. This heuristic is for interface demonstration and is not an official EPC or SAP assessment.
        </p>
      </div>

      {/* Heuristic note */}
      <div className="mt-lg p-md rounded-lg bg-surface-variant dark:bg-dark-surface-variant flex items-start gap-3">
        <span className="material-symbols-outlined text-primary dark:text-dark-primary mt-0.5">lightbulb</span>
        <div>
          <p className="text-xs font-bold text-on-surface dark:text-dark-on-surface mb-1">Heuristic Note</p>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed">
            Increasing wall insulation to &gt;100mm would raise this property to a <strong>C rating</strong> automatically.
          </p>
        </div>
      </div>
    </aside>
  );
}
