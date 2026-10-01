// Pulsing placeholder block, like the mobile app's skeleton loaders
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-surface ${className}`} />;
}
