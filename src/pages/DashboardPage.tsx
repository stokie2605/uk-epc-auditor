import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { PortfolioSummary, AuditLedgerResponse, Alert } from '../types';
import { MetricCard } from '../components/ui/MetricCard';
import { EpcBadge } from '../components/ui/EpcBadge';
import { AuditLedger } from '../components/dashboard/AuditLedger';
import { PortfolioHealth } from '../components/dashboard/PortfolioHealth';
import { EpcBarChart } from '../components/dashboard/EpcBarChart';

type SummaryWithMeta = PortfolioSummary & { professionalSummary: string };

export function DashboardPage() {
  const [summary, setSummary] = useState<SummaryWithMeta | null>(null);
  const [ledger, setLedger]   = useState<AuditLedgerResponse | null>(null);
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getPortfolioSummary(), api.getAlerts()]).then(([s, a]) => {
      setSummary(s as SummaryWithMeta);
      setAlerts(a);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    api.getAuditLedger(page).then(setLedger);
  }, [page]);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      {/* ── Metric Cards ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <MetricCard
          icon="domain"
          iconBg="bg-primary/10 text-primary"
          label="Total Properties Audited"
          value={summary.totalAudited.toLocaleString()}
          trend={summary.totalAuditedTrend}
          trendVariant="positive"
        />
        <MetricCard
          icon="speed"
          iconBg="bg-secondary/10 text-secondary"
          label="Average EPC Score"
          value={summary.averageEpcScore}
          trend={`Standard: ${summary.averageEpcGrade}`}
        >
          <div className="flex items-baseline gap-sm">
            <EpcBadge grade={summary.averageEpcGrade} size="md" />
            <span className="text-sm font-bold text-black bg-[#8CBD1B] px-sm py-0.5 rounded">Band {summary.averageEpcGrade}</span>
          </div>
        </MetricCard>
        <MetricCard
          icon="warning"
          iconBg="bg-error/10 text-error"
          label="Pending Remediations"
          value={summary.pendingRemediations}
          alert
        >
          <div className="mt-xs text-error font-medium text-xs flex items-center gap-1">
            Action Required Immediately
          </div>
        </MetricCard>
      </section>

      {/* ── Audit Ledger + Portfolio Health ──────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-gutter items-start">
        {ledger ? (
          <AuditLedger
            properties={ledger.properties}
            total={ledger.total}
            page={page}
            onPageChange={setPage}
          />
        ) : (
          <div className="lg:col-span-3 h-48 animate-pulse bg-surface-container rounded-lg" />
        )}
        <div className="lg:col-span-1">
          <PortfolioHealth
            compliancePercent={summary.compliancePercent}
            quarterlyTarget={summary.quarterlyTarget}
            professionalSummary={summary.professionalSummary}
            alerts={alerts}
          />
        </div>
      </section>

      {/* ── EPC Chart + Summary ────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <EpcBarChart distribution={summary.epcDistribution} />
        <div className="bg-primary border border-outline-variant rounded-lg p-lg shadow-lg flex flex-col justify-center text-on-primary">
          <h3 className="text-2xl font-bold mb-md font-display-lg">Professional Summary</h3>
          <p className="text-sm opacity-90 mb-lg leading-relaxed">
            {summary.professionalSummary}
          </p>
          <div className="flex gap-lg">
            {[
              { icon: 'analytics', label: 'Real-time Sync' },
              { icon: 'security',  label: 'ISO 27001' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-sm">
                <span className="material-symbols-outlined">{icon}</span>
                <span className="text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
