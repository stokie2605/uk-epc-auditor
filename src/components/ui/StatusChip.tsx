import type { AuditStatus } from '../../types';
import { statusClasses } from '../../lib/epcHelpers';

interface StatusChipProps {
  status: AuditStatus | string;
}

export function StatusChip({ status }: StatusChipProps) {
  return (
    <span
      className={`px-sm py-0.5 text-xs font-bold rounded-full border ${statusClasses(status)}`}
    >
      {status}
    </span>
  );
}
