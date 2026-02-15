// components/events/EventCardSkeleton.tsx
export default function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Banner skeleton */}
      <div className="aspect-[16/10] bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-10 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-4/5 bg-gray-200 rounded" />
        <div className="h-3.5 w-3/5 bg-gray-200 rounded" />
        <div className="h-3.5 w-2/5 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
