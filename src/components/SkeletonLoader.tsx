const SkeletonLoader = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse bg-muted rounded-lg ${className}`}
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    />
  );
};

export const AudiobookCardSkeleton = () => {
  return (
    <div className="group relative w-40 sm:w-44 shrink-0 snap-start rounded-xl">
      <SkeletonLoader className="w-40 sm:w-44 aspect-[2/3]" />
      <div className="mt-2">
        <SkeletonLoader className="h-4 w-full mb-2" />
        <SkeletonLoader className="h-3 w-3/4" />
      </div>
    </div>
  );
};

export const AudiobookRowSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div
      className="overflow-x-auto scrollbar-hide px-4 lg:px-8"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-3 sm:gap-4 snap-x snap-mandatory pb-2 min-w-max">
        {Array.from({ length: count }).map((_, i) => (
          <AudiobookCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const CarouselSkeleton = () => {
  return (
    <div className="relative h-[58vh] min-h-[360px] max-h-[620px] overflow-hidden">
      <SkeletonLoader className="absolute inset-0 w-full h-full" />
      <div className="relative h-full max-w-[1440px] mx-auto px-4 lg:px-8 flex items-end pb-12">
        <div className="max-w-2xl w-full">
          <SkeletonLoader className="h-6 w-32 mb-4" />
          <SkeletonLoader className="h-16 w-full mb-3" />
          <SkeletonLoader className="h-4 w-2/3 mb-6" />
          <SkeletonLoader className="h-11 w-32" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
