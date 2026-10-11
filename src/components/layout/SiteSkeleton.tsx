// Shown while the content document is loading (ContentProvider status 'loading').
// Mirrors the header + hero layout so nothing jumps when content arrives.
function Bar({ className }: { className: string }) {
  return <div className={`rounded-control bg-white/[0.06] ${className}`} />;
}

export default function SiteSkeleton() {
  return (
    <div className="min-h-dvh bg-canvas" aria-busy="true">
      <p role="status" className="sr-only">
        Loading…
      </p>
      <div className="h-(--header-h) border-b border-line bg-navy">
        <div className="page-container flex h-full items-center justify-between">
          <Bar className="h-5 w-32" />
          <div className="hidden items-center gap-6 md:flex">
            <Bar className="h-4 w-14" />
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-24" />
            <Bar className="h-4 w-16" />
            <Bar className="h-11 w-28 rounded-full" />
          </div>
          <Bar className="h-11 w-11 md:hidden" />
        </div>
      </div>
      <div className="page-container motion-safe:animate-pulse">
        {typeof window !== 'undefined' && window.location.pathname !== '/' ? (
          <div className="pt-10 sm:pt-14 lg:pt-16">
            <Bar className="h-10 w-64" />
            <Bar className="mt-4 h-5 w-full max-w-xl" />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <Bar className="h-72 rounded-card" />
              <Bar className="h-72 rounded-card" />
            </div>
          </div>
        ) : (
        <div className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:py-16">
          <div>
            <Bar className="h-4 w-56" />
            <Bar className="mt-6 h-12 w-full max-w-lg" />
            <Bar className="mt-5 h-6 w-4/5 max-w-md" />
            <Bar className="mt-6 h-4 w-full max-w-xl" />
            <Bar className="mt-3 h-4 w-11/12 max-w-xl" />
            <Bar className="mt-3 h-4 w-3/5 max-w-xl" />
            <div className="mt-8 flex gap-3">
              <Bar className="h-11 w-40 rounded-full" />
              <Bar className="h-11 w-32 rounded-full" />
            </div>
          </div>
          <Bar className="mx-auto aspect-[4/5] w-full max-w-[22rem] rounded-panel sm:max-w-[26rem] lg:max-w-none" />
        </div>
        )}
      </div>
    </div>
  );
}
