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
  icon, iconBg = 'bg-primary-fixed dark:bg-dark-surface-container-high',
  label, value, trend, trendVariant = 'neutral',
  children, alert = false,
}: MetricCardProps) {
  const trendColour =
    trendVariant === 'positive' ? 'text-green-600 dark:text-green-400' :
    trendVariant === 'negative' ? 'text-error dark:text-dark-error' :
    'text-on-surface-variant dark:text-dark-on-surface-variant';

  return (
    <div className="relative bg-surface-container-lowest dark:bg-dark-surface-container-high
                    border border-outline-variant dark:border-dark-outline-variant
                    rounded-lg p-lg shadow-card overflow-hidden">
      {/* Alert ping */}
      {alert && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-error dark:bg-dark-error opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-error dark:bg-dark-error" />
        </span>
      )}

      <div className="flex justify-between items-start mb-sm">
        <span className={`material-symbols-outlined text-primary dark:text-dark-primary ${iconBg} p-2 rounded`}>
          {icon}
        </span>
        {trend && (
          <span className={`text-xs font-semibold ${trendColour}`}>{trend}</span>
        )}
      </div>

      <h3 className="text-on-surface-variant dark:text-dark-on-surface-variant text-label-caps uppercase tracking-wider mb-xs">
        {label}
      </h3>
      <p className="text-4xl font-bold text-primary dark:text-dark-primary">{value}</p>
      {children}
    </div>
  );
}
