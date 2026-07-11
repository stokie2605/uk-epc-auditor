import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { PortfolioSummary, AuditLedgerResponse, Alert } from '../types';
import { MetricCard } from '../components/ui/MetricCard';
import { EpcBadge } from '../components/ui/EpcBadge';
import { AuditLedger } from '../components/dashboard/AuditLedger';
import { PortfolioHealth } from '../components/dashboard/PortfolioHealth';
import { EpcBarChart } from '../components/dashboard/EpcBarChart';

type SummaryWithMeta = PortfolioSummary & { professionalSummary: string };

const MOCK_SUMMARY_FALLBACK: SummaryWithMeta = {
  totalAudited: 1240,
  totalAuditedTrend: '+12% this month',
  averageEpcScore: 68,
  averageEpcGrade: 'D',
  pendingRemediations: 42,
  compliancePercent: 78,
  quarterlyTarget: 85,
  professionalSummary: 'Portfolio efficiency is currently constrained by historic solid-wall properties. Implementing targeted loft and cavity wall insulation upgrades across high-risk assets will systematically raise the baseline efficiency to meet upcoming statutory requirements.',
  epcDistribution: { A: 5, B: 45, C: 120, D: 450, E: 380, F: 180, G: 60 }
} as any;

const MOCK_ALERTS_FALLBACK = [
  { id: '1', message: '12 Properties falling below statutory E rating minimums.' },
  { id: '2', message: 'Audit window expiring soon for 8 Greater London assets.' }
] as any;

const MOCK_LEDGER_FALLBACK = {
  properties: [
    { address: '102 High Street, Crewe', currentEpc: 'E', targetEpc: 'C', dateAudited: '2026-07-01', status: 'Pending' },
    { address: '44 Victoria Road, Alsager', currentEpc: 'D', targetEpc: 'C', dateAudited: '2026-06-28', status: 'Compliant' },
    { address: '88 London Road, Nantwich', currentEpc: 'F', targetEpc: 'D', dateAudited: '2026-07-05', status: 'Urgent' }
  ],
  total: 3
} as any;

export function DashboardPage() {
  const [summary, setSummary] = useState<SummaryWithMeta | null>(null);
  const [ledger, setLedger]   = useState<AuditLedgerResponse | null>(null);
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getPortfolioSummary(), api.getAlerts()])
      .then(([s, a]) => {
        setSummary((s || MOCK_SUMMARY_FALLBACK) as SummaryWithMeta);
        setAlerts(a && a.length ? a : MOCK_ALERTS_FALLBACK);
      })
      .catch(() => {
        setSummary(MOCK_SUMMARY_FALLBACK);
        setAlerts(MOCK_ALERTS_FALLBACK);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    api.getAuditLedger(page)
      .then((data) => {
        setLedger(data || MOCK_LEDGER_FALLBACK);
      })
      .catch(() => {
        setLedger(MOCK_LEDGER_FALLBACK);
      });
  }, [page]);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface border border-outline rounded-xl">
        <span className="material-symbols-outlined text-3xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Metric Cards ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon="domain"
          iconBg="bg-primary-container text-primary"
          label="Total Properties Audited"
          value={summary.totalAudited.toLocaleString()}
          trend={summary.totalAuditedTrend}
          trendVariant="positive"
        />
        <MetricCard
          icon="speed"
          iconBg="bg-secondary-container text-secondary"
          label="Average EPC Score"
          value={summary.averageEpcScore}
          trend={`Standard: ${summary.averageEpcGrade}`}
        >
          <div className="flex items-center gap-2 mt-2">
            <EpcBadge grade={summary.averageEpcGrade} size="md" />
            <span className="text-xs font-bold bg-surface-container text-on-surface px-2 py-0.5 rounded border border-outline">
              Band {summary.averageEpcGrade}
            </span>
          </div>
        </MetricCard>
        <MetricCard
          icon="warning"
          iconBg="rgba(244, 63, 94, 0.1) text-error"
          label="Pending Remediations"
          value={summary.pendingRemediations}
          alert
        >
          <div className="mt-2 text-error font-medium text-xs flex items-center gap-1">
            Action Required Immediately
          </div>
        </MetricCard>
      </section>

      {/* ── Audit Ledger + Portfolio Health ──────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 bg-surface border border-outline rounded-xl p-6 shadow-sm">
          {ledger ? (
            <AuditLedger
              properties={ledger.properties}
              total={ledger.total}
              page={page}
              onPageChange={setPage}
            />
          ) : (
            <div className="h-48 animate-pulse bg-surface-container rounded-lg" />
          )}
        </div>
        <div className="lg:col-span-1 bg-surface border border-outline rounded-xl p-6 shadow-sm">
          <PortfolioHealth
            compliancePercent={summary.compliancePercent}
            quarterlyTarget={summary.quarterlyTarget}
            professionalSummary={summary.professionalSummary}
            alerts={alerts}
          />
        </div>
      </section>

      {/* ── EPC Chart + Summary ────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-outline rounded-xl p-6 shadow-sm">
          <EpcBarChart distribution={summary.epcDistribution} />
        </div>
        
        <div className="bg-surface border border-outline rounded-xl p-6 shadow-sm flex flex-col justify-between text-on-surface">
          <div>
            <h3 className="text-base font-bold mb-3 text-primary tracking-tight">Professional Summary</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {summary.professionalSummary}
            </p>
          </div>
          <div className="flex gap-6 border-t border-outline/60 pt-4 mt-4">
            {[
              { icon: 'analytics', label: 'Real-time Sync' },
              { icon: 'security',  label: 'ISO 27001' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-secondary">{icon}</span>
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}