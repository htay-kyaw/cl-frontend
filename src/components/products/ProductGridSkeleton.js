import Skeleton from '../Skeleton';
import { gridClass } from './ProductGrid';

export default function ProductGridSkeleton({ count = 10 }) {
  return (
    <div className={gridClass} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`overflow-hidden rounded-xl border border-border bg-card ${i >= 4 ? 'hidden sm:block' : ''}`}>
          <Skeleton className="aspect-square" />
          <div className="flex flex-col gap-1.5 p-2">
            <Skeleton className="h-3.5 w-[85%] rounded" />
            <Skeleton className="h-3.5 w-[55%] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
