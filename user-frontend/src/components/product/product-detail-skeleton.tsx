export function SkeletonBone({ className = "" }: { className?: string }) {
  return <div className={`skeleton-bone ${className}`} aria-hidden />;
}

export function ProductDetailSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8"
      role="status"
      aria-live="polite"
      aria-label="Loading product"
    >
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <SkeletonBone className="h-3 w-12 rounded-full" />
        <SkeletonBone className="h-3 w-3 rounded-full" />
        <SkeletonBone className="h-3 w-16 rounded-full" />
        <SkeletonBone className="h-3 w-3 rounded-full" />
        <SkeletonBone className="h-3 w-28 rounded-full" />
      </div>

      <div className="mb-4 space-y-2 sm:mb-6">
        <SkeletonBone className="h-3 w-20 rounded-full" />
        <SkeletonBone className="h-8 w-3/4 max-w-xl rounded-lg sm:h-10" />
      </div>

      {/* Desktop: L192-style thumbs | main image | details */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-[72px_minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBone key={index} className="aspect-square w-full rounded-lg" />
          ))}
        </div>

        <SkeletonBone className="aspect-square w-full rounded-2xl" />

        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <SkeletonBone className="h-9 w-40 rounded-lg" />
          <SkeletonBone className="h-4 w-28 rounded-full" />
          <SkeletonBone className="h-4 w-36 rounded-full" />
          <div className="space-y-2 pt-2">
            <SkeletonBone className="h-3 w-16 rounded-full" />
            <SkeletonBone className="h-10 w-32 rounded-lg" />
          </div>
          <SkeletonBone className="h-12 w-full rounded-lg" />
          <SkeletonBone className="h-12 w-full rounded-lg" />
          <SkeletonBone className="h-10 w-full rounded-lg" />
          <div className="space-y-2 pt-3">
            <SkeletonBone className="h-3 w-full rounded-full" />
            <SkeletonBone className="h-3 w-5/6 rounded-full" />
            <SkeletonBone className="h-3 w-2/3 rounded-full" />
          </div>
        </div>
      </div>

      {/* Mobile / tablet: stacked like the live product page */}
      <div className="grid gap-5 sm:gap-8 lg:hidden">
        <div className="space-y-3">
          <SkeletonBone className="aspect-square w-full rounded-xl sm:rounded-2xl" />
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBone key={index} className="h-16 w-16 shrink-0 rounded-lg sm:h-20 sm:w-20" />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-5">
          <SkeletonBone className="h-8 w-36 rounded-lg" />
          <SkeletonBone className="h-4 w-28 rounded-full" />
          <SkeletonBone className="h-4 w-40 rounded-full" />
          <SkeletonBone className="mt-2 h-10 w-28 rounded-lg" />
          <SkeletonBone className="h-12 w-full rounded-lg" />
          <SkeletonBone className="h-12 w-full rounded-lg" />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <SkeletonBone className="h-6 w-40 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBone className="aspect-square w-full rounded-xl" />
              <SkeletonBone className="h-3 w-3/4 rounded-full" />
              <SkeletonBone className="h-3 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
