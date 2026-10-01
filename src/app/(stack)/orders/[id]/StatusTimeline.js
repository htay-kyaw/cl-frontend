import { IoCheckmark, IoClose } from 'react-icons/io5';
import { statusKey } from '@/components/orders/StatusBadge';

const STEPS = ['pending', 'processing', 'confirm', 'delivered'];

// Where the order is in the shop's flow; cancelled orders show a single stopped state
export default function StatusTimeline({ status, t }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
        <IoClose size={18} /> {t('cancelled')}
      </div>
    );
  }

  const current = STEPS.indexOf(status);

  return (
    <ol className="flex items-start rounded-xl border border-border bg-card px-3 py-4">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
            {i > 0 && (
              <span className={`absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2 ${i <= current ? 'bg-primary' : 'bg-border'}`} />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                done ? 'border-primary bg-primary text-white' : 'border-border bg-card'
              } ${i === current ? 'ring-4 ring-primary/20' : ''}`}
            >
              {done && <IoCheckmark size={14} />}
            </span>
            <span className={`text-[11px] leading-tight ${i === current ? 'font-semibold text-primary' : 'text-text-secondary'}`}>
              {t(statusKey(step))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
