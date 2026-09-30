// Centered icon + message, like the mobile app's empty screens
export default function EmptyState({ Icon, title, subtitle, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      {Icon && <Icon size={64} className="text-border" />}
      <p className="text-base font-semibold">{title}</p>
      {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      {children}
    </div>
  );
}
