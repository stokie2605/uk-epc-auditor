import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PropertyRecord } from '../../types';
import { EpcBadge } from '../ui/EpcBadge';
import { StatusChip } from '../ui/StatusChip';

interface AuditLedgerProps {
  properties: PropertyRecord[];
  total: number;
  page: number;
  onPageChange: (p: number) => void;
}

export function AuditLedger({ properties, total, page, onPageChange }: AuditLedgerProps) {
  const navigate = useNavigate();
  const totalPages = Math.ceil(total / 5);
  const [search, setSearch] = useState('');

  const filtered = search
    ? properties.filter(p =>
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.uprn.includes(search)
      )
    : properties;

  return (
    <div className="lg:col-span-3 bg-surface-container-high border border-outline-variant rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-lg py-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-container-highest">
        <h3 className="text-lg font-bold text-primary">
          Property Audit Ledger
        </h3>
        <div className="flex items-center gap-md w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter by address or UPRN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 sm:w-52 bg-surface-container border border-outline-variant rounded px-sm py-1.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            id="new-audit-btn"
            onClick={() => navigate('/audit')}
            className="bg-primary-container text-on-primary-container px-lg py-2 rounded text-sm font-bold hover:brightness-110 transition-all flex items-center gap-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-md">add_circle</span>
            New Audit
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/50 text-on-surface-variant">
              {['Property Address', 'EPC Rating', 'Last Audit Date', 'Status', ''].map(h => (
                <th key={h} className={`px-lg py-md font-semibold text-xs uppercase tracking-wider ${h.includes('EPC') ? 'text-center' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtered.map(p => (
              <tr
                key={p.uprn}
                onClick={() => navigate(`/remediation?uprn=${p.uprn}`)}
                className="hover:bg-surface-container transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(142,213,255,0.15)] hover:brightness-110 duration-150"
              >
                <td className="px-lg py-md">
                  <div className="font-semibold text-primary">{p.address}</div>
                  <div className="text-xs text-on-surface-variant">UPRN: {p.uprn}</div>
                </td>
                <td className="px-lg py-md flex justify-center">
                  <EpcBadge grade={p.epcGrade} />
                </td>
                <td className="px-lg py-md text-on-surface-variant font-data-mono">
                  {p.lastAuditDate}
                </td>
                <td className="px-lg py-md">
                  <StatusChip status={p.status} />
                </td>
                <td className="px-lg py-md text-right">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-lg py-md bg-surface-container-highest/50 border-t border-outline-variant flex justify-between items-center text-xs text-on-surface-variant">
        <span>Showing {filtered.length} of {total} properties</span>
        <div className="flex gap-md">
          <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
            className="hover:text-primary transition-colors disabled:opacity-40">
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`transition-colors ${page === n ? 'text-primary font-bold' : 'hover:text-primary'}`}
            >
              {n}
            </button>
          ))}
          <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
            className="hover:text-primary transition-colors disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
