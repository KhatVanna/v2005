import { SkeletonBone } from "@/components/product/product-detail-skeleton";

export function HomePageSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading homepage">
      {/* Hero */}
      <div className="relative min-h-[28rem] overflow-hidden bg-[#0F172A] sm:min-h-[32rem] lg:min-h-[36rem]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-[#1e293b]" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:py-24">
          <SkeletonBone className="mb-3 h-3 w-24 rounded-full bg-white/15" />
          <SkeletonBone className="mb-4 h-10 w-full max-w-lg rounded-lg bg-white/20 sm:h-14" />
          <SkeletonBone className="mb-8 h-4 w-full max-w-md rounded-full bg-white/15" />
          <div className="flex gap-3">
            <SkeletonBone className="h-11 w-28 rounded-lg bg-white/25" />
            <SkeletonBone className="h-11 w-28 rounded-lg bg-white/15" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBone className="h-3 w-16 rounded-full" />
            <SkeletonBone className="h-8 w-40 rounded-lg" />
          </div>
          <SkeletonBone className="h-4 w-16 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBone key={index} className="min-h-48 rounded-2xl" />
          ))}
        </div>
      </section>

      {/* Product grids */}
      {[0, 1].map((section) => (
        <div key={section} className={section === 0 ? "bg-muted/40" : undefined}>
          <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <SkeletonBone className="h-8 w-36 rounded-lg" />
                <SkeletonBone className="h-3 w-52 rounded-full" />
              </div>
              <SkeletonBone className="h-9 w-24 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: section === 0 ? 5 : 10 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <SkeletonBone className="aspect-square w-full rounded-xl" />
                  <SkeletonBone className="h-3 w-2/3 rounded-full" />
                  <SkeletonBone className="h-3 w-full rounded-full" />
                  <SkeletonBone className="h-4 w-1/2 rounded-full" />
                </div>
              ))}
            </div>
          </section>
        </div>
      ))}
    </div>
  );
}
