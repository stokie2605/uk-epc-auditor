// ─────────────────────────────────────────────────────────────────────────────
// src/api/client.ts
//
// ██████╗  █████╗  ██████╗██╗  ██╗███████╗███╗   ██╗██████╗
// ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝████╗  ██║██╔══██╗
// ██████╔╝███████║██║     █████╔╝ █████╗  ██╔██╗ ██║██║  ██║
// ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██║╚██╗██║██║  ██║
// ██████╔╝██║  ██║╚██████╗██║  ██╗███████╗██║ ╚████║██████╔╝
//
// ─── PYTHON BACKEND INJECTION POINT ─────────────────────────────────────────
//
// Set your Python server URL in a .env file:
//   VITE_API_BASE_URL=http://127.0.0.1:8000
//
// Each function maps to a REST endpoint your backend should expose.
// While the backend is not connected, all functions return the MOCK_DATA
// objects below.  To connect your Python server:
//
//   1. Copy .env.example to .env and set VITE_API_BASE_URL
//   2. Replace `return MOCK_DATA.*` lines with `return fetch(...)` calls
//   3. No component code needs to change.
//
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PortfolioSummary,
  AuditLedgerResponse,
  Alert,
  RemediationPlan,
  AuditFormData,
  LiveEstimate,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? '' : 'http://127.0.0.1:8000');
void BASE_URL; // suppress unused warning until backend is connected

// ── Mock Data ─────────────────────────────────────────────────────────────────
// These objects exactly mirror the TypeScript interfaces in src/types/index.ts.
// When your Python backend is ready, each api.* function switches from returning
// mock data to calling fetch(BASE_URL + '/api/...'). 

const MOCK_DATA = {
  portfolioSummary: {
    totalAudited: 1248,
    totalAuditedTrend: '+4.2% MoM',
    averageEpcScore: 68,
    averageEpcGrade: 'C',
    pendingRemediations: 24,
    compliancePercent: 84,
    quarterlyTarget: 90,
    professionalSummary:
      'The current compliance status is steady at 84%. There is a notable cluster of Band D properties in the Midlands region that require reassessment following recent insulation retrofits.',
    epcDistribution: { A: 15, B: 25, C: 40, D: 12, E: 5, F: 2, G: 1 },
  } satisfies PortfolioSummary & { professionalSummary: string },

  auditLedger: {
    properties: [
      { uprn: '1000213944', address: '24 Baker St, Marylebone',        epcGrade: 'A', lastAuditDate: '14 Oct 2023', status: 'Compliant'        },
      { uprn: '4992013822', address: 'Apartment 402, Skyline Tower',   epcGrade: 'C', lastAuditDate: '12 Jan 2024', status: 'Pending'          },
      { uprn: '9283741103', address: '92 Victoria Rd, Swindon',         epcGrade: 'E', lastAuditDate: '22 Nov 2023', status: 'Action Required'  },
      { uprn: '3847291004', address: 'The Old Rectory, Cotswolds',      epcGrade: 'G', lastAuditDate: '05 Feb 2024', status: 'Action Required'  },
      { uprn: '5543210988', address: '15 Rosewood Terrace',             epcGrade: 'B', lastAuditDate: '28 Dec 2023', status: 'Compliant'        },
    ],
    total: 1248,
    page: 1,
    pageSize: 5,
  } satisfies AuditLedgerResponse,

  alerts: [
    { id: '1', severity: 'error',   title: 'EPC Expired',              description: '12 High Street — 2 hours ago',           timestamp: new Date(Date.now() - 7200000).toISOString()  },
    { id: '2', severity: 'info',    title: 'Audit Complete',            description: 'Oxford Business Park — 5 hours ago',      timestamp: new Date(Date.now() - 18000000).toISOString() },
    { id: '3', severity: 'success', title: 'Rating Improved (D → C)',   description: 'Canary Wharf Flat 12 — Yesterday',        timestamp: new Date(Date.now() - 86400000).toISOString() },
  ] satisfies Alert[],

  remediationPlan: {
    property: {
      uprn: '3847291004',
      address: '24 Baker St, Marylebone',
      currentScore: 42,
      targetScore: 71,
      currentGrade: 'E',
      epcStatus: 'FAILING',
    },
    actions: [
      { id: 'a1', icon: 'wall',     title: 'Install Cavity Wall Insulation',   description: 'Internal & external thermal envelope upgrade',   epcImpactPoints: 12, estimatedCostLow: 1500,  estimatedCostHigh: 2500,  status: 'NOT STARTED' },
      { id: 'a2', icon: 'lightbulb',title: 'Upgrade to Low Energy Lighting',   description: 'LED replacement for all communal areas',          epcImpactPoints: 4,  estimatedCostLow: 150,   estimatedCostHigh: 300,   status: 'IN PROGRESS' },
      { id: 'a3', icon: 'window',   title: 'Replace Single Glazed Windows',    description: 'Vacuum-insulated double glazing install',         epcImpactPoints: 18, estimatedCostLow: 8000,  estimatedCostHigh: 12000, status: 'NOT STARTED' },
    ],
    financial: {
      totalBudget: 24500,
      govGrantsAvailable: 4200,
      netInvestment: 20300,
      estimatedPaybackYears: 6.4,
      criticalActionCount: 12,
    },
  } satisfies RemediationPlan,

  liveEstimate: {
    sapScore: 62,
    epcGrade: 'D',
    thermalLoss: '0.38 W/m²K',
    co2EmissionsTYear: 2.4,
    improvementPotentialPoints: 18,
  } satisfies LiveEstimate,
};

// ── API Client ─────────────────────────────────────────────────────────────────
// Each function simulates a network request (200ms delay) so your components
// handle loading state correctly even before the real backend is connected.

async function fetchWithThrow(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ── Dashboard ──────────────────────────────────────────────────────────────

  /** GET /api/portfolio/summary */
  getPortfolioSummary: async (): Promise<typeof MOCK_DATA.portfolioSummary> => {
    return fetchWithThrow(`${BASE_URL}/api/portfolio/summary`);
  },

  /** GET /api/audits?page=n */
  getAuditLedger: async (page = 1): Promise<AuditLedgerResponse> => {
    return fetchWithThrow(`${BASE_URL}/api/audits?page=${page}`);
  },

  /** GET /api/alerts */
  getAlerts: async (): Promise<Alert[]> => {
    return fetchWithThrow(`${BASE_URL}/api/alerts`);
  },

  // ── Audit Workspace ────────────────────────────────────────────────────────

  /** POST /api/audits/estimate  — live SAP score based on form */
  estimateAudit: async (data: AuditFormData, signal?: AbortSignal): Promise<LiveEstimate> => {
    return fetchWithThrow(`${BASE_URL}/api/audits/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal
    });
  },

  /** POST /api/audits  — submit a completed audit form */
  submitAudit: async (data: AuditFormData): Promise<{ success: boolean; id: string }> => {
    return fetchWithThrow(`${BASE_URL}/api/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // ── Remediation ────────────────────────────────────────────────────────────

  /** GET /api/remediation/:uprn */
  getRemediationPlan: async (uprn: string): Promise<RemediationPlan> => {
    return fetchWithThrow(`${BASE_URL}/api/remediation/${uprn}`);
  },

  /** POST /api/remediation/:actionId/assign */
  assignAction: async (actionId: string): Promise<{ success: boolean }> => {
    return fetchWithThrow(`${BASE_URL}/api/remediation/${actionId}/assign`, { method: 'POST' });
  },
};
