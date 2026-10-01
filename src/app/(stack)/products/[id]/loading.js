import Skeleton from '@/components/Skeleton';

// Like the mobile ProductDetailSkeleton; also lets Next.js prefetch the shell for instant taps
export default function ProductLoading() {
  return (
    <div aria-busy="true">
      <div className="h-14 md:hidden" />
      <div className="md:grid md:grid-cols-2 md:gap-10 md:pt-14">
        <Skeleton className="aspect-square w-full md:rounded-2xl" />
        <div className="flex flex-col gap-3 p-5 md:p-0">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-7 w-40 rounded" />
          <Skeleton className="mt-2 h-12 w-full rounded-xl" />
          <Skeleton className="mt-2 h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
