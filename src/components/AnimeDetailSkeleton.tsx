export default function AnimeDetailSkeleton() {
  return (
    <div className="bg-gray-950 min-h-screen pt-16 animate-pulse">
      <div className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-4 w-32 bg-white/10 rounded mb-10" />
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="shrink-0 w-full max-w-xs mx-auto lg:mx-0 aspect-[2/3] rounded-2xl bg-white/10 border border-white/5" />
            <div className="flex-1 space-y-4">
              <div className="h-6 w-40 bg-white/10 rounded" />
              <div className="h-10 sm:h-12 max-w-xl bg-white/10 rounded" />
              <div className="h-4 w-64 bg-white/10 rounded" />
              <div className="flex gap-2">
                <div className="h-7 w-16 bg-white/10 rounded-full" />
                <div className="h-7 w-20 bg-white/10 rounded-full" />
              </div>
              <div className="space-y-2 max-w-3xl pt-2">
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-5/6" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="h-14 bg-white/10 rounded-xl border border-white/5" />
                <div className="h-14 bg-white/10 rounded-xl border border-white/5" />
              </div>
            </div>
          </div>
          <div className="mt-14 pt-10 border-t border-white/10 space-y-4">
            <div className="h-8 w-48 bg-white/10 rounded" />
            <div className="aspect-video max-w-4xl rounded-xl bg-white/10 border border-white/5" />
            <div className="h-8 w-56 bg-white/10 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-white/10 border border-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
