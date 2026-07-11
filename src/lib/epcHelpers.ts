// ─────────────────────────────────────────────────────────────────────────────
// src/lib/epcHelpers.ts
// Utility functions for EPC grade colours, labels, and SAP score mapping.
// ─────────────────────────────────────────────────────────────────────────────

import type { EpcGrade } from '../types';

/** Official UK EPC band background colours */
export const EPC_COLOURS: Record<EpcGrade, string> = {
  A: '#008037',
  B: '#52AE32',
  C: '#8CBD1B',
  D: '#F5DB1F',
  E: '#F58220',
  F: '#ED732E',
  G: '#E02621',
};

/** Text colour for each EPC badge — dark for D (yellow), white for all others */
export const EPC_TEXT_COLOUR: Record<EpcGrade, string> = {
  A: '#ffffff',
  B: '#ffffff',
  C: '#000000',
  D: '#000000',
  E: '#ffffff',
  F: '#ffffff',
  G: '#ffffff',
};

/** Map a SAP score (0-100) to an EPC grade */
export function sapScoreToGrade(score: number): EpcGrade {
  if (score >= 92) return 'A';
  if (score >= 81) return 'B';
  if (score >= 69) return 'C';
  if (score >= 55) return 'D';
  if (score >= 39) return 'E';
  if (score >= 21) return 'F';
  return 'G';
}

/** Human-readable label for an EPC grade */
export function gradeLabel(grade: EpcGrade): string {
  const labels: Record<EpcGrade, string> = {
    A: 'Very Energy Efficient',
    B: 'Energy Efficient',
    C: 'Fairly Energy Efficient',
    D: 'Average',
    E: 'Inefficient',
    F: 'Very Inefficient',
    G: 'Extremely Inefficient',
  };
  return labels[grade];
}

/** Tailwind status chip colour classes for compliance statuses */
export function statusClasses(status: string): string {
  switch (status) {
    case 'Compliant':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
    case 'Pending':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    case 'Action Required':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
    default:
      return 'bg-surface-container text-on-surface-variant border-outline-variant';
  }
}

/** Format a pound value with commas */
export function formatGBP(value: number): string {
  return `£${value.toLocaleString('en-GB')}`;
}
