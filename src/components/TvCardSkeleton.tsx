export default function TvCardSkeleton() {
  return (
    <div className="aspect-[2/3] rounded-xl bg-gray-900 border border-white/5 overflow-hidden animate-pulse">
      <div className="h-[58%] bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  );
}
