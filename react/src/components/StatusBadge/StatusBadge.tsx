import { Info, Lightbulb, TriangleAlert, OctagonAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SEVERITY_LABELS } from '../../consts';
import type { Severity } from '../../types/review.types';
import styles from './statusBadge.module.scss';

const SEVERITY_ICONS: Record<Severity, LucideIcon> = {
  info: Info,
  suggestion: Lightbulb,
  warning: TriangleAlert,
  critical: OctagonAlert,
};

interface StatusBadgeProps {
  severity: Severity;
}

const StatusBadge = ({ severity }: StatusBadgeProps): JSX.Element => {
  const SeverityIcon = SEVERITY_ICONS[severity];

  return (
    <span className={`${styles.badge} ${styles[`badge--${severity}`]}`}>
      <SeverityIcon size={13} strokeWidth={2.25} aria-hidden="true" />
      {SEVERITY_LABELS[severity] ?? severity}
    </span>
  );
};

export default StatusBadge;
