import Skeleton from '@/components/Skeleton';

export default function OrderLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 pt-[4.5rem] md:px-0 md:pt-20" aria-busy="true">
      <Skeleton className="h-5 w-40 rounded" />
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}
