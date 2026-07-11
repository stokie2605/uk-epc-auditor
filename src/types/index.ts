// ─────────────────────────────────────────────────────────────────────────────
// src/types/index.ts
// Shared TypeScript interfaces for the Compliance Dashboard.
// These types mirror the exact shape your Python backend API should return.
// ─────────────────────────────────────────────────────────────────────────────

export type EpcGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type AuditStatus = 'Compliant' | 'Pending' | 'Action Required';

export type RemediationStatus = 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETE';

export type AlertSeverity = 'error' | 'info' | 'success';

// ── Portfolio summary (Dashboard page) ───────────────────────────────────────
export interface PortfolioSummary {
  totalAudited: number;
  totalAuditedTrend: string;       // e.g. "+4.2% MoM"
  averageEpcScore: number;
  averageEpcGrade: EpcGrade;
  pendingRemediations: number;
  compliancePercent: number;       // 0-100
  quarterlyTarget: number;         // 0-100
  epcDistribution: EpcDistribution;
}

export interface EpcDistribution {
  A: number; B: number; C: number; D: number; E: number; F: number; G: number;
}

// ── Alert (Dashboard sidebar) ─────────────────────────────────────────────────
export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;               // ISO 8601
}

// ── Property / Audit Ledger row ───────────────────────────────────────────────
export interface PropertyRecord {
  uprn: string;
  address: string;
  epcGrade: EpcGrade;
  lastAuditDate: string;           // e.g. "14 Oct 2023"
  status: AuditStatus;
}

export interface AuditLedgerResponse {
  properties: PropertyRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Audit Workspace form ──────────────────────────────────────────────────────
export interface AuditFormData {
  uprn: string;
  wallType: string;
  insulationThicknessMm: number | '';
  infillMaterial: string;
  floorAreaM2: number | '';
  floorConstruction: string;
  windowType: string;
  frameMaterial: string;
  glazingYear: number | '';
  primaryHeatSystem: string;
  thermostatType: string;
}

export interface LiveEstimate {
  sapScore: number;                // 0-100
  epcGrade: EpcGrade;
  thermalLoss: string;             // e.g. "0.38 W/m²K"
  co2EmissionsTYear: number;
  improvementPotentialPoints: number;
}

// ── Remediation Plan ──────────────────────────────────────────────────────────
export interface RemediationProperty {
  uprn: string;
  address: string;
  currentScore: number;
  targetScore: number;
  currentGrade: EpcGrade;
  epcStatus: 'PASSING' | 'FAILING' | 'AT RISK';
}

export interface RemediationAction {
  id: string;
  title: string;
  description: string;
  icon: string;                    // Material Symbol name
  epcImpactPoints: number;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  status: RemediationStatus;
}

export interface FinancialSummary {
  totalBudget: number;
  govGrantsAvailable: number;
  netInvestment: number;
  estimatedPaybackYears: number;
  criticalActionCount: number;
}

export interface RemediationPlan {
  property: RemediationProperty;
  actions: RemediationAction[];
  financial: FinancialSummary;
}
