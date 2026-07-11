import type { EpcDistribution } from '../../types';
import { EPC_COLOURS } from '../../lib/epcHelpers';

interface EpcBarChartProps {
  distribution: EpcDistribution;
}

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

export function EpcBarChart({ distribution }: EpcBarChartProps) {
  const max = Math.max(...Object.values(distribution));

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-lg p-lg shadow-lg h-64 flex flex-col">
      <h3 className="font-label-caps text-on-surface-variant mb-lg text-[10px] uppercase">
        Rating Distribution
      </h3>
      <div className="flex-1 flex items-end justify-between gap-sm pt-md">
        {GRADES.map(grade => {
          const pct = max > 0 ? (distribution[grade] / max) * 100 : 0;
          return (
            <div
              key={grade}
              title={`Grade ${grade}: ${distribution[grade]}%`}
              className="w-full rounded-t cursor-pointer transition-all duration-300 hover:brightness-110"
              style={{
                height: `${Math.max(pct, 2)}%`,
                backgroundColor: EPC_COLOURS[grade],
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-sm">
        {GRADES.map(g => (
          <span key={g} className="w-full text-center text-[10px] font-bold text-on-surface-variant">
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
