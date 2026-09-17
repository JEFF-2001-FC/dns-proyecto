import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-24 rounded-full" />
        <Skeleton className="h-9 w-60" />
      </div>
      <Skeleton className="h-[92px] rounded-3xl lg:hidden" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[112px] rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-3xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-3xl" />
      </div>
    </div>
  );
}
