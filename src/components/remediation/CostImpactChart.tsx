import type { RemediationAction } from '../../types';

interface CostImpactChartProps {
  actions: RemediationAction[];
}

/**
 * Simple SVG scatter plot: X = estimated cost midpoint, Y = EPC impact points.
 * Each dot is a RemediationAction. Hover reveals a tooltip.
 */
export function CostImpactChart({ actions }: CostImpactChartProps) {
  const maxCost   = Math.max(...actions.map(a => a.estimatedCostHigh), 1);
  const maxImpact = Math.max(...actions.map(a => a.epcImpactPoints), 1);
  const W = 400, H = 180, PAD = 32;

  const toX = (cost: number) => PAD + ((cost / maxCost) * (W - PAD * 2));
  const toY = (pts: number) => H - PAD - ((pts / maxImpact) * (H - PAD * 2));
  return (
    <div className="bg-surface dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant rounded-xl p-lg shadow-card">
      <div className="flex justify-between items-center mb-md">
        <h3 className="text-[10px] font-bold text-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-widest">
          Cost vs. Impact Analysis
        </h3>
        <div className="flex gap-md">
          <span className="flex items-center gap-1 text-[10px] text-on-surface-variant dark:text-dark-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary dark:bg-dark-primary inline-block" /> High Impact
          </span>
          <span className="flex items-center gap-1 text-[10px] text-on-surface-variant dark:text-dark-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-outline dark:bg-dark-outline inline-block" /> Low Impact
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
        {/* Axes */}
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#c5c6cd" strokeWidth="1" />
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#c5c6cd" strokeWidth="1" />

        {/* Axis labels */}
        <text x={PAD / 2 - 4} y={H / 2} fontSize="8" fill="#75777d" textAnchor="middle" transform={`rotate(-90,${PAD / 2 - 4},${H / 2})`}>
          EPC Impact
        </text>
        <text x={W / 2} y={H - 2} fontSize="8" fill="#75777d" textAnchor="middle">
          Estimated Cost (£)
        </text>

        {/* Data points */}
        {actions.map(a => {
          const costMid = (a.estimatedCostLow + a.estimatedCostHigh) / 2;
          const cx = toX(costMid);
          const cy = toY(a.epcImpactPoints);
          const r  = 4 + (a.epcImpactPoints / maxImpact) * 6;

          return (
            <g key={a.id}>
              <title>{`${a.title}\n+${a.epcImpactPoints} pts | £${costMid.toLocaleString('en-GB')}`}</title>
              <circle
                cx={cx} cy={cy} r={r}
                fill="#091426"
                className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              />
              <text x={cx} y={cy - r - 3} fontSize="7" fill="#45474c" textAnchor="middle">
                {a.title.split(' ').slice(0, 2).join(' ')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
