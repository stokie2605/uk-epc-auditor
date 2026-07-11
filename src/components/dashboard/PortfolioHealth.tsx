import { DonutChart } from '../ui/DonutChart';
import type { Alert } from '../../types';

interface PortfolioHealthProps {
  compliancePercent: number;
  quarterlyTarget: number;
  professionalSummary: string;
  alerts: Alert[];
}

const alertBorder: Record<Alert['severity'], string> = {
  error:   'border-error bg-error/5',
  info:    'border-secondary bg-secondary/5',
  success: 'border-green-500 bg-green-500/5',
};

export function PortfolioHealth({
  compliancePercent, quarterlyTarget, professionalSummary, alerts,
}: PortfolioHealthProps) {
  return (
    <div className="space-y-gutter">
      {/* Donut + target */}
      <div className="bg-surface-container-high border border-outline-variant rounded-lg p-lg shadow-lg">
        <h3 className="text-lg font-bold text-primary mb-lg">Portfolio Health</h3>

        <div className="relative flex items-center justify-center">
          <DonutChart percent={compliancePercent} />
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-primary">{compliancePercent}%</span>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
              Compliance
            </span>
          </div>
        </div>

        <div className="mt-lg space-y-md">
          <div className="flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">Target (Q1)</span>
            <span className="font-semibold text-primary">{quarterlyTarget}%</span>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full shadow-[0_0_8px_rgba(142,213,255,0.4)] transition-all duration-700"
              style={{ width: `${compliancePercent}%` }}
            />
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {professionalSummary}
          </p>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-surface-container-high border border-outline-variant rounded-lg p-lg shadow-lg">
        <h4 className="font-label-caps uppercase text-on-surface-variant mb-md text-[10px]">
          Recent Alerts
        </h4>
        <div className="space-y-md">
          {alerts.map(a => (
            <div key={a.id} className={`flex gap-md border-l-2 pl-md py-1 ${alertBorder[a.severity]}`}>
              <div>
                <p className="text-sm font-semibold text-on-surface">{a.title}</p>
                <p className="text-[10px] text-on-surface-variant">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-lg text-primary text-xs font-bold hover:underline underline-offset-4">
          View All Alerts
        </button>
      </div>
    </div>
  );
}
