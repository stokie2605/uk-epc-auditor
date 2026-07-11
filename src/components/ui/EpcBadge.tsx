import type { EpcGrade } from '../../types';
import { EPC_COLOURS, EPC_TEXT_COLOUR } from '../../lib/epcHelpers';

interface EpcBadgeProps {
  grade: EpcGrade;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-[11px]',
  md: 'w-7 h-7 text-[13px]',
  lg: 'w-12 h-12 text-2xl',
};

export function EpcBadge({ grade, size = 'md' }: EpcBadgeProps) {
  return (
    <span
      className={`epc-badge font-extrabold rounded-sm ${SIZE_CLASSES[size]}`}
      style={{
        backgroundColor: EPC_COLOURS[grade],
        color: EPC_TEXT_COLOUR[grade],
      }}
      title={`EPC Rating: ${grade}`}
    >
      {grade}
    </span>
  );
}
