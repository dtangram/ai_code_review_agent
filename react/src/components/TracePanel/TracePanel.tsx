import { ArrowRight, CheckCircle2, Loader2, MessageSquare, CircleCheck, TriangleAlert, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useReviewContext } from '../../context/ReviewContext';
import { EMPTY_STATE_MESSAGE } from '../../consts';
import type { AgentEventType } from '../../types/review.types';
import styles from './tracePanel.module.scss';

const EVENT_ICONS: Record<AgentEventType, LucideIcon> = {
  tool_call: ArrowRight,
  tool_result: CheckCircle2,
  thinking: Loader2,
  comment: MessageSquare,
  done: CircleCheck,
  error: TriangleAlert,
};

const TracePanel = (): JSX.Element => {
  const { trace } = useReviewContext();

  return (
    <section className={styles.panel} aria-live="polite" aria-label="Agent reasoning trace">
      <h2 className={styles.heading}>
        <Activity size={18} strokeWidth={2} aria-hidden="true" />
        Agent trace
      </h2>

      {trace.length === 0 ? (
        <p className={styles.empty}>{EMPTY_STATE_MESSAGE}</p>
      ) : (
        <ol className={styles.list}>
          {trace.map(({ type, label, detail, timestamp }, index) => {
            const EventIcon = EVENT_ICONS[type];
            return (
              <li className={styles.item} key={`${timestamp}-${index}`}>
                <span className={`${styles.icon} ${styles[`icon--${type}`]}`} aria-hidden="true">
                  <EventIcon size={14} strokeWidth={2.25} />
                </span>
                <span className={styles.body}>
                  <p className={styles.label}>{label}</p>
                  {detail && type !== 'done' && <p className={styles.detail}>{detail}</p>}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default TracePanel;
