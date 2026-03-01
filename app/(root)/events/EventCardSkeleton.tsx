// app/(root)/events/EventCardSkeleton.tsx
export default function EventCardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Banner skeleton */}
      <div className="aspect-[18/10] bg-gray-100 rounded-2xl mb-4" />

      {/* Content skeleton */}
      <div className="space-y-2.5">
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="h-5 w-4/5 bg-gray-100 rounded" />
        <div className="h-4 w-3/5 bg-gray-100 rounded" />
      </div>
    </div>
  );
}