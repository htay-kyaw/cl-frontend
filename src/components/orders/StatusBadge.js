// Order status pill; colours match the mobile app's STATUS_COLOR map
const STYLES = {
  pending:    'bg-warning/15 text-warning',
  processing: 'bg-info/15 text-info',
  confirm:    'bg-success/15 text-success',
  delivered:  'bg-success/15 text-success',
  cancelled:  'bg-danger/15 text-danger',
};

// the API's "confirm" status uses the "confirmed" translation key
export const statusKey = (status) => (status === 'confirm' ? 'confirmed' : status);

export default function StatusBadge({ status, t }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status] ?? 'bg-surface text-text-secondary'}`}>
      {t(statusKey(status))}
    </span>
  );
}
