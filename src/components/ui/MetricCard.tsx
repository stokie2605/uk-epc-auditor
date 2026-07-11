interface MetricCardProps {
  icon: string;
  iconBg?: string;
  label: string;
  value: string | number;
  trend?: string;
  trendVariant?: 'positive' | 'negative' | 'neutral';
  children?: React.ReactNode;
  alert?: boolean;
}

export function MetricCard({
  icon, iconBg = 'bg-primary/10 text-primary',
  label, value, trend, trendVariant = 'neutral',
  children, alert = false,
}: MetricCardProps) {
  const trendColour =
    trendVariant === 'positive' ? 'text-green-400' :
    trendVariant === 'negative' ? 'text-error' :
    'text-on-surface-variant';

  const valueColour = alert ? 'text-error' : 'text-primary';

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-lg p-lg shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-start mb-sm">
        <span className={`material-symbols-outlined p-2 rounded ${iconBg}`}>
          {icon}
        </span>
        {trend && (
          <span className={`text-xs font-semibold ${trendColour}`}>{trend}</span>
        )}
      </div>

      <h3 className="text-on-surface-variant font-label-caps uppercase tracking-wider mb-xs">
        {label}
      </h3>
      <p className={`text-4xl font-bold ${valueColour}`}>{value}</p>
      
      {/* Alert ping */}
      {alert && (
        <span className="flex h-2 w-2 rounded-full bg-error absolute top-3 right-3 animate-ping"></span>
      )}

      {children}
    </div>
  );
}
